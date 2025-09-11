import {
  getInvoicesToRetain,
  getMainRetencionCliente,
  getRetencionClienteById,
  isRetentionDocumentNumberAvailable,
  saveRetencionCliente,
  updateRetencionCliente,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import {
  FacturasForRetencionType,
  PaginatedResponseType,
  RetencionGetType,
  RetencionPostPutType,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useRetencionClienteAsync = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainPage = async (
    startDate: string | null,
    endDate: string | null,
    documentNumber: number | null,
    branchId: number | null,
    clientId: number | null,
    value: number | null,
    byCurrentMonth: boolean | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getMainRetencionCliente(
        startDate,
        endDate,
        documentNumber,
        branchId,
        clientId,
        value,
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

  const fetchIsDocumentNumberAvailable = async (
    clientId: number,
    retentionNumber: string
  ): Promise<boolean> => {
    showLoading();

    try {
      const response = await isRetentionDocumentNumberAvailable(
        clientId,
        retentionNumber
      );

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return false;
      }
      return !!response;
    } catch (error) {
      hideLoading();

      return false;
    }
  };

  const fetchInvoices = async (clientId: number, isPettyCash: boolean) => {
    showLoading();

    try {
      const response = await getInvoicesToRetain(clientId, isPettyCash);
      hideLoading();
      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }

      return response as FacturasForRetencionType[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchSave = async (body: RetencionPostPutType) => {
    showLoading();

    try {
      const response = await saveRetencionCliente(body);

      hideLoading();

      enqueueSnackbar(response.message, {
        variant: response.status === 200 ? 'success' : 'error',
      });
    } catch (error) {
      hideLoading();
    }
  };

  const fetchUpdate = async (body: RetencionPostPutType, id: number) => {
    showLoading();

    try {
      const response = await updateRetencionCliente(body, id);

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
      const response = await getRetencionClienteById(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return response;
      }
      return response as RetencionGetType;
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchMainPage,
    fetchIsDocumentNumberAvailable,
    fetchInvoices,
    fetchSave,
    fetchUpdate,
    fetchById,
  };
};
