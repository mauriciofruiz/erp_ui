import { handleApiError } from '@/functions';
import { ServerResponseType } from '@/store';
import getServiceUrls from '../servicesUrl';
import { createApiConfig } from '../apiConfig';
import {
  ListaEmpaqueGetInterface,
  ListaEmpaquePackedSendInterface,
  ListaEmpaqueTransferencia,
  PaginatedResponseType,
} from '@/types';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.adquisicionServiceUrl);

export const getListaEmpaqueMain: (
  stateIdList: string | null,
  userId: number | null,
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
  userId,
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
      const queryStringRoot = '/lista-empaque?';

      const queryString = new URLSearchParams();
      if (stateIdList && stateIdList !== null)
        queryString.append('stateIdList', stateIdList);
      if (userId && userId !== null)
        queryString.append('userId', userId.toString());
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

export const getDetailsByApertura: (
  listaEmpaque: ListaEmpaqueGetInterface
) => Promise<ListaEmpaqueGetInterface | ServerResponseType> = async (
  listaEmpaque
) => {
  try {
    const response = await api.put(
      `/detalle-lista-empaque/apertura-importacion/orden-compra`,
      listaEmpaque
    );
    return response.data as ListaEmpaqueGetInterface;
  } catch (error) {
    return handleApiError(error);
  }
};

// ? functions to save and update

export const saveLE: (
  body: ListaEmpaquePackedSendInterface
) => Promise<ServerResponseType> = async (body) => {
  try {
    const response = await api.post(`/lista-empaque`, body);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateLE: (
  body: ListaEmpaquePackedSendInterface,
  id: number
) => Promise<ServerResponseType> = async (body, id) => {
  try {
    const response = await api.put(`/lista-empaque/${id}`, body);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getByIdLE: (
  id: number
) => Promise<ListaEmpaqueGetInterface | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/lista-empaque/${id}`);
    return response.data as ListaEmpaqueGetInterface;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getListEmpaqueTransferencia: () => Promise<
  ListaEmpaqueTransferencia[] | ServerResponseType
> = async () => {
  try {
    const response = await api.get(`/lista-empaque/transferencia/lista`);
    return response.data as ListaEmpaqueTransferencia[];
  } catch (error) {
    return handleApiError(error);
  }
};
