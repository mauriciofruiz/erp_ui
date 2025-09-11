import { handleApiError } from '@/functions';
import { ServerResponseType } from '@/store';
import { PaginatedResponseType, RetencionResponseInterface } from '@/types';
import getServiceUrls from '../servicesUrl';
import { createApiConfig } from '../apiConfig';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.adquisicionServiceUrl);

export const getMain: (
  startDate: string | null,
  endDate: string | null,
  retentionNumber: number | null,
  invoiceNumber: number | null,
  providerId: number | null,
  retentionValue: number | null,
  invoiceValue: number | null,
  branchId: number | null,
  stateId: number | null,
  userId: number | null,
  byCurrentMonth: boolean | null,
  page: number | null,
  limit: number | null,
  sortDirection: string | null,
  sortField: string | null
) => Promise<PaginatedResponseType | ServerResponseType> = async (
  startDate,
  endDate,
  retentionNumber,
  invoiceNumber,
  providerId,
  retentionValue,
  invoiceValue,
  branchId,
  stateId,
  userId,
  byCurrentMonth,
  page,
  limit,
  sortDirection,
  sortField
) => {
    try {
      const generateQueryString = () => {
        let queryString = '/retencion-proveedor?';
        queryString += `byCurrentMonth=${byCurrentMonth}&`;

        if (startDate && startDate !== null) {
          queryString += `startDate=${startDate}&`;
        }
        if (endDate && endDate !== null) {
          queryString += `endDate=${endDate}&`;
        }
        if (retentionNumber && retentionNumber !== null) {
          queryString += `retentionNumber=${retentionNumber}&`;
        }
        if (invoiceNumber && invoiceNumber !== null) {
          queryString += `invoiceNumber=${invoiceNumber}&`;
        }
        if (providerId && providerId !== null) {
          queryString += `providerId=${providerId}&`;
        }
        if (retentionValue && retentionValue !== null) {
          queryString += `retentionValue=${retentionValue}&`;
        }
        if (invoiceValue && invoiceValue !== null) {
          queryString += `invoiceValue=${invoiceValue}&`;
        }
        if (branchId && branchId !== null) {
          queryString += `branchId=${branchId}&`;
        }
        if (stateId && stateId !== null) {
          queryString += `stateId=${stateId}&`;
        }
        if (userId && userId !== null) {
          queryString += `userId=${userId}&`;
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
      return handleApiError(error);
    }
  };

export const getRetencionResponseById: (
  id: number
) => Promise<RetencionResponseInterface | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/retencion-proveedor/${id}`);
    return response.data as RetencionResponseInterface;
  } catch (error) {
    return handleApiError(error);
  }
};
