import {
  CierreOrdenType,
  OrderProdByIdType,
  OrderProducctionPost,
  PaginatedResponseType,
  QuantityType,
} from '@/types';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { ServerResponseType } from '@/store';
import { handleApiError } from '@/functions';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.inventarioServiceUrl);

const apiContabilidad = createApiConfig(serviceUrls.contabilidadServiceUrl);

export const getOrdenProduccionByParams: (
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
) => Promise<PaginatedResponseType | ServerResponseType> = async (
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
) => {
  try {
    const generateQueryString = () => {
      let queryString = '/orden?';

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
      if (requestNumber && requestNumber !== null) {
        queryString += `requestNumber=${requestNumber}&`;
      }
      if (branchRequestId && branchRequestId !== null) {
        queryString += `branchRequestId=${branchRequestId}&`;
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

export const getOrdenProdById: (
  ordenId: number
) => Promise<OrderProdByIdType | ServerResponseType> = async (ordenId) => {
  try {
    const response = await api.get(`orden/${ordenId}`);
    return response.data as OrderProdByIdType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getUnidadesDetails: (
  ordenId: number,
  productId: string
) => Promise<ServerResponseType | undefined> = async (ordenId, productId) => {
  try {
    const response = await api.get(
      `orden/pedido/${ordenId}?productIdList=${productId}`
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateRowsQuantity: (
  ordenId: number,
  quantityPut: QuantityType
) => Promise<ServerResponseType | undefined> = async (ordenId, quantityPut) => {
  try {
    const response = await api.put(
      `orden/pedido/calcular/${ordenId}`,
      quantityPut
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const saveOrdenProduccion: (
  ordenProduccion: OrderProducctionPost
) => Promise<ServerResponseType> = async (ordenProduccion) => {
  try {
    const response = await api.post(`/orden`, ordenProduccion);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateOrdenProduccion: (
  orderProdId: number,
  ordenProduccion: OrderProducctionPost
) => Promise<ServerResponseType> = async (orderProdId, ordenProduccion) => {
  try {
    const response = await api.put(`/orden/${orderProdId}`, ordenProduccion);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getDataModified: (
  body: OrderProdByIdType
) => Promise<OrderProdByIdType | ServerResponseType> = async (body) => {
  try {
    const response = await api.put(`/detalle-orden/validate/all-data`, body);
    return response.data as OrderProdByIdType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAllOrdersToClose: (
  startDate: string,
  endDate: string
) => Promise<CierreOrdenType[] | ServerResponseType> = async (
  startDate,
  endDate
) => {
  try {
    const response = await api.get(
      `/orden/cierre/lista?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data as CierreOrdenType[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const closeOrders: (
  body: CierreOrdenType[],
  endDate: string,
  costTypeId: number
) => Promise<ServerResponseType> = async (body, endDate, costTypeId) => {
  try {
    const response = await apiContabilidad.put(
      `/asiento-contable/cierre-produccion/create?endDate=${endDate}&costTypeId=${costTypeId}`,
      body
    );
    return {
      message: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleApiError(error);
  }
};
