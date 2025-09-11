import { TaxSupportInterface } from '@/types';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { handleApiError } from '@/functions';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getAllSustentoTributario: () => Promise<
  TaxSupportInterface[]
> = async () => {
  try {
    const response = await api.get(`/sustento-tributario`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};
