import { handleApiError } from '@/functions';
import { ServerResponseType } from '@/store';
import {
  PaginatedResponseType,
  TransferenciaGet,
  TransferenciaPost,
} from '@/types';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.inventarioServiceUrl);

export const getMainTransferencias: () => Promise<
  ServerResponseType | undefined
> = async () => {
  try {
    const response = await api.get(`/transferencia`);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getTransferById: (
  transferId: number
) => Promise<TransferenciaGet | ServerResponseType> = async (transferId) => {
  try {
    const response = await api.get(`/transferencia/${transferId}`);
    return response.data as TransferenciaGet;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getDetailsById: (
  transferId: number
) => Promise<ServerResponseType | undefined> = async (transferId) => {
  try {
    const response = await api.get(
      `/detalle-transferencia?transferId=${transferId}`
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getTransferByParams: (
  startDate: string | null,
  endDate: string | null,
  numTransfer: number | null,
  state: number | null,
  warehouseOrigin: number | null,
  warehouseDestination: number | null,
  byCurrentMonth: boolean | null,
  page: number | null,
  limit: number | null,
  sortDirection: string | null,
  sortField: string | null
) => Promise<PaginatedResponseType | ServerResponseType> = async (
  startDate,
  endDate,
  numTransfer,
  state,
  warehouseOrigin,
  warehouseDestination,
  byCurrentMonth,
  page,
  limit,
  sortDirection,
  sortField
) => {
  try {
    const generateQueryString = () => {
      let queryString = '/transferencia?';

      queryString += `byCurrentMonth=${byCurrentMonth}&`;

      if (startDate && startDate !== null) {
        queryString += `startDate=${startDate}&`;
      }
      if (endDate && endDate !== null) {
        queryString += `endDate=${endDate}&`;
      }
      if (numTransfer && numTransfer !== null) {
        queryString += `importCode=${numTransfer}&`;
      }
      if (state && state !== null) {
        queryString += `stateIdList=${state}&`;
      }
      if (warehouseDestination && warehouseDestination !== null) {
        queryString += `warehouseDestination=${warehouseDestination}&`;
      }
      if (warehouseOrigin && warehouseOrigin !== null) {
        queryString += `warehouseOrigin=${warehouseOrigin}&`;
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

export const saveTransferencia: (
  transferencia: TransferenciaPost
) => Promise<ServerResponseType> = async (transferencia) => {
  try {
    const response = await api.post(`/transferencia`, transferencia);
    return {
      message: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateTransferencia: (
  idTransfer: number,
  transferencia: TransferenciaPost
) => Promise<ServerResponseType> = async (idTransfer, transferencia) => {
  try {
    const response = await api.put(
      `/transferencia/${idTransfer}`,
      transferencia
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};
