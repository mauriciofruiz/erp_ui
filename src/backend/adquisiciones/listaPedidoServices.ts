import { handleApiError } from '@/functions';
import { ServerResponseType } from '@/store';
import axios from 'axios';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import {
  DetailPurchaseOrderListGet,
  EstadoPedidoType,
  ListaPedidoGet,
  ListaPedidoMain,
  ListaPedidoPostType,
  PaginatedResponseType,
} from '@/types';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.adquisicionServiceUrl);

export const getListaPedido: () => Promise<
  ServerResponseType | undefined
> = async () => {
  try {
    const response = await api.get(`/lista-pedido?sortDirection=${'ASC'}`);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
    throw error; // Re-throw the error after handling it if necessary
  }
};

export const getEstadoPedido: () => Promise<EstadoPedidoType[]> = async () => {
  try {
    const response = await api.get(`estado`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const saveListaPedido: (
  listaPedidoPost: ListaPedidoPostType
) => Promise<ServerResponseType | undefined> = async (listaPedidoPost) => {
  try {
    const response = await api.post(`/lista-pedido`, listaPedidoPost);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return {
          status: error.response.status,
          message: error.response.data,
        };
      } else {
        return {
          status: 500,
          message: 'Error Del Servidor: ' + error.message,
        };
      }
    }
  }
};

export const updateListaPedido: (
  requestId: number,
  listaPedidoPost: ListaPedidoPostType
) => Promise<ServerResponseType | undefined> = async (
  requestId,
  listaPedidoPost
) => {
  try {
    const response = await api.put(
      `/lista-pedido/${requestId}`,
      listaPedidoPost
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return {
          status: error.response.status,
          message: error.response.data,
        };
      } else {
        return {
          status: 500,
          message: 'Error Del Servidor: ' + error.message,
        };
      }
    }
  }
};

export const pacthListaPedido: (
  requestId: number,
  listaPedidoPatch: {}
) => Promise<ServerResponseType | undefined> = async (
  requestId,
  listaPedidoPost
) => {
  try {
    const response = await api.patch(
      `/lista-pedido/${requestId}`,
      listaPedidoPost
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return {
          status: error.response.status,
          message: error.response.data,
        };
      } else {
        return {
          status: 500,
          message: 'Error Del Servidor: ' + error.message,
        };
      }
    }
  }
};

export const getListaPedidoById: (
  requestId: number
) => Promise<ListaPedidoGet | ServerResponseType> = async (requestId) => {
  try {
    const response = await api.get(`/lista-pedido/${requestId}`);
    return response.data as ListaPedidoGet;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getDetailsPedidoById: (
  requestId: number
) => Promise<DetailPurchaseOrderListGet[] | ServerResponseType> = async (
  requestId
) => {
  try {
    const response = await api.get(
      `/detalle-lista-pedido/lista-pedido/${requestId}`
    );
    return response.data as DetailPurchaseOrderListGet[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getListaPedidoByParams: (
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
) => Promise<PaginatedResponseType | ServerResponseType> = async (
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
) => {
  try {
    const generateQueryString = () => {
      let queryString = '/lista-pedido?';

      if (importCode && importCode !== null) {
        queryString += `importCode=${importCode}&`;
      }
      if (stateIdList && stateIdList !== null) {
        queryString += `stateIdList=${stateIdList}&`;
      }
      if (providerId && providerId !== null) {
        queryString += `providerId=${providerId}&`;
      }
      if (startDate && startDate !== null) {
        queryString += `startDate=${startDate}&`;
      }
      if (endDate && endDate !== null) {
        queryString += `endDate=${endDate}&`;
      }
      if (byCurrentMonth && byCurrentMonth !== null) {
        queryString += `byCurrentMonth=${byCurrentMonth}&`;
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
    throw error; // Re-throw the error after handling it if necessary
  }
};

export const getListaPedidoByIdProveedor: (
  providerId: number
) => Promise<ListaPedidoMain[] | ServerResponseType> = async (providerId) => {
  try {
    const response = await api.get(`/lista-pedido/proveedor/${providerId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
