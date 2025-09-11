import {
  getAsientoContableMultidimensionPdf,
  getAsientoContablePdf,
  getAsientosByParams,
  getEntryDto,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { EntryDtoInterface, PaginatedResponseType } from '@/types';
import { useSnackbar } from 'notistack';

export const useAsientoAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchAsietoView = async (entryId: number) => {
    showLoading();

    try {
      const response = await getEntryDto(entryId);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return false;
      }
      return response as EntryDtoInterface;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchDownloadPdf = async (id: number) => {
    showLoading();

    try {
      const response = await getAsientoContablePdf(id);

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

  const fetchDownloadPdfMultidimension = async (id: number) => {
    showLoading();

    try {
      const response = await getAsientoContableMultidimensionPdf(id);

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

  const fetchMainAsiento = async (
    branchId: number | null,
    isAutomatic: boolean | null,
    movementTypeIdList: number | null,
    stateIdList: number | null,
    startDate: string | null,
    endDate: string | null,
    byCurrentMonth: boolean | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getAsientosByParams(
        branchId,
        isAutomatic,
        movementTypeIdList,
        stateIdList,
        startDate,
        endDate,
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

  return {
    fetchAsietoView,
    fetchDownloadPdf,
    fetchDownloadPdfMultidimension,
    fetchMainAsiento,
  };
};
