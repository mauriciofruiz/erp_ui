import { ServerResponseType } from '@/store';
import {
  AccountsPayableRequestType,
  cxpReprogramType,
  PaginatedCXPResponseType,
} from '@/types';
import { createApiConfig } from '../apiConfig';
import { handleApiError } from '@/functions';
import getServiceUrls from '../servicesUrl';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.contabilidadServiceUrl);

export const getCXPByParams: (
  providerId: number | null,
  endDate: string,
  isDue: boolean | null,
  rangeDaysId: number,
  isForeign: boolean | null,
  documentNumber: string,
  page: number,
  limit: number,
  sortDirection: string,
  sortField: string
) => Promise<PaginatedCXPResponseType | ServerResponseType> = async (
  providerId,
  endDate,
  isDue,
  rangeDaysId,
  isForeign,
  documentNumber,
  page,
  limit,
  sortDirection,
  sortField
) => {
  try {
    const generateQueryString = () => {
      let queryString = '/cuentas-por-pagar/all-data?';

      const queryParams = new URLSearchParams();

      if (providerId) {
        queryParams.append('providerId', providerId.toString());
      }
      if (endDate) {
        queryParams.append('endDate', endDate);
      }
      if (isDue !== null) {
        queryParams.append('isDue', isDue.toString());
      }
      if (rangeDaysId) {
        queryParams.append('rangeDaysId', rangeDaysId.toString());
      }
      if (isForeign !== null) {
        queryParams.append('isForeign', isForeign.toString());
      }
      if (documentNumber) {
        queryParams.append('documentNumber', documentNumber);
      }
      if (page) {
        queryParams.append('page', page.toString());
      }
      if (limit) {
        queryParams.append('limit', limit.toString());
      }
      if (sortDirection) {
        queryParams.append('sortDirection', sortDirection);
      }
      if (sortField) {
        queryParams.append('sortField', sortField);
      }

      return queryString + queryParams.toString();
    };
    const response = await api.get(generateQueryString());
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const createPayments: (
  body: AccountsPayableRequestType
) => Promise<ServerResponseType> = async (body) => {
  try {
    const response = await api.post('/cuentas-por-pagar/pago', body);
    return {
      message: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const createReprogramFee: (
  body: cxpReprogramType
) => Promise<ServerResponseType> = async (body) => {
  try {
    const response = await api.post('/cuentas-por-pagar/reprogramar', body);
    return {
      message: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleApiError(error);
  }
};
