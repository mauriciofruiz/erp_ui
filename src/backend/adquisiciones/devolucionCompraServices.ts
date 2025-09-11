import { handleApiError } from '@/functions';
import { ServerResponseType } from '@/store';
import { DevolucionCompraPackeageSendType } from '@/types';
import getServiceUrls from '../servicesUrl';
import { createApiConfig } from '../apiConfig';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.adquisicionServiceUrl);

export const getDevolucionesCompraMain: () => Promise<
  ServerResponseType | undefined
> = async () => {
  try {
    const response = await api.get(`/devolucion-compra`);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const getDevolucionCompraById: (
  devolutionId: number
) => Promise<ServerResponseType | undefined> = async (devolutionId) => {
  try {
    const response = await api.get(`/devolucion-compra/${devolutionId}`);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const getDetailDevolucionCompraById: (
  devolutionId: number
) => Promise<ServerResponseType | undefined> = async (devolutionId) => {
  try {
    const response = await api.get(
      `/detalle-devolucion-compra/${devolutionId}`
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const saveDevolucionCompra: (
  devolucion: DevolucionCompraPackeageSendType
) => Promise<ServerResponseType | undefined> = async (devolucion) => {
  try {
    const response = await api.post(`/devolucion-compra`, devolucion);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const updateDevolucionCompra: (
  devolucion: DevolucionCompraPackeageSendType | null,
  idDevolucion: number | null
) => Promise<ServerResponseType | undefined> = async (
  devolucion,
  idDevolucion
) => {
  try {
    const response = await api.put(
      `/devolucion-compra/${idDevolucion}`,
      devolucion
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};
