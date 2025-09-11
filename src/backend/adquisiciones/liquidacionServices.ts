import { handleApiError } from '@/functions';
import { ServerResponseType } from '@/store';
import getServiceUrls from '../servicesUrl';
import { createApiConfig } from '../apiConfig';
import {
  LiquidacionInterface,
  LiquidacionPackedInterface,
  PaginatedResponseType,
} from '@/types';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.adquisicionServiceUrl);

export const getLiquidacionMain: (
  stateIdList: string | null,
  providerId: number | null,
  importOpeningId: number | null,
  startDate: string | null,
  endDate: string | null,
  currentMonth: boolean | null,
  page: number | null,
  limit: number | null,
  sortDirection: string | null,
  sortField: string | null
) => Promise<PaginatedResponseType | ServerResponseType> = async (
  stateIdList,
  providerId,
  importOpeningId,
  startDate,
  endDate,
  currentMonth,
  page,
  limit,
  sortDirection,
  sortField
) => {
  try {
    const generateQueryString = () => {
      const queryStringRoot = '/liquidacion?';

      const queryString = new URLSearchParams();
      if (stateIdList && stateIdList !== null)
        queryString.append('stateIdList', stateIdList);
      if (providerId && providerId !== null)
        queryString.append('providerId', providerId.toString());
      if (importOpeningId && importOpeningId !== null)
        queryString.append('importOpeningId', importOpeningId.toString());
      if (startDate && startDate !== null)
        queryString.append('startDate', startDate);
      if (endDate && endDate !== null) queryString.append('endDate', endDate);
      if (currentMonth && currentMonth !== null)
        queryString.append('byCurrentMonth', currentMonth.toString());
      if (page && page !== null) queryString.append('page', page.toString());
      if (limit && limit !== null)
        queryString.append('limit', limit.toString());
      if (sortDirection && sortDirection !== null)
        queryString.append('sortDirection', sortDirection);
      if (sortField && sortField !== null)
        queryString.append('sortField', sortField);
      return queryStringRoot + queryString.toString();
    };
    const response = await api.get(generateQueryString());
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getLiquidacionByAperturaImp: (
  body: LiquidacionInterface
) => Promise<LiquidacionInterface | ServerResponseType> = async (body) => {
  try {
    const response = await api.put(
      `/detalle-liquidacion/apertura-importacion`,
      body
    );
    return response.data as LiquidacionInterface;
  } catch (error) {
    return handleApiError(error);
  }
};

export const saveLiquidacion: (
  body: LiquidacionPackedInterface
) => Promise<ServerResponseType> = async (body) => {
  try {
    const response = await api.post(`/liquidacion`, body);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateLiquidacion: (
  body: LiquidacionPackedInterface,
  id: number
) => Promise<ServerResponseType> = async (body, id) => {
  try {
    const response = await api.put(`/liquidacion/${id}`, body);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getByIdLiquidacion: (
  id: number
) => Promise<LiquidacionInterface | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/liquidacion/${id}`);
    return response.data as LiquidacionInterface;
  } catch (error) {
    return handleApiError(error);
  }
};
