import { ServerResponseType } from '@/store';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { handleApiError } from '@/functions';
import {
  DetailGuiaRemisionPostType,
  GuiaRemisionGetType,
  GuiaRemisionPostType,
  PaginatedResponseType,
  RelatedDocumentsGuiaType,
} from '@/types';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.inventarioServiceUrl);

export const getGuiaRemisionByParams: (
  documentNumber: string | null,
  documentNumberOrigin: string | null,
  branchId: number | null,
  stateIdList: string | null,
  userId: number | null,
  documentTypeId: number | null,
  byCurrentMonth: boolean,
  startDate: string | null,
  endDate: string | null,
  page: number | null,
  limit: number | null,
  sortField: string | null,
  sortDirection: string | null
) => Promise<PaginatedResponseType | ServerResponseType> = async (
  documentNumber,
  documentNumberOrigin,
  branchId,
  stateIdList,
  userId,
  documentTypeId,
  byCurrentMonth,
  startDate,
  endDate,
  page,
  limit,
  sortField,
  sortDirection
) => {
  try {
    const generateQueryString = () => {
      const queryStringRoot = '/guia-remision?';

      const queryString = new URLSearchParams();

      if (documentNumber && documentNumber !== null && documentNumber !== '')
        queryString.append('documentNumber', documentNumber);
      if (
        documentNumberOrigin &&
        documentNumberOrigin !== null &&
        documentNumberOrigin !== ''
      )
        queryString.append('documentNumberOrigin', documentNumberOrigin);
      if (branchId && branchId !== null)
        queryString.append('branchId', branchId.toString());
      if (stateIdList && stateIdList !== null)
        queryString.append('stateIdList', stateIdList.toString());
      if (userId && userId !== null)
        queryString.append('userId', userId.toString());
      if (documentTypeId && documentTypeId !== null)
        queryString.append('documentTypeId', documentTypeId.toString());
      if (byCurrentMonth && byCurrentMonth !== null)
        queryString.append('byCurrentMonth', byCurrentMonth.toString());
      if (startDate && startDate !== null)
        queryString.append('startDate', startDate);
      if (endDate && endDate !== null) queryString.append('endDate', endDate);
      if (page && page !== null) queryString.append('page', page.toString());
      if (limit && limit !== null)
        queryString.append('limit', limit.toString());
      if (sortField && sortField !== null)
        queryString.append('sortField', sortField);
      if (sortDirection && sortDirection !== null)
        queryString.append('sortDirection', sortDirection);

      return queryStringRoot + queryString.toString();
    };
    const response = await api.get(generateQueryString());
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getRelatedDocumentsGuia: (
  branchId: number,
  isTransfer: boolean,
  startDate: string,
  endDate: string
) => Promise<RelatedDocumentsGuiaType[] | ServerResponseType> = async (
  branchId,
  isTransfer,
  startDate,
  endDate
) => {
  try {
    const response = await api.get(
      `/guia-remision-manual/documento-relacionado?branchId=${branchId}&isTransfer=${isTransfer}&startDate=${startDate}&endDate=${endDate}`
    );
    return response.data as RelatedDocumentsGuiaType[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getDetailRelatedDocumentsGuia: (
  documentId: number,
  isTransfer: boolean
) => Promise<DetailGuiaRemisionPostType[] | ServerResponseType> = async (
  documentId,
  isTransfer
) => {
  try {
    const response = await api.get(
      `/guia-remision-manual/detalle-documento-relacionado?documentId=${documentId}&isTransfer=${isTransfer}`
    );
    return response.data as DetailGuiaRemisionPostType[];
  } catch (error) {
    return handleApiError(error);
  }
};

// * SAVE UPDATE GETBY ID

export const saveGuiaRemision: (
  body: GuiaRemisionPostType
) => Promise<ServerResponseType> = async (body) => {
  try {
    const response = await api.post(`/guia-remision-manual`, body);
    return {
      message: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleApiError(error);
  }
};
export const updateGuiaRemision: (
  body: GuiaRemisionPostType,
  id: number
) => Promise<ServerResponseType> = async (body, id) => {
  try {
    const response = await api.put(`/guia-remision-manual/${id}`, body);
    return {
      message: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

//todo: getGuiaRemisionById por parte del backend
export const getGuiaRemisionById: (
  id: number
) => Promise<GuiaRemisionGetType | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/guia-remision-manual/get/${id}`);
    return response.data as GuiaRemisionGetType;
  } catch (error) {
    return handleApiError(error);
  }
};
