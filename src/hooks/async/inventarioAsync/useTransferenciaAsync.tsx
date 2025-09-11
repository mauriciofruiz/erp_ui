import {
  getTransferById,
  getTransferByParams,
  getTransferenciaPdf,
  saveTransferencia,
  updateTransferencia,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import {
  PaginatedResponseType,
  TransferenciaGet,
  TransferenciaPost,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useTransferenciaAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainTransferencias = async (
    startDate: string | null,
    endDate: string | null,
    numTransfer: number | null,
    state: number | null,
    origin: number | null,
    destiny: number | null,
    byCurrentMonth: boolean | null,
    page: number | null,
    limit: number | null,
    sortDirection: string,
    sortField: string
  ) => {
    showLoading();

    try {
      const response = await getTransferByParams(
        startDate,
        endDate,
        numTransfer,
        state,
        origin,
        destiny,
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

  const fetchSaveTransfer = async (body: TransferenciaPost) => {
    showLoading();

    try {
      const response = await saveTransferencia(body);

      hideLoading();

      enqueueSnackbar(response.message, {
        variant: response.status === 200 ? 'success' : 'error',
      });
    } catch (error) {
      hideLoading();
    }
  };

  const fetchUpdateTransfer = async (id: number, body: TransferenciaPost) => {
    showLoading();

    try {
      const response = await updateTransferencia(id, body);

      hideLoading();

      const { message } = (response as ServerResponseType).message;
      enqueueSnackbar(message, {
        variant: response.status === 200 ? 'success' : 'error',
      });
    } catch (error) {
      hideLoading();
    }
  };

  const fetchTransferenciaPdf = async (id: number) => {
    showLoading();

    try {
      const response = await getTransferenciaPdf(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as Blob;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchById = async (id: number) => {
    showLoading();

    try {
      const response = await getTransferById(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as TransferenciaGet;
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchMainTransferencias,
    fetchSaveTransfer,
    fetchUpdateTransfer,
    fetchTransferenciaPdf,
    fetchById,
  };
};
