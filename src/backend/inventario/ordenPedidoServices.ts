import { ServerResponseType } from '@/store';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { handleApiError } from '@/functions';
import {
  OrdenPedidoGet,
  OrdenPedidoPost,
  PaginatedResponseType,
  UnidadesProducidasType,
} from '@/types';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.inventarioServiceUrl);

export const getOrdenesPedidoByParams: (
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
) => Promise<ServerResponseType | undefined> = async (
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
) => {
  try {
    const generateQueryString = () => {
      let queryString = '/pedido?';

      if (startDate && startDate !== null) {
        queryString += `startDate=${startDate}&`;
      }
      if (endDate && endDate !== null) {
        queryString += `endDate=${endDate}&`;
      }
      if (orderNumber && orderNumber !== null) {
        queryString += `orderNumber=${orderNumber}&`;
      }
      if (stateIdList && stateIdList !== null) {
        queryString += `stateIdList=${stateIdList}&`;
      }
      if (userId && userId !== null) {
        queryString += `userId=${userId}&`;
      }
      if (branchRequestId && branchRequestId !== null) {
        queryString += `productId=${branchRequestId}&`;
      }
      if (page && page !== null) {
        queryString += `page=${page}&`;
      }
      if (limit && limit !== null) {
        queryString += `limit=${limit}&`;
      }
      if (sortDirection && sortDirection !== null) {
        queryString += `sortDirection=${sortDirection}&`;
      }
      if (sortField && sortField !== null) {
        queryString += `sortField=${sortField}&`;
      }
      queryString = queryString.replace(/&$/, '');
      return queryString;
    };
    const response = await api.get(generateQueryString());
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getOrdenPedidoMain: (
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
) => Promise<PaginatedResponseType | ServerResponseType> = async (
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
) => {
  try {
    const generateQueryString = () => {
      let queryString = '/pedido?';

      if (startDate && startDate !== null) {
        queryString += `startDate=${startDate}&`;
      }
      if (endDate && endDate !== null) {
        queryString += `endDate=${endDate}&`;
      }
      if (orderNumber && orderNumber !== null) {
        queryString += `orderNumber=${orderNumber}&`;
      }
      if (stateIdList && stateIdList !== null) {
        queryString += `stateIdList=${stateIdList}&`;
      }
      if (userId && userId !== null) {
        queryString += `userId=${userId}&`;
      }
      if (branchRequestId && branchRequestId !== null) {
        queryString += `productId=${branchRequestId}&`;
      }
      if (page && page !== null) {
        queryString += `page=${page}&`;
      }
      if (limit && limit !== null) {
        queryString += `limit=${limit}&`;
      }
      if (sortDirection && sortDirection !== null) {
        queryString += `sortDirection=${sortDirection}&`;
      }
      if (sortField && sortField !== null) {
        queryString += `sortField=${sortField}&`;
      }
      queryString = queryString.replace(/&$/, '');
      return queryString;
    };
    const response = await api.get(generateQueryString());
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const saveOrdenPedido: (
  ordenPedido: OrdenPedidoPost
) => Promise<ServerResponseType> = async (ordenPedido) => {
  try {
    const response = await api.post(`/pedido`, ordenPedido);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateOrdenPedido: (
  ordenId: number,
  ordenPedido: OrdenPedidoPost
) => Promise<ServerResponseType | undefined> = async (ordenId, ordenPedido) => {
  try {
    const response = await api.put(`/pedido/${ordenId}`, ordenPedido);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getOrdenPedidoById: (
  ordenId: number
) => Promise<OrdenPedidoGet | ServerResponseType> = async (ordenId) => {
  try {
    const response = await api.get(`/pedido/${ordenId}`);
    return response.data as OrdenPedidoGet;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getConfirmOrders: () => Promise<
  ServerResponseType | undefined
> = async () => {
  try {
    const response = await api.get(`/pedido/buscar/lista`);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getUnidadesProducidas: (
  ordenId: number
) => Promise<UnidadesProducidasType[] | ServerResponseType> = async (
  ordenId
) => {
  try {
    const response = await api.get(`detalle-pedido/pedido/orden/${ordenId}`);
    return response.data as UnidadesProducidasType[];
  } catch (error) {
    return handleApiError(error);
  }
};
