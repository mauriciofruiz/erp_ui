import { handleApiError } from '@/functions';
import { ServerResponseType } from '@/store';
import {
  DetailRecepcionCompraGetType,
  PaginatedResponseType,
  RecepcionCompraGetType,
  RecepcionCompraPackeageSendType,
} from '@/types';
import getServiceUrls from '../servicesUrl';
import { createApiConfig } from '../apiConfig';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.adquisicionServiceUrl);

export const getRecepcionesCompraMain: (
  stateIdList: string | null,
  receptionId: number | null,
  invoiceNumber: string | null,
  providerId: number | null,
  branchId: number | null,
  starDate: string | null,
  endDate: string | null,
  currentMonth: boolean | null,
  page: number | null,
  limit: number | null,
  sortDirection: string | null,
  sortField: string | null
) => Promise<PaginatedResponseType | ServerResponseType> = async (
  stateIdList,
  receptionId,
  invoiceNumber,
  providerId,
  branchId,
  starDate,
  endDate,
  currentMonth,
  page,
  limit,
  sortDirection,
  sortField
) => {
  try {
    const generateQueryString = () => {
      const queryStringRoot = '/recepcion-compra?';

      const queryString = new URLSearchParams();
      if (stateIdList && stateIdList !== null)
        queryString.append('stateIdList', stateIdList);
      if (receptionId && receptionId !== null)
        queryString.append('receptionId', receptionId.toString());
      if (invoiceNumber && invoiceNumber !== null)
        queryString.append('invoiceNumber', invoiceNumber.toString());
      if (providerId && providerId !== null)
        queryString.append('providerId', providerId.toString());
      if (branchId && branchId !== null)
        queryString.append('branchId', branchId.toString());
      if (starDate && starDate !== null)
        queryString.append('starDate', starDate);
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

export const saveRecepcionCompra: (
  recepcion: RecepcionCompraPackeageSendType
) => Promise<ServerResponseType | RecepcionCompraPackeageSendType> = async (
  recepcion
) => {
  try {
    const response = await api.post(`/recepcion-compra`, recepcion);
    return response.data as RecepcionCompraPackeageSendType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateRecepcionCompra: (
  recepcion: RecepcionCompraPackeageSendType | null,
  idRecepcion: number | null
) => Promise<ServerResponseType | RecepcionCompraPackeageSendType> = async (
  recepcion,
  idRecepcion
) => {
  try {
    const response = await api.put(
      `/recepcion-compra/${idRecepcion}`,
      recepcion
    );
    return response.data as RecepcionCompraPackeageSendType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getRecepcionCompraById: (
  receiptPurchaseId: number
) => Promise<RecepcionCompraGetType | ServerResponseType> = async (
  receiptPurchaseId
) => {
  try {
    const response = await api.get(`/recepcion-compra/${receiptPurchaseId}`);
    return response.data as RecepcionCompraGetType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getDetailRecepcionCompraByRecepcionId: (
  receiptPurchaseId: number
) => Promise<DetailRecepcionCompraGetType[] | ServerResponseType> = async (
  receiptPurchaseId
) => {
  try {
    const response = await api.get(
      `/detalle-recepcion-compra/recepcion/${receiptPurchaseId}`
    );
    return response.data as DetailRecepcionCompraGetType[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getRecepcionCompraForDevolution: (
  branchId: number | null
) => Promise<ServerResponseType | undefined> = async (branchId) => {
  try {
    const response = await api.get(
      `/recepcion-compra/devolucion-compra/${branchId}`
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const getDetailRecepcionCompraById: (
  detalleRecepcionId: number
) => Promise<ServerResponseType | undefined> = async (detalleRecepcionId) => {
  try {
    const response = await api.get(
      `/detalle-recepcion-compra/${detalleRecepcionId}`
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};
