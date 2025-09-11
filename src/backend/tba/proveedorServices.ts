import { ServerResponseType } from '@/store';
import {
  PersonProviderType,
  ProveederDataType,
  ProveedorPersonPostType,
} from '@/types';
import getServiceUrls from '../servicesUrl';
import { createApiConfig } from '../apiConfig';
import axios from 'axios';
import { handleApiError } from '@/functions';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getProviderPersonByParam: (
  param: string
) => Promise<PersonProviderType[] | ServerResponseType> = async (param) => {
  try {
    const response = await api.get(`/proveedor/persona?param=${param}`);

    return response.data as PersonProviderType[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getProveedoresPendienteSolicitudCompra: () => Promise<
  PersonProviderType[] | ServerResponseType
> = async () => {
  try {
    const response = await api.get(`/proveedor/solicitud-compra`);

    return response.data as PersonProviderType[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getProveedorPersonaByProveedor: (
  providerId: number
) => Promise<PersonProviderType | ServerResponseType> = async (providerId) => {
  try {
    const response = await api.get(`/persona/proveedor/${providerId}`);

    return response.data as PersonProviderType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getProveedorData: (
  providerId: number
) => Promise<ProveederDataType | ServerResponseType> = async (providerId) => {
  try {
    const response = await api.get(`/proveedor/por-parametro/${providerId}`);
    return response.data as ProveederDataType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const saveProveedor: (
  proveedorPostType: ProveedorPersonPostType
) => Promise<ServerResponseType | undefined> = async (proveedorPostType) => {
  try {
    const response = await api.post(`/proveedor`, proveedorPostType);
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

export const updateProveedor: (
  proveedorId: number,
  proveedorPostType: ProveedorPersonPostType
) => Promise<ServerResponseType | undefined> = async (
  proveedorId,
  proveedorPostType
) => {
  try {
    const response = await api.put(
      `/proveedor/${proveedorId}`,
      proveedorPostType
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

export const getProveedoresPendienteListaPedido: () => Promise<
  PersonProviderType | ServerResponseType
> = async () => {
  try {
    const response = await api.get(`/proveedor/lista-pedido`);

    return response.data as PersonProviderType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getProveedoresTransportista: () => Promise<
  PersonProviderType[] | ServerResponseType
> = async () => {
  try {
    const response = await api.get(`/proveedor/transportista`);

    return response.data as PersonProviderType[];
  } catch (error) {
    return handleApiError(error);
  }
};
