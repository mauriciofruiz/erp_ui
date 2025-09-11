import { getEgresoCajaByParams, getEgresoPdf } from '@/backend';
import { useSnackbar } from 'notistack';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { PaginatedResponseType } from '@/types';

export const useEgresoCajaAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainPage = async (
    stateIds: string | null,
    branchId: number | null,
    flowOutId: number | null,
    amount: number | null,
    description: string | null,
    userId: number | null,
    byCurrentMonth: boolean,
    startDate: string | null,
    endDate: string | null,
    page: number | null,
    limit: number | null,
    sortField: string | null,
    sortDirection: string | null
  ) => {
    showLoading();

    try {
      const response = await getEgresoCajaByParams(
        stateIds,
        branchId,
        flowOutId,
        amount,
        description,
        userId,
        byCurrentMonth,
        startDate,
        endDate,
        page,
        limit,
        sortField,
        sortDirection
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

  const fetchEgresoPdf = async (id: number) => {
    showLoading();

    try {
      const response = await getEgresoPdf(id);
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
    fetchMainPage,
    fetchEgresoPdf,
  };
};
