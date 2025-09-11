import { handleApiError } from '@/functions';
import { ServerResponseType } from '@/store';
import {
  FacturaVentaDto,
  FacturaVentaForNC,
  PaginatedResponseType,
} from '@/types';
import getServiceUrls from '../servicesUrl';
import { createApiConfig } from '../apiConfig';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.ventasServiceUrl);

export const saveFacturaVenta: (
  factura: FacturaVentaDto
) => Promise<ServerResponseType> = async (factura) => {
  try {
    const response = await api.post(`/facturacion-cliente`, factura);
    return {
      message: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateFacturaVenta: (
  factura: FacturaVentaDto,
  idFactura: number
) => Promise<ServerResponseType> = async (factura, idFactura) => {
  try {
    const response = await api.put(
      `/facturacion-cliente/${idFactura}`,
      factura
    );
    return {
      message: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getFacturaVentaById: (
  idFactura: number
) => Promise<FacturaVentaDto | ServerResponseType> = async (idFactura) => {
  try {
    const response = await api.get(`/facturacion-cliente/${idFactura}`);
    return response.data as FacturaVentaDto;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getFacturaVentaMain: (
  stateIdList: string | null,
  clientId: number | null,
  documentNumber: string | null,
  branchId: number | null,
  userId: number | null,
  emissionStartDate: Date | null,
  emissionEndDate: Date | null,
  currentMonth: boolean | null,
  page: number | null,
  limit: number | null,
  sortDirection: string | null,
  sortField: string | null
) => Promise<PaginatedResponseType | ServerResponseType> = async (
  stateIdList,
  clientId,
  documentNumber,
  branchId,
  userId,
  emissionStartDate,
  emissionEndDate,
  currentMonth,
  page,
  limit,
  sortDirection,
  sortField
) => {
  try {
    const generateQueryString = () => {
      const queryStringRoot = '/facturacion-cliente?';

      const queryString = new URLSearchParams();
      if (stateIdList && stateIdList !== null)
        queryString.append('stateIdList', stateIdList);
      if (clientId && clientId !== null)
        queryString.append('clientId', clientId.toString());
      if (documentNumber && documentNumber !== null)
        queryString.append('documentNumber', documentNumber);
      if (branchId && branchId !== null)
        queryString.append('branchId', branchId.toString());
      if (userId && userId !== null)
        queryString.append('userId', userId.toString());
      if (emissionStartDate && emissionStartDate !== null)
        queryString.append('emissionStartDate', emissionStartDate.toString());
      if (emissionEndDate && emissionEndDate !== null)
        queryString.append('emissionEndDate', emissionEndDate.toString());
      if (currentMonth && currentMonth !== null)
        queryString.append('byCurrentMonth', currentMonth.toString());
      if (page && page !== null) queryString.append('page', page.toString());
      if (limit && limit !== null)
        queryString.append('limit', limit.toString());
      if (sortDirection && sortDirection !== null)
        queryString.append('sortDirection', sortDirection);
      if (sortField && sortField !== null)
        queryString.append('sortField', sortField);
      return queryStringRoot + queryString.toString();
    };
    const response = await api.get(generateQueryString());
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const calculateFacturaVenta: (
  facturaDto: FacturaVentaDto
) => Promise<FacturaVentaDto | ServerResponseType> = async (facturaDto) => {
  try {
    const response = await api.put(
      `/detalle-facturacion-cliente/calculo`,
      facturaDto
    );
    return response.data as FacturaVentaDto;
  } catch (error) {
    return handleApiError(error);
  }
};

export const isDocumentAvailable: (
  documentNumber: string,
  bankId: number
) => Promise<Boolean | ServerResponseType> = async (documentNumber, bankId) => {
  try {
    const response = await api.get(
      `/detalle-cobro/numero-documento/disponible?documentNumber=${documentNumber}&bankId=${bankId}`
    );
    return response.data as Boolean;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getFacturasForCreditNote: (
  clientId: number,
  documentNumber: string,
  idTipoNC: number
) => Promise<FacturaVentaForNC[] | ServerResponseType> = async (
  clientId,
  documentNumber,
  idTipoNC
) => {
  try {
    const response = await api.get(
      `/facturacion-cliente/para/nota-credito?clientId=${clientId}&documentNumber=${documentNumber}&idTipoNC=${idTipoNC}`
    );
    return response.data as FacturaVentaForNC[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getFacturasForDebitNote: (
  clientId: number,
  documentNumber: string,
) => Promise<FacturaVentaForNC[] | ServerResponseType> = async (
  clientId,
  documentNumber,
) => {
  try {
    const response = await api.get(
      `/facturacion-cliente/para/nota-debito?clientId=${clientId}&documentNumber=${documentNumber}`
    );
    return response.data as FacturaVentaForNC[];
  } catch (error) {
    return handleApiError(error);
  }
}
