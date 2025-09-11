import {
  getNotaCreditoById,
  getNotaCreditoProvByParams,
  saveNotaCredito,
  updateNotaCredito,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { NotaCreditoProveedorSender, PaginatedResponseType } from '@/types';
import { useSnackbar } from 'notistack';

export const useNotaCreditoProveedorAsyc = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainNotaCreditoP = async (
    startDate: string | null,
    endDate: string | null,
    documentNumber: number | null,
    userId: number | null,
    providerId: number | null,
    stateIdList: number | null,
    value: number | null,
    typeId: number | null,
    byCurrentMonth: boolean | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getNotaCreditoProvByParams(
        startDate,
        endDate,
        documentNumber,
        userId,
        providerId,
        stateIdList,
        value,
        typeId,
        byCurrentMonth,
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

  const fetchSaveNC = async (body: NotaCreditoProveedorSender) => {
    showLoading();

    try {
      const response = await saveNotaCredito(body);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchUpdateNC = async (
    body: NotaCreditoProveedorSender,
    id: number
  ) => {
    showLoading();

    try {
      const response = await updateNotaCredito(id, body);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchNCById = async (id: number) => {
    showLoading();

    try {
      const response = await getNotaCreditoById(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response;
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchMainNotaCreditoP,
    fetchSaveNC,
    fetchUpdateNC,
    fetchNCById,
  };
};
