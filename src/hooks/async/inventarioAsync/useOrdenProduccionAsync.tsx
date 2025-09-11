import {
  closeOrders,
  getAllOrdersToClose,
  getDataModified,
  getOrdenProdById,
  getOrdenProduccionByParams,
  saveOrdenProduccion,
  updateOrdenProduccion,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import {
  CierreOrdenType,
  OrderProdByIdType,
  OrderProducctionPost,
  PaginatedResponseType,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useOrdenProduccionAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainPageOP = async (
    startDate: string | null,
    endDate: string | null,
    orderNumber: number | null,
    stateIdList: number | null,
    requestNumber: number | null,
    branchRequestId: number | null,
    byCurrentMonth: boolean | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getOrdenProduccionByParams(
        startDate,
        endDate,
        orderNumber,
        stateIdList,
        requestNumber,
        branchRequestId,
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

  const fetchOrdenProdById = async (ordenId: number) => {
    showLoading();

    try {
      const response = await getOrdenProdById(ordenId);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as OrderProdByIdType;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchSave = async (body: OrderProducctionPost) => {
    showLoading();

    try {
      const response = await saveOrdenProduccion(body);

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

  const fetchUpdate = async (body: OrderProducctionPost, id: number) => {
    showLoading();

    try {
      const response = await updateOrdenProduccion(id, body);

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

  const fetchDataModified = async (body: OrderProdByIdType) => {
    showLoading();

    try {
      const response = await getDataModified(body);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as OrderProdByIdType;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchAllOrdersToClose = async (startDate: string, endDate: string) => {
    showLoading();

    try {
      const response = await getAllOrdersToClose(startDate, endDate);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as CierreOrdenType[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchCloseOrders = async (
    body: CierreOrdenType[],
    endDate: string,
    costTypeId: number
  ) => {
    showLoading();
    try {
      const response = await closeOrders(body, endDate, costTypeId);

      hideLoading();

      return response as ServerResponseType;
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchMainPageOP,
    fetchOrdenProdById,
    fetchSave,
    fetchUpdate,
    fetchDataModified,
    fetchAllOrdersToClose,
    fetchCloseOrders,
  };
};
