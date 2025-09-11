import { handleApiError } from '@/functions';
import { ServerResponseType } from '@/store';
import {
  FacturasForRetencionType,
  PaginatedResponseType,
  RetencionGetType,
  RetencionPostPutType,
} from '@/types';
import getServiceUrls from '../servicesUrl';
import { createApiConfig } from '../apiConfig';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.ventasServiceUrl);

export const getMainRetencionCliente: (
  startDate: string | null,
  endDate: string | null,
  documentNumber: number | null,
  branchId: number | null,
  clientId: number | null,
  value: number | null,
  byCurrentMonth: boolean | null,
  page: number | null,
  limit: number | null,
  sortDirection: string | null,
  sortField: string | null
) => Promise<PaginatedResponseType | ServerResponseType> = async (
  startDate,
  endDate,
  documentNumber,
  branchId,
  clientId,
  value,
  byCurrentMonth,
  page,
  limit,
  sortDirection,
  sortField
) => {
  try {
    const generateQueryString = () => {
      let queryString = '/retencion?';
      queryString += `byCurrentMonth=${byCurrentMonth}&`;

      if (startDate && startDate !== null) {
        queryString += `startDate=${startDate}&`;
      }
      if (endDate && endDate !== null) {
        queryString += `endDate=${endDate}&`;
      }
      if (documentNumber && documentNumber !== null) {
        queryString += `documentNumber=${documentNumber}&`;
      }
      if (branchId && branchId !== null) {
        queryString += `branchId=${branchId}&`;
      }
      if (clientId && clientId !== null) {
        queryString += `clientId=${clientId}&`;
      }
      if (value && value !== null) {
        queryString += `value=${value}&`;
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
    return handleApiError(error);
  }
};

export const isRetentionDocumentNumberAvailable: (
  clientId: number,
  retentionNumber: string
) => Promise<Boolean | ServerResponseType> = async (
  clientId,
  retentionNumber
) => {
  try {
    const response = await api.get(
      `/retencion/validacion/documento?clientId=${clientId}&retentionNumber=${retentionNumber}`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

///

export const getInvoicesToRetain: (
  clientId: number,
  isPettyCash: boolean
) => Promise<FacturasForRetencionType[] | ServerResponseType> = async (
  clientId,
  isPettyCash
) => {
  try {
    const response = await api.get(
      `/facturacion-cliente/para/retencion?clientId=${clientId}&isPettyCash=${isPettyCash}`
    );
    return response.data as FacturasForRetencionType[];
  } catch (error) {
    return handleApiError(error);
  }
};

// * SAVE UPDATE GETBY ID

export const saveRetencionCliente: (
  body: RetencionPostPutType
) => Promise<ServerResponseType> = async (body) => {
  try {
    const response = await api.post(`/retencion`, body);
    return {
      message: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleApiError(error);
  }
};
export const updateRetencionCliente: (
  body: RetencionPostPutType,
  id: number
) => Promise<ServerResponseType> = async (body, id) => {
  try {
    const response = await api.put(`/retencion/${id}`, body);
    return {
      message: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getRetencionClienteById: (
  id: number
) => Promise<RetencionGetType | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/retencion/${id}`);
    return response.data as RetencionGetType;
  } catch (error) {
    return handleApiError(error);
  }
};
