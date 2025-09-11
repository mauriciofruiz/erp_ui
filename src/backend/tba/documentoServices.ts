import { ServerResponseType } from '@/store';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import axios from 'axios';
import { handleApiError } from '@/functions';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

const apiAdquisicion = createApiConfig(serviceUrls.adquisicionServiceUrl);

export const lockDocument: (
  document: DocumentType
) => Promise<ServerResponseType | undefined> = async (document) => {
  try {
    const response = await api.post(`/acceso-documento`, document);

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

export const unlockDocument: (
  document: DocumentType
) => Promise<ServerResponseType | undefined> = async (document) => {
  try {
    const response = await api.put(`/acceso-documento/delete`, document);

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

export const validateAccessDocument: (
  document: DocumentType
) => Promise<ServerResponseType | undefined> = async (document) => {
  try {
    const response = await api.put(`/acceso-documento/find`, document);

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

export const getUserInDocument: (
  document: DocumentType
) => Promise<ServerResponseType | undefined> = async (document) => {
  try {
    const response = await api.put(`/acceso-documento/get/find`, document);

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

export const validateExistDocument: (
  id: number,
  documentType: string,
  documentNumber: string
) => Promise<boolean | ServerResponseType> = async (
  id,
  documentType,
  documentNumber
) => {
  try {
    const response = await apiAdquisicion.get(
      `/documento/existe/${id}?idTipoComprobante=${documentType}&numeroDocumento=${documentNumber}`
    );

    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
