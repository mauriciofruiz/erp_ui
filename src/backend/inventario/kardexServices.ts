import { ServerResponseType } from '@/store';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { handleApiError } from '@/functions';
import { DetailKardexSearcherInterface, PaginatedResponseType } from '@/types';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.inventarioServiceUrl);

export const manageKardexReception: (
  bodyToSend: any
) => Promise<ServerResponseType | undefined> = async (bodyToSend) => {
  try {
    const response = await api.put(`/kardex/recepcion-compra`, bodyToSend);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getDetalleKardexView: (
  bodyToSend: DetailKardexSearcherInterface
) => Promise<ServerResponseType | undefined> = async (bodyToSend) => {
  try {
    const response = await api.put(`/detalle-kardex`, bodyToSend);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getKardexView: (
  productId: number
) => Promise<ServerResponseType | undefined> = async (productId) => {
  try {
    const response = await api.get(`/kardex/producto?productId=${productId}`);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const manageKardexDevolucion: (
  id: number
) => Promise<ServerResponseType | undefined> = async (id) => {
  try {
    const response = await api.put(`/kardex/devolucion-compra?id=${id}`);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getKardexByParams: (
  branchId: number | null,
  warehouseIdList: string | null,
  movementTypeIdList: string | null,
  byCurrentMonth: boolean,
  startDate: string | null,
  endDate: string | null,
  page: number | null,
  limit: number | null,
  productId: number | null
) => Promise<PaginatedResponseType | ServerResponseType> = async (
  branchId,
  warehouseIdList,
  movementTypeIdList,
  byCurrentMonth,
  startDate,
  endDate,
  page,
  limit,
  productId
) => {
  try {
    const generateQueryString = () => {
      let queryString = '/detalle-kardex?';

      queryString += `byCurrentMonth=${byCurrentMonth}&`;

      if (branchId && branchId !== null) {
        queryString += `branchId=${branchId}&`;
      }
      if (warehouseIdList && warehouseIdList !== null) {
        queryString += `warehouseIdList=${warehouseIdList}&`;
      }
      if (movementTypeIdList && movementTypeIdList !== null) {
        queryString += `movementTypeIdList=${movementTypeIdList}&`;
      }
      if (startDate && startDate !== null) {
        queryString += `startDate=${startDate}&`;
      }
      if (endDate && endDate !== null) {
        queryString += `endDate=${endDate}&`;
      }
      if (page && page !== null) {
        queryString += `page=${page}&`;
      }
      if (limit && limit !== null) {
        queryString += `limit=${limit}&`;
      }
      if (productId && productId !== null) {
        queryString += `productId=${productId}&`;
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
