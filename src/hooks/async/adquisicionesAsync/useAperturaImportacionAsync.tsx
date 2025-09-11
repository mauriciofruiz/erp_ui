import {
  getAperturaByProveedorAndOrdenConfirmada,
  getAperturaImportacion,
  getAperturaImportacionById,
  getAperturaImportacionByParams,
  getCodigosApertura,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import {
  AperturaGetType,
  AperturaPostType,
  CodigosAperturaType,
  PaginatedResponseType,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useAperturaImportacionAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchAll = async () => {
    showLoading();
    try {
      const response = await getAperturaImportacion();
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

  const fetchByProveedorAndOrdenConfirmada = async (providerId: number) => {
    showLoading();
    try {
      const response = await getAperturaByProveedorAndOrdenConfirmada(
        providerId
      );
      hideLoading();
      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as AperturaPostType[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchByParameters = async (
    importCode: number | null,
    providerId: number | null,
    stateIdList: number | null,
    startDate: string | null,
    endDate: string | null,
    orderListId: number | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null,
    byCurrentMonth: boolean
  ) => {
    showLoading();
    try {
      const response = await getAperturaImportacionByParams(
        importCode,
        providerId,
        stateIdList,
        startDate,
        endDate,
        orderListId,
        page,
        limit,
        sortDirection,
        sortField,
        byCurrentMonth
      );
      hideLoading();
      return response?.message as PaginatedResponseType;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchById = async (id: number) => {
    showLoading();
    try {
      const response = await getAperturaImportacionById(id);
      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as AperturaGetType;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchCodigosApertura = async (providerId: number) => {
    showLoading();
    try {
      const response = await getCodigosApertura(providerId);
      hideLoading();
      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as CodigosAperturaType[];
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchAll,
    fetchByProveedorAndOrdenConfirmada,
    fetchByParameters,
    fetchById,
    fetchCodigosApertura,
  };
};
