import { ServerResponseType } from '@/store';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { handleApiError } from '@/functions';
import {
  AccountEgresoType,
  AccountSendInterface,
  AccountTreeNodeType,
  AccountType,
} from '@/types';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.contabilidadServiceUrl);

export const getPlanCuentas: () => Promise<
  AccountTreeNodeType | ServerResponseType
> = async () => {
  try {
    const response = await api.get(`/cuentas/all-data/get`);
    return response.data as AccountTreeNodeType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCuentaById: (
  id: number
) => Promise<ServerResponseType | undefined> = async (id) => {
  try {
    const response = await api.get(`/cuentas/get/${id}`);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCuentaByParam: (
  param: string
) => Promise<AccountType[] | ServerResponseType> = async (param) => {
  try {
    const response = await api.get(`/cuentas?param=${param}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCuentaByParamManuales: (
  param: string
) => Promise<AccountType[]> = async (param) => {
  try {
    const response = await api.get(`/cuentas/manuales?param=${param}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCuentaTarjetasPago: () => Promise<
  AccountSendInterface[] | ServerResponseType
> = async () => {
  try {
    const response = await api.get(`/cuentas/tarjetas-credito`);
    return response.data as AccountSendInterface[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAccountsForClient: () => Promise<
  ServerResponseType | AccountType[]
> = async () => {
  try {
    const response = await api.get(`/cuentas/all-data/cliente`);
    return response.data as AccountType[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCuentaByParamAutomatic: (
  param: string
) => Promise<ServerResponseType | AccountType[]> = async (param) => {
  try {
    const response = await api.get(`/cuentas/automaticas?param=${param}`);
    return response.data as AccountType[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCuentaEgresoCaja: () => Promise<
  AccountEgresoType[] | ServerResponseType
> = async () => {
  try {
    const response = await api.get(`/cuentas/egreso-caja`);
    return response.data as AccountEgresoType[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCuentaByIdHook: (
  id: number
) => Promise<AccountType | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/cuentas/get/${id}`);
    return response.data as AccountType;
  } catch (error) {
    return handleApiError(error);
  }
};
