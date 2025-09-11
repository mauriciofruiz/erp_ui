import {
  getDetailsPedidoById,
  getListaPedidoById,
  getListaPedidoByIdProveedor,
  getListaPedidoByParams,
  getListaPedidoPdf,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import {
  DetailPurchaseOrderListGet,
  ListaPedidoGet,
  ListaPedidoMain,
  PaginatedResponseType,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useListaPedidoAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainPageLP = async (
    importCode: number | null,
    providerId: number | null,
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
      const response = await getListaPedidoByParams(
        importCode,
        providerId,
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

  const fetchListaPedidoByIdProveedor = async (providerId: number) => {
    showLoading();

    try {
      const response = await getListaPedidoByIdProveedor(providerId);

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      hideLoading();

      return response as ListaPedidoMain[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchDownloadPdf = async (id: number) => {
    showLoading();

    try {
      const response = await getListaPedidoPdf(id);

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
      const response = await getListaPedidoById(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as ListaPedidoGet;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchDetailsById = async (id: number) => {
    showLoading();

    try {
      const response = await getDetailsPedidoById(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as DetailPurchaseOrderListGet[];
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchMainPageLP,
    fetchListaPedidoByIdProveedor,
    fetchDownloadPdf,
    fetchById,
    fetchDetailsById,
  };
};
