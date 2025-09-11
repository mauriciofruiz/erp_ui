import {
  getMain,
  getRetecionProveedorPdf,
  getRetencionResponseById,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { PaginatedResponseType, RetencionResponseInterface } from '@/types';
import { useSnackbar } from 'notistack';

export const useRetencionProveedorAsync = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainPageRP = async (
    startDate: string | null,
    endDate: string | null,
    retentionNumber: number | null,
    invoiceNumber: number | null,
    providerId: number | null,
    retentionValue: number | null,
    invoiceValue: number | null,
    branchId: number | null,
    stateId: number | null,
    userId: number | null,
    byCurrentMonth: boolean | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getMain(
        startDate,
        endDate,
        retentionNumber,
        invoiceNumber,
        providerId,
        retentionValue,
        invoiceValue,
        branchId,
        stateId,
        userId,
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

  const fetchById = async (id: number) => {
    showLoading();

    try {
      const response = await getRetencionResponseById(id);
      hideLoading();
      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }

      return response as RetencionResponseInterface;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchRetencionProveedorPdf = async (id: number) => {
    showLoading();

    try {
      const response = await getRetecionProveedorPdf(id);
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

  return {
    fetchMainPageRP,
    fetchById,
    fetchRetencionProveedorPdf,
  };
};
