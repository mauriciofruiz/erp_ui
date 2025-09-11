import {
  getNotaCreditoClienteById,
  getNotaCreditoClienteByParams,
  saveNotaCreditoCliente,
  updateNotaCreditoCliente,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import {
  NotaCreditoGetType,
  NotaCreditoPostType,
  PaginatedResponseType,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useNotaCreditoCAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainPage = async (
    stateIdList: string | null,
    clientId: number | null,
    documentNumber: string | null,
    invoiceNumber: string | null,
    branchId: number | null,
    ncTypeId: number | null,
    startDate: string | null,
    endDate: string | null,
    currentMonth: boolean | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getNotaCreditoClienteByParams(
        stateIdList,
        clientId,
        documentNumber,
        invoiceNumber,
        branchId,
        ncTypeId,
        startDate,
        endDate,
        currentMonth,
        page,
        limit,
        sortDirection,
        sortField
      );

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as PaginatedResponseType;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchSave = async (body: NotaCreditoPostType) => {
    showLoading();

    try {
      const response = await saveNotaCreditoCliente(body);

      hideLoading();

      enqueueSnackbar(response.message, {
        variant: response.status === 200 ? 'success' : 'error',
      });
    } catch (error) {
      hideLoading();
    }
  };

  const fetchUpdate = async (body: NotaCreditoPostType, id: number) => {
    showLoading();

    try {
      const response = await updateNotaCreditoCliente(body, id);

      hideLoading();

      const { message } = (response as ServerResponseType).message;
      enqueueSnackbar(message, {
        variant: response.status === 200 ? 'success' : 'error',
      });
    } catch (error) {
      hideLoading();
    }
  };

  const fetchById = async (id: number) => {
    showLoading();

    try {
      const response = await getNotaCreditoClienteById(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return response;
      }
      return response as NotaCreditoGetType;
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchMainPage,
    fetchSave,
    fetchUpdate,
    fetchById,
  };
};
