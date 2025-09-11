import { handleApiError } from '@/functions';
import { CardInterface } from '@/types';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { ServerResponseType } from '@/store';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

// * Devuelve la lista de tarjetas ACTIVOS
export const getCardList: () => Promise<
  ServerResponseType | CardInterface[]
> = async () => {
  try {
    const response = await api.get(`/tarjeta`);
    return response.data as CardInterface[];
  } catch (error) {
    return handleApiError(error);
  }
};
