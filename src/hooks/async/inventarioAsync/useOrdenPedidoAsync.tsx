import {
  getOrdenPedidoById,
  getOrdenPedidoMain,
  getOrdenPedidoPdf,
  getUnidadesProducidas,
  saveOrdenPedido,
  updateOrdenPedido,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import {
  OrdenPedidoGet,
  OrdenPedidoPost,
  PaginatedResponseType,
  UnidadesProducidasType,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useOrdenPedidoAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainPageOrdenPedido = async (
    startDate: string | null,
    endDate: string | null,
    orderNumber: number | null,
    stateIdList: number | null,
    userId: number | null,
    branchRequestId: number | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getOrdenPedidoMain(
        startDate,
        endDate,
        orderNumber,
        stateIdList,
        userId,
        branchRequestId,
        page,
        limit,
        sortDirection,
        sortField
      );

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

  const fetchSaveOPedido = async (body: OrdenPedidoPost) => {
    showLoading();

    try {
      const response = await saveOrdenPedido(body);

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

  const fetchUpdateOpedido = async (id: number, body: OrdenPedidoPost) => {
    showLoading();

    try {
      const response = await updateOrdenPedido(id, body);

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

  const fetchUnidadesProducidas = async (ordenId: number) => {
    showLoading();

    try {
      const response = await getUnidadesProducidas(ordenId);

      hideLoading();
      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as UnidadesProducidasType[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchOrdenPedidoPdf = async (id: number) => {
    showLoading();

    try {
      const response = await getOrdenPedidoPdf(id);

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
      const response = await getOrdenPedidoById(id);

      hideLoading();
      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as OrdenPedidoGet;
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchMainPageOrdenPedido,
    fetchUnidadesProducidas,
    fetchSaveOPedido,
    fetchUpdateOpedido,
    fetchOrdenPedidoPdf,
    fetchById,
  };
};
