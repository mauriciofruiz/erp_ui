import { handleApiError } from '@/functions';
import { TransportistaGuiaInterface } from '@/types';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { ServerResponseType } from '@/store';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getTransportistaByIdentification: (
  param: string
) => Promise<ServerResponseType | TransportistaGuiaInterface[]> = async (
  param
) => {
  try {
    const response = await api.get(`/transporte/activo/get?param=${param}`);
    return response.data as TransportistaGuiaInterface[];
  } catch (error) {
    return handleApiError(error);
  }
};
