import { getLastPeriods, getPeriodoByParams, savePeriodo } from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { PaginatedResponseType, PeriodInterface } from '@/types';
import { useSnackbar } from 'notistack';

export const usePeriodosAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainPeriodos = async () => {
    showLoading();

    try {
      const response = await getLastPeriods();

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as PeriodInterface[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchDetallePeriodo = async (
    moduleId: number,
    startDate: string | null,
    endDate: string | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getPeriodoByParams(
        moduleId,
        startDate,
        endDate,
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

  const fetchSavePeriodo = async (body: PeriodInterface) => {
    showLoading();

    try {
      const response = await savePeriodo(body);

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
    fetchMainPeriodos,
    fetchDetallePeriodo,
    fetchSavePeriodo,
  };
};
