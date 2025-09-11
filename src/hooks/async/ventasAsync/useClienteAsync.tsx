import {
  getClientById,
  getClientCategoryList,
  getClientePersonaByCliente,
  saveFichaCLiente,
  updateFichaCliente,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { handleApiError } from '@/functions';
import { ServerResponseType } from '@/store';
import { ClientPersonCreditPostType, PersonClientType } from '@/types';
import { useSnackbar } from 'notistack';

export const useClienteAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchSave = async (
    clientePersonPostType: ClientPersonCreditPostType
  ) => {
    showLoading();

    try {
      const response = await saveFichaCLiente(clientePersonPostType);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as ClientPersonCreditPostType;
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchUpdate = async (
    clientePersonPostType: ClientPersonCreditPostType,
    clientId: number
  ) => {
    showLoading();

    try {
      const response = await updateFichaCliente(
        clientePersonPostType,
        clientId
      );

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as ClientPersonCreditPostType;
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchGetClientById = async (clientId: number) => {
    showLoading();

    try {
      const response = await getClientById(clientId);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response;
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchGetClientCategoryList = async () => {
    showLoading();

    try {
      const response = await getClientCategoryList();

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response;
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchClientPersonaByClientId = async (clientId: number) => {
    showLoading();

    try {
      const response = await getClientePersonaByCliente(clientId);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as PersonClientType;
    } catch (error) {
      handleApiError(error);
    }
  };
  return {
    fetchSave,
    fetchUpdate,
    fetchGetClientById,
    fetchGetClientCategoryList,
    fetchClientPersonaByClientId,
  };
};
