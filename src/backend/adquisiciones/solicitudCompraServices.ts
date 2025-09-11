import { handleApiError } from '@/functions';
import { ServerResponseType } from '@/store';
import getServiceUrls from '../servicesUrl';
import { createApiConfig } from '../apiConfig';
import {
  PaginatedResponseType,
  SolicitudCompraSaveType,
  SolicitudCompraType,
} from '@/types';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.adquisicionServiceUrl);

export const getSolicitudCompra: (
  stateIdList: string | null,
  requestPurchaseId: number| null,
  branchId: number | null,
  userId: number | null,
  typeAdquisitionId: number | null,
  byCurrentMonth: boolean,
  startDate: string | null,
  endDate: string | null,
  page: number | null,
  limit: number | null,
  sortField: string | null,
  sortDirection: string | null
) => Promise<PaginatedResponseType | ServerResponseType> = async (

  stateIdList,
  requestPurchaseId,
  branchId,
  userId,
  typeAdquisitionId,
  byCurrentMonth,
  startDate,
  endDate,
  page,
  limit,
  sortField,
  sortDirection
) => {
  try {
    const generateQueryString = () => {
      const queryStringRoot = '/solicitud-compra?';

      const queryString = new URLSearchParams();

      if (stateIdList && stateIdList !== null)
        queryString.append('stateIdList', stateIdList.toString());
      if (requestPurchaseId && requestPurchaseId !== null)
        queryString.append('requestPurchaseId', requestPurchaseId.toString());
      if (branchId && branchId !== null)
        queryString.append('branchId', branchId.toString());
      if (typeAdquisitionId && typeAdquisitionId !== null)
        queryString.append('typeAdquisitionId', typeAdquisitionId.toString());
      if (userId && userId !== null)
        queryString.append('userId', userId.toString());
      if (byCurrentMonth && byCurrentMonth !== null)
        queryString.append('byCurrentMonth', byCurrentMonth.toString());
      if (startDate && startDate !== null)
        queryString.append('startDate', startDate);
      if (endDate && endDate !== null) queryString.append('endDate', endDate);
      if (page && page !== null) queryString.append('page', page.toString());
      if (limit && limit !== null)
        queryString.append('limit', limit.toString());
      if (sortField && sortField !== null)
        queryString.append('sortField', sortField);
      if (sortDirection && sortDirection !== null)
        queryString.append('sortDirection', sortDirection);

      return queryStringRoot + queryString.toString();
    };
    const response = await api.get(generateQueryString());
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getSolicitudCompraById: (
  requestPurchaseId: number
) => Promise<ServerResponseType | undefined> = async (requestPurchaseId) => {
  try {
    const response = await api.get(
      `/solicitud-compra/parametro/${requestPurchaseId}`
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const getDetailSolicitudCompraById: (
  requestPurchaseId: number
) => Promise<ServerResponseType | undefined> = async (requestPurchaseId) => {
  try {
    const response = await api.get(
      `/detalle-solicitud-compra/${requestPurchaseId}`
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const getEstadoSolicitudCompra: () => Promise<
  ServerResponseType | undefined
> = async () => {
  try {
    const response = await api.get(`/estado-solicitud`);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const getTipoSolicitudCompra: () => Promise<
  ServerResponseType | undefined
> = async () => {
  try {
    const response = await api.get(`/tipo-solicitud-compra`);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const getTipoAdquisicion: () => Promise<
  ServerResponseType | undefined
> = async () => {
  try {
    const response = await api.get(`/tipo-adquisicion`);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const getSolicitudesCompraBusqueda: (
  bodyToSend: any
) => Promise<PaginatedResponseType | ServerResponseType> = async (
  bodyToSend
) => {
  try {
    const response = await api.put(
      `/solicitud-compra/busqueda-avanzada`,
      bodyToSend
    );
    return response.data as PaginatedResponseType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const saveSolicitudCompra: (
  solicitud: SolicitudCompraSaveType
) => Promise<ServerResponseType> = async (solicitud) => {
  try {
    const response = await api.post(`/solicitud-compra`, solicitud);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateSolicitudCompra: (
  solicitud: SolicitudCompraSaveType,
  idSolicitud: number
) => Promise<ServerResponseType> = async (solicitud, idSolicitud) => {
  try {
    const response = await api.put(
      `/solicitud-compra?idSolicitud=${idSolicitud}`,
      solicitud
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getSolicitudByProveedorSucursal: (
  personId: number,
  branchId: number | null
) => Promise<SolicitudCompraType[] | ServerResponseType> = async (
  personId,
  branchId
) => {
  try {
    const response = await api.get(
      `/solicitud-compra/proveedor-sucursal?personaId=${personId}&sucursalId=${branchId}`
    );
    return response.data as SolicitudCompraType[];
  } catch (error) {
    return handleApiError(error);
  }
};
