import { handleApiError } from '@/functions';
import { ServerResponseType } from '@/store';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import axios from 'axios';
import {
  AperturaGetType,
  AperturaPostType,
  CodigosAperturaType,
  EstadoAperturaType,
  PaginatedResponseType,
} from '@/types';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.adquisicionServiceUrl);

export const getAperturaImportacion: () => Promise<
  ServerResponseType | PaginatedResponseType
> = async () => {
  try {
    const response = await api.get(`/apertura-importacion`);
    return response.data as PaginatedResponseType;
  } catch (error) {
    return handleApiError(error); // Re-throw the error after handling it if necessary
  }
};

export const getAperturaImportacionById: (
  id: number
) => Promise<AperturaGetType | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/apertura-importacion/${id}`);
    return response.data as AperturaGetType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCodigosApertura: (
  providerId: number
) => Promise<CodigosAperturaType[] | ServerResponseType> = async (
  providerId
) => {
  try {
    const response = await api.get(
      `/apertura-importacion/lista/codigos?providerId=${providerId}`
    );
    return response.data as CodigosAperturaType[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getEstadoImportación: () => Promise<
  EstadoAperturaType[]
> = async () => {
  try {
    const response = await api.get(`/estado-importacion`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getAperturaImportacionByParams: (
  importCode: number | null,
  providerId: number | null,
  stateIdList: number | null,
  startDate: string | null,
  endDate: string | null,
  orderListId: number | null,
  page: number | null,
  limit: number | null,
  sortDirection: string | null,
  sortField: string | null,
  byCurrentMonth: boolean
) => Promise<ServerResponseType | undefined> = async (
  importCode,
  providerId,
  stateIdList,
  startDate,
  endDate,
  orderListId,
  page,
  limit,
  sortDirection,
  sortField,
  byCurrentMonth
) => {
  try {
    const generateQueryString = () => {
      let queryString = '/apertura-importacion?';

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
      if (orderListId && orderListId !== null) {
        queryString += `orderListId=${orderListId}&`;
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
      queryString += `byCurrentMonth=${byCurrentMonth}&`;

      queryString = queryString.replace(/&$/, '');
      return queryString;
    };

    const response = await api.get(generateQueryString());
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const saveAperturaImportacion: (
  aperturaPosyType: AperturaPostType
) => Promise<ServerResponseType | undefined> = async (aperturaPosyType) => {
  try {
    const response = await api.post(`/apertura-importacion`, aperturaPosyType);
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

export const updateAperturaImportacion: (
  aperturaId: number,
  aperturaPosyType: AperturaPostType
) => Promise<ServerResponseType | undefined> = async (
  aperturaId,
  aperturaPosyType
) => {
  try {
    const response = await api.put(
      `/apertura-importacion/${aperturaId}`,
      aperturaPosyType
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

export const pacthAperturaImportacion: (
  aperturaId: number,
  aperturaPatch: {}
) => Promise<ServerResponseType | undefined> = async (
  aperturaId,
  aperturaPatch
) => {
  try {
    const response = await api.patch(
      `/apertura-importacion/${aperturaId}`,
      aperturaPatch
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

export const getAperturaExist: (
  codeApertura: string
) => Promise<ServerResponseType | undefined> = async (codeApertura) => {
  try {
    const response = await api.get(
      `/apertura-importacion/codigos/verificar?importCode=${codeApertura}`
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

export const getAperturaByProveedorAndOrdenConfirmada: (
  providerId: number
) => Promise<AperturaPostType[] | ServerResponseType> = async (providerId) => {
  try {
    const response = await api.get(
      `/apertura-importacion/proveedor/${providerId}`
    );
    return response.data as AperturaPostType[];
  } catch (error) {
    return handleApiError(error);
  }
};
