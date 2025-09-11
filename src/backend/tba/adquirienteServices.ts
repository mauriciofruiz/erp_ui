import { handleApiError } from '@/functions';
import { AcquirerInterface } from '@/types';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { ServerResponseType } from '@/store';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

// * Devuelve la lista de adquirientes ACTIVOS
export const getAcquirerList: () => Promise<
  ServerResponseType | AcquirerInterface[]
> = async () => {
  try {
    const response = await api.get(`/adquiriente`);
    return response.data as AcquirerInterface[];
  } catch (error) {
    return handleApiError(error);
  }
};
