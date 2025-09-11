import { handleApiError } from '@/functions';
import { ServerResponseType } from '@/store';
import {
  FacturaProveedorResponseInterface,
  FacturaProveedorResumeInterface,
  FacturaProveedorSender,
  PaginatedResponseType,
} from '@/types';
import getServiceUrls from '../servicesUrl';
import { createApiConfig } from '../apiConfig';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.adquisicionServiceUrl);

export const saveFacturaProveedor: (
  factura: FacturaProveedorSender
) => Promise<FacturaProveedorResponseInterface | ServerResponseType> = async (
  factura
) => {
  try {
    const response = await api.post(`/facturacion-proveedor`, factura);
    return response.data as FacturaProveedorResponseInterface;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateFacturaProveedor: (
  factura: FacturaProveedorSender,
  idFactura: number
) => Promise<FacturaProveedorResponseInterface | ServerResponseType> = async (
  factura,
  idFactura
) => {
  try {
    const response = await api.put(
      `/facturacion-proveedor/update/${idFactura}`,
      factura
    );
    return response.data as FacturaProveedorResponseInterface;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getFacturasProveedorMain: (
  stateIdList: string | null,
  importOpeningId: number | null,
  providerId: number | null,
  documentNumber: string | null,
  documentType: string | null,
  branchId: number | null,
  userId: number | null,
  description: string | null,
  emissionDate: string | null,
  emissionEndDate: string | null,
  creationDate: string | null,
  creationEndDate: string | null,
  currentMonth: boolean | null,
  page: number | null,
  limit: number | null,
  sortDirection: string | null,
  sortField: string | null
) => Promise<PaginatedResponseType | ServerResponseType> = async (
  stateIdList,
  importOpeningId,
  providerId,
  documentNumber,
  documentType,
  branchId,
  userId,
  description,
  emissionDate,
  emissionEndDate,
  creationDate,
  creationEndDate,
  currentMonth,
  page,
  limit,
  sortDirection,
  sortField
) => {
  try {
    const generateQueryString = () => {
      const queryStringRoot = '/facturacion-proveedor?';

      const queryString = new URLSearchParams();
      if (stateIdList && stateIdList !== null)
        queryString.append('stateIdList', stateIdList);
      if (importOpeningId && importOpeningId !== null)
        queryString.append('importOpeningId', importOpeningId.toString());
      if (providerId && providerId !== null)
        queryString.append('providerId', providerId.toString());
      if (documentNumber && documentNumber !== null)
        queryString.append('documentNumber', documentNumber);
      if (documentType && documentType !== null)
        queryString.append('documentType', documentType);
      if (branchId && branchId !== null)
        queryString.append('branchId', branchId.toString());
      if (userId && userId !== null)
        queryString.append('userId', userId.toString());
      if (description && description !== null)
        queryString.append('description', description);
      if (emissionDate && emissionDate !== null)
        queryString.append('emissionStartDate', emissionDate);
      if (emissionEndDate && emissionEndDate !== null)
        queryString.append('emissionEndDate', emissionEndDate);
      if (creationDate && creationDate !== null)
        queryString.append('startDate', creationDate);
      if (creationEndDate && creationEndDate !== null)
        queryString.append('endDate', creationEndDate);
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

export const setFacturaFromXml: (
  xml: any
) => Promise<FacturaProveedorResponseInterface | ServerResponseType> = async (
  xml
) => {
  try {
    const response = await api.put(`/facturacion-proveedor/set-from-xml`, xml);
    return response.data as FacturaProveedorResponseInterface;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getFacturaResponseById: (
  idFactura: number,
  idTipoComprobante: string
) => Promise<FacturaProveedorResponseInterface | ServerResponseType> = async (
  idFactura,
  idTipoComprobante
) => {
  try {
    const response = await api.get(
      `/facturacion-proveedor/respuesta?id=${idFactura}&idTipoComprobante=${idTipoComprobante}`
    );
    return response.data as FacturaProveedorResponseInterface;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getFacturasForLiquidacion: (
  idApertura: number
) => Promise<FacturaProveedorResumeInterface[] | ServerResponseType> = async (
  idApertura
) => {
  try {
    const response = await api.get(
      `/facturacion-proveedor/liquidacion/${idApertura}`
    );
    return response.data as FacturaProveedorResumeInterface[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getFacturaProveedorByParams: (
  providerId: number,
  documentNumber: string,
  idTipoNC: number
) => Promise<FacturaProveedorResponseInterface[] | ServerResponseType> = async (
  providerId,
  documentNumber,
  idTipoNC
) => {
  try {
    const response = await api.get(
      `/facturacion-proveedor/para/nota-credito?providerId=${providerId}&documentNumber=${documentNumber}&idTipoNC=${idTipoNC}`
    );
    return response.data as FacturaProveedorResponseInterface[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const isDocumentAvailableReimbursement: (
  documentNumber: string,
  identification: string
) => Promise<Boolean | ServerResponseType> = async (
  documentNumber,
  identification
) => {
  try {
    const response = await api.get(
      `/reembolso/validacion/documento?documentNumber=${documentNumber}&identification=${identification}`
    );
    return response.data as Boolean;
  } catch (error) {
    return handleApiError(error);
  }
};
