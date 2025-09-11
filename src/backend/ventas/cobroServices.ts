import { ServerResponseType } from '@/store';
import { AdvanceClientType, CobroGetType, PaginatedResponseType } from '@/types';
import { createApiConfig } from '../apiConfig';
import { handleApiError } from '@/functions';
import getServiceUrls from '../servicesUrl';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.ventasServiceUrl);


export const getCobroMain: (
  chargeNumber: number | null,
  clientId: number | null,
  userId: number | null,
  invoiceNumber: string | null,
  branchId: number | null,
  amount: number | null,
  emissionStartDate: Date | null,
  emissionEndDate: Date | null,
  currentMonth: boolean | null,
  page: number | null,
  limit: number | null,
  sortDirection: string | null,
  sortField: string | null
) => Promise<PaginatedResponseType | ServerResponseType> = async (
  chargeNumber,
  clientId,
  userId,
  invoiceNumber,
  branchId,
  amount,
  emissionStartDate,
  emissionEndDate,
  currentMonth,
  page,
  limit,
  sortDirection,
  sortField
) => {
  try {
    const generateQueryString = () => {
      const queryStringRoot = '/cobro?';
      const queryString = new URLSearchParams();
      if (chargeNumber && chargeNumber !== null)
        queryString.append('chargeNumber', chargeNumber.toString());
      if (clientId && clientId !== null)
        queryString.append('clientId', clientId.toString());
      if (userId && userId !== null)
        queryString.append('userId', userId.toString());
      if (invoiceNumber && invoiceNumber !== null)
        queryString.append('invoiceNumber', invoiceNumber);
      if (branchId && branchId !== null)
        queryString.append('branchId', branchId.toString());
      if (amount && amount !== null)
        queryString.append('amount', amount.toString());
      if (emissionStartDate && emissionStartDate !== null)
        queryString.append('startDate', emissionStartDate.toString());
      if (emissionEndDate && emissionEndDate !== null)
        queryString.append('endDate', emissionEndDate.toString());
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
    return response.data as PaginatedResponseType;
  } catch (error) {
    return handleApiError(error);
  }
};


export const getCobroById: (
  idCobro: number
) => Promise<CobroGetType | ServerResponseType> = async (idCobro) => {
  try {
    const response = await api.get(`/cobro/${idCobro}`);
    return response.data as CobroGetType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAdvancesByClientId: (
  id: number
) => Promise<AdvanceClientType[] | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/anticipo-cobro/cliente/${id}`);
    return response.data as AdvanceClientType[];
  } catch (error) {
    return handleApiError(error);
  }
};
