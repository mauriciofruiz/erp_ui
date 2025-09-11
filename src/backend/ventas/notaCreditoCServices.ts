import { ServerResponseType } from '@/store';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { handleApiError } from '@/functions';
import {
  NotaCreditoGetType,
  NotaCreditoPostType,
  PaginatedResponseType,
} from '@/types';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.ventasServiceUrl);

export const getNotaCreditoClienteByParams: (
  stateIdList: string | null,
  clientId: number | null,
  documentNumber: string | null,
  invoiceNumber: string | null,
  branchId: number | null,
  ncTypeId: number | null,
  startDate: string | null,
  endDate: string | null,
  currentMonth: boolean | null,
  page: number | null,
  limit: number | null,
  sortDirection: string | null,
  sortField: string | null
) => Promise<PaginatedResponseType | ServerResponseType> = async (
  stateIdList,
  clientId,
  documentNumber,
  invoiceNumber,
  branchId,
  ncTypeId,
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
      const queryStringRoot = '/nota-credito-cliente?';

      const queryString = new URLSearchParams();

      if (stateIdList && stateIdList !== null)
        queryString.append('stateIdList', stateIdList);
      if (clientId && clientId !== null)
        queryString.append('clientId', clientId.toString());
      if (documentNumber && documentNumber !== null && documentNumber !== '')
        queryString.append('documentNumber', documentNumber);
      if (invoiceNumber && invoiceNumber !== null && invoiceNumber !== '')
        queryString.append('invoiceNumber', invoiceNumber);
      if (branchId && branchId !== null)
        queryString.append('branchId', branchId.toString());
      if (ncTypeId && ncTypeId !== null)
        queryString.append('ncTypeId', ncTypeId.toString());
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

// export const getRelatedDocumentsGuia: (
//   branchId: number,
//   isTransfer: boolean,
//   startDate: string,
//   endDate: string
// ) => Promise<RelatedDocumentsGuiaType[] | ServerResponseType> = async (
//   branchId,
//   isTransfer,
//   startDate,
//   endDate
// ) => {
//   try {
//     const response = await api.get(
//       `/guia-remision-manual/documento-relacionado?branchId=${branchId}&isTransfer=${isTransfer}&startDate=${startDate}&endDate=${endDate}`
//     );
//     return response.data as RelatedDocumentsGuiaType[];
//   } catch (error) {
//     return handleApiError(error);
//   }
// };

// export const getDetailRelatedDocumentsGuia: (
//   documentId: number,
//   isTransfer: boolean
// ) => Promise<DetailGuiaRemisionPostType[] | ServerResponseType> = async (
//   documentId,
//   isTransfer
// ) => {
//   try {
//     const response = await api.get(
//       `/guia-remision-manual/detalle-documento-relacionado?documentId=${documentId}&isTransfer=${isTransfer}`
//     );
//     return response.data as DetailGuiaRemisionPostType[];
//   } catch (error) {
//     return handleApiError(error);
//   }
// };

// * SAVE UPDATE GETBY ID

export const saveNotaCreditoCliente: (
  body: NotaCreditoPostType
) => Promise<ServerResponseType> = async (body) => {
  try {
    const response = await api.post(`/nota-credito-cliente`, body);
    return {
      message: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleApiError(error);
  }
};
export const updateNotaCreditoCliente: (
  body: NotaCreditoPostType,
  id: number
) => Promise<ServerResponseType> = async (body, id) => {
  try {
    const response = await api.put(`/nota-credito-cliente/${id}`, body);
    return {
      message: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getNotaCreditoClienteById: (
  id: number
) => Promise<NotaCreditoGetType | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/nota-credito-cliente/${id}`);
    return response.data as NotaCreditoGetType;
  } catch (error) {
    return handleApiError(error);
  }
};
