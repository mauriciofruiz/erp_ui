import {
  getByIdLiquidacion,
  getLiquidacionByAperturaImp,
  getLiquidacionImportacionPdf,
  getLiquidacionMain,
  saveLiquidacion,
  updateLiquidacion,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import {
  LiquidacionInterface,
  LiquidacionPackedInterface,
  PaginatedResponseType,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useLiquidacionAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainPage = async (
    stateIdList: string | null,
    providerId: number | null,
    importOpeningId: number | null,
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
      const response = await getLiquidacionMain(
        stateIdList,
        providerId,
        importOpeningId,
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

  const fetchLiquidacionByAperturaImp = async (body: LiquidacionInterface) => {
    showLoading();

    try {
      const response = await getLiquidacionByAperturaImp(body);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as LiquidacionInterface;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchSave = async (body: LiquidacionPackedInterface) => {
    showLoading();

    try {
      const response = await saveLiquidacion(body);

      hideLoading();

      enqueueSnackbar(response.message, {
        variant: response.status === 200 ? 'success' : 'error',
      });
    } catch (error) {
      hideLoading();
    }
  };

  const fetchUpdate = async (body: LiquidacionPackedInterface, id: number) => {
    showLoading();

    try {
      const response = await updateLiquidacion(body, id);

      hideLoading();

      const { message } = (response as ServerResponseType).message;
      enqueueSnackbar(message, {
        variant: response.status === 200 ? 'success' : 'error',
      });
    } catch (error) {
      hideLoading();
    }
  };

  const fetchGetById = async (id: number) => {
    showLoading();

    try {
      const response = await getByIdLiquidacion(id);

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

  const fetchLiquidacionPdf = async (id: number) => {
    showLoading();

    try {
      const response = await getLiquidacionImportacionPdf(id);

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
    fetchLiquidacionByAperturaImp,
    fetchSave,
    fetchUpdate,
    fetchGetById,
    fetchLiquidacionPdf,
  };
};
