import { ServerResponseType } from '@/store';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { handleApiError } from '@/functions';
import { EntryDtoInterface, PaginatedResponseType } from '@/types';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.contabilidadServiceUrl);

export const getEntryDto: (
  entryId: number
) => Promise<EntryDtoInterface | ServerResponseType> = async (entryId) => {
  try {
    const response = await api.get(`/asiento-contable/get/${entryId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const createEntryDevolucion: (
  id: number
) => Promise<ServerResponseType | undefined> = async (id) => {
  try {
    const response = await api.put(
      `/asiento-contable/devolucion-compra/create?id=${id}`
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAsientosByParams: (
  branchId: number | null,
  isAutomatic: boolean | null,
  movementTypeIdList: number | null,
  stateIdList: number | null,
  startDate: string | null,
  endDate: string | null,
  byCurrentMonth: boolean | null,
  page: number | null,
  limit: number | null,
  sortDirection: string | null,
  sortField: string | null
) => Promise<PaginatedResponseType | ServerResponseType> = async (
  branchId,
  isAutomatic,
  movementTypeIdList,
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
      let queryString = '/asiento-contable?';

      if (branchId && branchId !== null) {
        queryString += `branchId=${branchId}&`;
      }
      if (isAutomatic !== null) {
        queryString += `isAutomatic=${isAutomatic}&`;
      }
      if (movementTypeIdList && movementTypeIdList !== null) {
        queryString += `movementTypeIdList=${movementTypeIdList}&`;
      }
      if (stateIdList && stateIdList !== null) {
        queryString += `stateIdList=${stateIdList}&`;
      }
      if (startDate && startDate !== null) {
        queryString += `startDate=${startDate}&`;
      }
      if (endDate && endDate !== null) {
        queryString += `endDate=${endDate}&`;
      }
      if (byCurrentMonth !== null) {
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
