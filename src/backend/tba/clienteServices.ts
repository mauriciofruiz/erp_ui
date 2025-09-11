import { ServerResponseType } from '@/store';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import axios from 'axios';
import {
  ClientPersonCreditPostType,
  PaginatedResponseType,
  PersonClientType,
} from '@/types';
import { handleApiError } from '@/functions';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getClientPersonaByParam: (
  param: string
) => Promise<ServerResponseType | undefined> = async (param) => {
  try {
    const response = await api.get(`/cliente/persona/ficha?param=${param}`);

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

export const getClientPersonaByParam_hook: (
  param: string
) => Promise<PersonClientType[] | ServerResponseType> = async (param) => {
  try {
    const response = await api.get(`/cliente/persona/ficha?param=${param}`);

    return response.data as PersonClientType[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getClientePersonaByCliente: (
  clienteId: number
) => Promise<PersonClientType | ServerResponseType> = async (clienteId) => {
  try {
    const response = await api.get(`/persona/cliente/${clienteId}`);

    return response.data as PersonClientType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const saveFichaCLiente: (
  clientePersonPostType: ClientPersonCreditPostType
) => Promise<ClientPersonCreditPostType | ServerResponseType> = async (
  clientePersonPostType
) => {
  try {
    const response = await api.post(`/cliente`, clientePersonPostType);
    return response.data as ClientPersonCreditPostType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateFichaCliente: (
  clientePersonPostType: ClientPersonCreditPostType,
  clienteId: number
) => Promise<ClientPersonCreditPostType | ServerResponseType> = async (
  clientePersonPostType,
  clienteId
) => {
  try {
    const response = await api.put(
      `/cliente/${clienteId}`,
      clientePersonPostType
    );
    return response.data as ClientPersonCreditPostType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getClientById: (
  clientId: number
) => Promise<ServerResponseType | ClientPersonCreditPostType> = async (
  clientId
) => {
  try {
    const response = await api.get(`/cliente/${clientId}`);
    return response.data as ClientPersonCreditPostType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getIdentificacionRepetidaCliente: (
  param: string
) => Promise<ServerResponseType | undefined> = async (id) => {
  try {
    const response = await api.get(`/cliente/verificar-existencia/${id}`);
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

export const getExceptionList: (
  clientId: number,
  page: number | null,
  limit: number | null,
  sortDirection: string | null,
  sortField: string | null
) => Promise<PaginatedResponseType | ServerResponseType> = async (
  clientId: number,
  page,
  limit,
  sortDirection,
  sortField
) => {
  try {
    const generateQueryString = () => {
      let queryString =
        '/excepciones-cliente-descuento?clientId=' + clientId + '&';

      if (page && page !== null) queryString += `page=${page}&`;

      if (limit && limit !== null) queryString += `limit=${limit}&`;

      if (sortDirection && sortDirection !== null)
        queryString += `sortDirection=${sortDirection}&`;

      if (sortField && sortField !== null)
        queryString += `sortField=${sortField}&`;

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
