import { ServerResponseType } from '@/store';
import {
  AccountsPayableSendTypeCXC,
  cxcReprogramType,
  PaginatedCXCResponseType,
} from '@/types';
import { createApiConfig } from '../apiConfig';
import { handleApiError } from '@/functions';
import getServiceUrls from '../servicesUrl';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.ventasServiceUrl);

export const getCXCByParams: (
  clientId: number | null,
  endDate: string,
  isDue: boolean | null,
  rangeDaysId: number,
  documentNumber: string,
  page: number,
  limit: number,
  sortDirection: string,
  sortField: string
) => Promise<PaginatedCXCResponseType | ServerResponseType> = async (
  clientId,
  endDate,
  isDue,
  rangeDaysId,
  documentNumber,
  page,
  limit,
  sortDirection,
  sortField
) => {
  try {
    const generateQueryString = () => {
      let queryString = '/cuentas-por-cobrar?';

      const queryParams = new URLSearchParams();

      if (clientId) {
        queryParams.append('clientId', clientId.toString());
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

export const createCharge: (
  body: AccountsPayableSendTypeCXC
) => Promise<ServerResponseType> = async (body) => {
  try {
    const response = await api.post('/cuentas-por-cobrar/cobro', body);
    return {
      message: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const createReprogramFeeCXC: (
  body: cxcReprogramType
) => Promise<ServerResponseType> = async (body) => {
  try {
    const response = await api.post('/cuentas-por-cobrar/reprogramar', body);
    return {
      message: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleApiError(error);
  }
};
