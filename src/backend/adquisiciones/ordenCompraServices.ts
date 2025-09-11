import { handleApiError } from '@/functions';
import { ServerResponseType } from '@/store';
import getServiceUrls from '../servicesUrl';
import { createApiConfig } from '../apiConfig';
import {
  DetailOrdenCompraGetType,
  DetailOrdenCompraSetType,
  OrdenCompraGetType,
  OrdenCompraPackeageSendType,
  OrdenExteriorGetInterface,
  PaginatedResponseType,
} from '@/types';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.adquisicionServiceUrl);

export const getOrdenCompraMain: (
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
) => Promise<PaginatedResponseType | ServerResponseType> = async (
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
) => {
  try {
    const generateQueryString = () => {
      const queryStringRoot = '/orden-compra?';

      const queryString = new URLSearchParams();
      if (stateIdList && stateIdList !== null)
        queryString.append('stateIdList', stateIdList);
      if (orderId && orderId !== null)
        queryString.append('orderId', orderId.toString());
      if (userId && userId !== null)
        queryString.append('userId', userId.toString());
      if (providerId && providerId !== null)
        queryString.append('providerId', providerId.toString());
      if (branchId && branchId !== null)
        queryString.append('branchId', branchId.toString());
      if (importOpeningId && importOpeningId !== null)
        queryString.append('importOpeningId', importOpeningId.toString());
      if (productId && productId !== null)
        queryString.append('productId', productId.toString());
      if (starDate && starDate !== null)
        queryString.append('starDate', starDate);
      if (endDate && endDate !== null) queryString.append('endDate', endDate);
      if (currentMonth && currentMonth !== null)
        queryString.append('byCurrentMonth', currentMonth.toString());
      queryString.append('isForeign', isForeign.toString());
      if (page && page !== null) queryString.append('page', page.toString());
      if (limit && limit !== null)
        queryString.append('limit', limit.toString());
      if (sortDirection && sortDirection !== null)
        queryString.append('sortDirection', sortDirection);
      if (sortField && sortField !== null)
        queryString.append('sortField', sortField);
      return queryStringRoot + queryString.toString();
    };
    const response = await api.get(generateQueryString());
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getDetallesOrdenBySolicitudes: (
  bodyToSend: DetailOrdenCompraSetType
) => Promise<DetailOrdenCompraGetType[] | ServerResponseType> = async (
  bodyToSend
) => {
  try {
    const response = await api.put(`/detalle-orden-compra/dto`, bodyToSend);
    return response.data as DetailOrdenCompraGetType[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const saveOrdenCompra: (
  orden: OrdenCompraPackeageSendType
) => Promise<ServerResponseType> = async (orden) => {
  try {
    const response = await api.post(`/orden-compra`, orden);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateOrdenCompra: (
  orden: OrdenCompraPackeageSendType,
  idOrden: number
) => Promise<ServerResponseType> = async (orden, idOrden) => {
  try {
    const response = await api.put(`/orden-compra/${idOrden}`, orden);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getOrdenCompraById: (
  purchaseOrderId: number
) => Promise<OrdenCompraGetType | ServerResponseType> = async (
  purchaseOrderId
) => {
  try {
    const response = await api.get(`/orden-compra/by-id/${purchaseOrderId}`);
    return response.data as OrdenCompraGetType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getDetailOrdenCompraByIdOrden: (
  purchaseOrderId: number
) => Promise<DetailOrdenCompraGetType[] | ServerResponseType> = async (
  purchaseOrderId
) => {
  try {
    const response = await api.get(`/detalle-orden-compra/${purchaseOrderId}`);
    return response.data as DetailOrdenCompraGetType[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getOrdenesCompraBusqueda: (
  bodyToSend: any
) => Promise<ServerResponseType | undefined> = async (bodyToSend) => {
  try {
    const response = await api.put(
      `/orden-compra/busqueda_avanzada`,
      bodyToSend
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const getOrdenesCompraPendientes: (
  sucursalId: number | null
) => Promise<ServerResponseType | undefined> = async (sucursalId) => {
  try {
    const response = await api.get(
      `/orden-compra/sucursal?sucursalId=${sucursalId}`
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const getDetailOrdenCompraById: (
  detalleOrdenCompraId: number
) => Promise<ServerResponseType | undefined> = async (detalleOrdenCompraId) => {
  try {
    const response = await api.get(
      `/detalle-orden-compra/devolucion-compra/${detalleOrdenCompraId}`
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const getOrdenesCompraByProveedor: (
  providerId: number,
  stateId: number
) => Promise<OrdenCompraGetType[] | ServerResponseType> = async (
  providerId,
  stateId
) => {
  try {
    const response = await api.get(
      `/orden-compra/proveedor/estado?providerId=${providerId}&stateId=${stateId}`
    );
    return response.data as OrdenCompraGetType[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getOrdenExteriorByListaPedido: (
  listaPedidoId: number,
  orden: OrdenExteriorGetInterface
) => Promise<OrdenExteriorGetInterface | ServerResponseType> = async (
  listaPedidoId,
  orden
) => {
  try {
    const response = await api.put(
      `/detalle-orden-compra/lista-pedido/${listaPedidoId}`,
      orden
    );
    return response.data as OrdenExteriorGetInterface;
  } catch (error) {
    return handleApiError(error);
  }
};

// ? functions to save and update orden de compra del exterior

export const saveOrdenCompraExterior: (
  orden: OrdenCompraPackeageSendType
) => Promise<ServerResponseType> = async (orden) => {
  try {
    const response = await api.post(`/orden-compra/importacion`, orden);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateOrdenCompraExterior: (
  orden: OrdenCompraPackeageSendType,
  idOrden: number
) => Promise<ServerResponseType> = async (orden, idOrden) => {
  try {
    const response = await api.put(
      `/orden-compra/importacion/${idOrden}`,
      orden
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getOrdenCompraExteriorById: (
  purchaseOrderId: number
) => Promise<OrdenExteriorGetInterface | ServerResponseType> = async (
  purchaseOrderId
) => {
  try {
    const response = await api.get(
      `/orden-compra/importacion/buscar/${purchaseOrderId}`
    );
    return response.data as OrdenExteriorGetInterface;
  } catch (error) {
    return handleApiError(error);
  }
};
