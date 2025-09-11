import {
  getDetailOrdenCompraByIdOrden,
  getDetallesOrdenBySolicitudes,
  getOrdenCompraById,
  getOrdenCompraExteriorById,
  getOrdenCompraExteriorPdf,
  getOrdenCompraMain,
  getOrdenCompraPdf,
  getOrdenExteriorByListaPedido,
  getOrdenesCompraByProveedor,
  saveOrdenCompra,
  saveOrdenCompraExterior,
  updateOrdenCompra,
  updateOrdenCompraExterior,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import {
  DetailOrdenCompraGetType,
  DetailOrdenCompraSetType,
  OrdenCompraPackeageSendType,
  OrdenExteriorGetInterface,
  PaginatedResponseType,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useOrdenCompraAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainPage = async (
    stateIdList: string | null,
    orderId: number | null,
    userId: number | null,
    providerId: number | null,
    branchId: number | null,
    importOpeningId: number | null,
    productId: number | null,
    starDate: string | null,
    endDate: string | null,
    currentMonth: boolean | null,
    isForeign: boolean,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getOrdenCompraMain(
        stateIdList,
        orderId,
        userId,
        providerId,
        branchId,
        importOpeningId,
        productId,
        starDate,
        endDate,
        currentMonth,
        isForeign,
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

  const fetchOrdenCompraById = async (id: number) => {
    showLoading();

    try {
      const response = await getOrdenCompraById(id);

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

  const fetchOrdenesCompraByProveedor = async (id: number, stateId: number) => {
    showLoading();

    try {
      const response = await getOrdenesCompraByProveedor(id, stateId);

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

  const fetchOrdenByListaPedido = async (
    listaPedidoId: number,
    orden: OrdenExteriorGetInterface
  ) => {
    showLoading();

    try {
      const response = await getOrdenExteriorByListaPedido(
        listaPedidoId,
        orden
      );

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as OrdenExteriorGetInterface;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchSaveOCExterior = async (orden: OrdenCompraPackeageSendType) => {
    showLoading();

    try {
      const response = await saveOrdenCompraExterior(orden);

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

  const fetchUpdateOCExterior = async (
    orden: OrdenCompraPackeageSendType,
    idOrden: number
  ) => {
    showLoading();

    try {
      const response = await updateOrdenCompraExterior(orden, idOrden);

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

  const fetchOrdenCompraExteriorById = async (id: number) => {
    showLoading();

    try {
      const response = await getOrdenCompraExteriorById(id);

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

  const fetchDetailOrdenCompraByIdOrden = async (id: number) => {
    showLoading();

    try {
      const response = await getDetailOrdenCompraByIdOrden(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as DetailOrdenCompraGetType[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchSaveOC = async (body: OrdenCompraPackeageSendType) => {
    showLoading();

    try {
      const response = await saveOrdenCompra(body);

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

  const fetchUpdate = async (body: OrdenCompraPackeageSendType, id: number) => {
    showLoading();

    try {
      const response = await updateOrdenCompra(body, id);

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

  const fetchDownloadPdf = async (id: number) => {
    showLoading();

    try {
      const response = await getOrdenCompraPdf(id);

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

  const fetchDownloadExteriorPdf = async (id: number) => {
    showLoading();

    try {
      const response = await getOrdenCompraExteriorPdf(id);

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

  const fetchDetallesBySolicitud = async (
    bodyToSend: DetailOrdenCompraSetType
  ) => {
    showLoading();
    try {
      const response = await getDetallesOrdenBySolicitudes(bodyToSend);
      hideLoading();
      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(
          `No se pudieron cargar los detalles de la orden de compra: ${message}`,
          { variant: 'error' }
        );
        return undefined;
      }
      return response as DetailOrdenCompraGetType[];
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchMainPage,
    fetchOrdenCompraById,
    fetchOrdenesCompraByProveedor,
    fetchOrdenByListaPedido,
    fetchSaveOCExterior,
    fetchUpdateOCExterior,
    fetchOrdenCompraExteriorById,
    fetchDetailOrdenCompraByIdOrden,
    fetchSaveOC,
    fetchUpdate,
    fetchDownloadPdf,
    fetchDownloadExteriorPdf,
    fetchDetallesBySolicitud,
  };
};
// Path: src/hooks/AsyncFunctions/Adquisiciones/proveedorAsync.tsx
