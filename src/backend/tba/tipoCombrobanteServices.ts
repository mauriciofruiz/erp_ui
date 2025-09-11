import { VoucherTypeInterface } from '@/types';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { handleApiError } from '@/functions';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getAllTipoComprobante: () => Promise<
  VoucherTypeInterface[]
> = async () => {
  try {
    const response = await api.get(`/tipo-comprobante`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};
