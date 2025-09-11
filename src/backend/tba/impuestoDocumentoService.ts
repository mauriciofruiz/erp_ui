import { handleApiError } from '@/functions';
import { ImpuestoDocumentoInterface } from '@/types';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { ServerResponseType } from '@/store';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getTaxesByDocument: (
  idDocumento: number | null,
  idTipoDocumento: number | null,
  idVoucher: number | null
) => Promise<ImpuestoDocumentoInterface[] | ServerResponseType> = async (
  idDocumento,
  idTipoDocumento,
  idVoucher
) => {
  try {
    const response =
      idDocumento !== null
        ? await api.get(`/impuesto-documento?idDocumento=${idDocumento}`)
        : await api.get(
            `/impuesto-documento?idTipoDocumento=${idTipoDocumento}&idVoucher=${idVoucher}`
          );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
