import { ServerResponseType } from '@/store';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { handleApiError } from '@/functions';
import {
  PaginatedResponseType,
  PaymentInterface,
  PaymentPackedInterface,
} from '@/types';
import axios from 'axios';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.contabilidadServiceUrl);

export const getPaymentListByParams: (
  bankId: number | null,
  documentNumber: string | null,
  beneficiaryName: string | null,
  paymentAmount: number | null,
  stateIds: string | null,
  paymentMethodIds: string | null,
  documentDateStart: string | null,
  documentDateEnd: string | null,
  startDate: string | null,
  endDate: string | null,
  byCurrentMonth: boolean | null,
  page: number | null,
  limit: number | null,
  sortDirection: string | null,
  sortField: string | null
) => Promise<PaginatedResponseType | ServerResponseType> = async (
  bankId: number | null,
  documentNumber: string | null,
  beneficiaryName: string | null,
  paymentAmount: number | null,
  stateIds: string | null,
  paymentMethodIds: string | null,
  documentDateStart: string | null,
  documentDateEnd: string | null,
  startDate: string | null,
  endDate: string | null,
  byCurrentMonth,
  page,
  limit,
  sortDirection,
  sortField
) => {
  try {
    const generateQueryString = () => {
      let queryString = '/pago?';

      if (bankId && bankId !== null) queryString += `bankId=${bankId}&`;

      if (documentNumber && documentNumber !== null)
        queryString += `documentNumber=${documentNumber}&`;

      if (beneficiaryName && beneficiaryName !== null)
        queryString += `beneficiaryName=${beneficiaryName}&`;

      if (paymentAmount && paymentAmount !== null)
        queryString += `paymentAmount=${paymentAmount}&`;

      if (paymentMethodIds && paymentMethodIds !== null)
        queryString += `paymentMethodIds=${paymentMethodIds}&`;

      if (documentDateStart && documentDateStart !== null)
        queryString += `documentDateStart=${documentDateStart}&`;

      if (documentDateEnd && documentDateEnd !== null)
        queryString += `documentDateEnd=${documentDateEnd}&`;

      if (stateIds && stateIds !== null) queryString += `stateIds=${stateIds}&`;

      if (startDate && startDate !== null)
        queryString += `startDate=${startDate}&`;

      if (endDate && endDate !== null) queryString += `endDate=${endDate}&`;

      if (byCurrentMonth && byCurrentMonth !== null)
        queryString += `byCurrentMonth=${byCurrentMonth}&`;

      if (page && page !== null) queryString += `page=${page}&`;

      if (limit && limit !== null) queryString += `limit=${limit}&`;

      if (sortDirection && sortDirection !== null)
        queryString += `sortDirection=${sortDirection}&`;

      if (sortField && sortField !== null)
        queryString += `sortField=${sortField}&`;
      queryString = queryString.replace(/&$/, '');
      return queryString;
    };

    const response = await api.get(generateQueryString());
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const savePayment: (
  body: PaymentPackedInterface
) => Promise<ServerResponseType> = async (body) => {
  try {
    const response = await api.post(`/pago`, body);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updatePayment: (
  body: PaymentPackedInterface,
  id: number
) => Promise<ServerResponseType> = async (body, id) => {
  try {
    const response = await api.put(`/pago/${id}`, body);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getByPaymentId: (
  id: number
) => Promise<PaymentInterface | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/pago/${id}`);
    return response.data as PaymentInterface;
  } catch (error) {
    return handleApiError(error);
  }
};

export const validateCheckNumberByBankId: (
  bankId: number,
  documentNumber: string
) => Promise<ServerResponseType | undefined> = async (
  bankId,
  documentNumber
) => {
  try {
    const response = await api.get(
      `/pago/verificar-existencia/cheque?documentNumber=${documentNumber}&bankId=${bankId}`
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return {
          status: error.response.status,
          message: error.response.data,
        };
      } else {
        return {
          status: 500,
          message: 'Error Del Servidor: ' + error.message,
        };
      }
    }
  }
};

export const isPaymentDocumentNumberAvailable: (
  bankId: number,
  documentNumber: string,
  isChequePayment: boolean,
  documentDate: string
) => Promise<Boolean | ServerResponseType> = async (
  bankId,
  documentNumber,
  isChequePayment,
  documentDate
) => {
  try {
    const response = await api.get(
      `/pago/validacion/documento?documentNumber=${documentNumber}&bankId=${bankId}&isChequePayment=${isChequePayment}&documentDate=${documentDate}`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
