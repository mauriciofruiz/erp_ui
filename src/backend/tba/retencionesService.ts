import { RetencionGeneralInterface } from '@/types';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { handleApiError } from '@/functions';
import { ServerResponseType } from '@/store';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getAllRetencionesIVA: () => Promise<
  RetencionGeneralInterface[]
> = async () => {
  try {
    const response = await api.get(`/retencion-iva`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getAllRetencionesFuente: () => Promise<
  RetencionGeneralInterface[]
> = async () => {
  try {
    const response = await api.get(`/retencion-fuente`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getAllRetencionesIVACliente: () => Promise<
  RetencionGeneralInterface[] | ServerResponseType
> = async () => {
  try {
    const response = await api.get(`/retencion-iva-cliente`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAllRetencionesFuenteCliente: () => Promise<
  RetencionGeneralInterface[] | ServerResponseType
> = async () => {
  try {
    const response = await api.get(`/retencion-fuente-cliente`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
