import { handleApiError } from '@/functions';
import { PaginatedResponseType, PeriodInterface } from '@/types';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { ServerResponseType } from '@/store';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getLastPeriods: () => Promise<
  PeriodInterface[] | ServerResponseType
> = async () => {
  try {
    const response = await api.get(`/periodo`);
    return response.data as PeriodInterface[];
  } catch (error) {
    return handleApiError(error);
  }
};


export const getPeriodoByParams: (
  moduleId: number,
  startDate: string | null,
  endDate: string | null,
  page: number | null,
  limit: number | null,
  sortDirection: string | null,
  sortField: string | null,
)
  => Promise<PaginatedResponseType | ServerResponseType> = async (
    moduleId,
    startDate,
    endDate,
    page,
    limit,
    sortDirection,
    sortField,
  ) => {
    try {
      const generateQueryString = () => {
        let queryString = '/periodo?';

        if (moduleId && moduleId !== null) {
          queryString += `moduleId=${moduleId}&`;
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
        if (sortDirection && sortDirection !== null) {
          queryString += `sortDirection=${sortDirection}&`;
        }
        if (sortField && sortField !== null) {
          queryString += `sortField=${sortField}&`;
        }
        queryString = queryString.replace(/&$/, '');
        return queryString;
      };
      const response = await api.get(
        generateQueryString()
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  };


  export const savePeriodo: (
    periodo: PeriodInterface
  ) => Promise<ServerResponseType> = async (periodo) => {
    try {
      const response = await api.post(`/periodo`, periodo);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  };
