import { ServerResponseType } from '@/store';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { handleApiError } from '@/functions';
import {
  CierreGetType,
  CierrePostType,
  DenominacionEfectivoInterface,
  DetalleCobroCierreCajaInterface,
  EgresoInterface,
  ImportacionesEgresoType,
  PaginatedResponseType,
} from '@/types';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.contabilidadServiceUrl);

export const getCierreCajaByParams: (
  stateIds: string | null,
  branchId: number | null,
  userId: number | null,
  byCurrentMonth: boolean,
  startDate: string | null,
  endDate: string | null,
  page: number | null,
  limit: number | null,
  sortField: string | null,
  sortDirection: string | null
) => Promise<PaginatedResponseType | ServerResponseType> = async (
  stateIds,
  branchId,
  userId,
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
      const queryStringRoot = '/cierre?';

      const queryString = new URLSearchParams();

      if (stateIds && stateIds !== null)
        queryString.append('stateIds', stateIds);
      if (branchId && branchId !== null)
        queryString.append('branchId', branchId.toString());
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

export const getDetallesCobroCierreCaja: (
  cashId: number
) => Promise<DetalleCobroCierreCajaInterface[] | ServerResponseType> = async (
  cashId
) => {
  try {
    const generateQueryString = () => {
      const queryStringRoot = '/cierre/cobros?';

      const queryString = new URLSearchParams();

      if (cashId && cashId !== null)
        queryString.append('cashId', cashId.toString());

      return queryStringRoot + queryString.toString();
    };
    const response = await api.get(generateQueryString());
    return response.data as DetalleCobroCierreCajaInterface[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAllDenominacionEfectivo: () => Promise<
  DenominacionEfectivoInterface[] | ServerResponseType
> = async () => {
  try {
    const queryStringRoot = '/denominacion';
    const response = await api.get(queryStringRoot);
    return response.data as DenominacionEfectivoInterface[];
  } catch (error) {
    return handleApiError(error);
  }
};

// * SAVE AND UPDATE CIERRE DE CAJA

export const saveCierreCaja: (
  body: CierrePostType
) => Promise<ServerResponseType> = async (body) => {
  try {
    const response = await api.post(`/cierre`, body);
    return {
      message: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateCierreCaja: (
  body: CierrePostType,
  idCierre: number
) => Promise<ServerResponseType> = async (body, idCierre) => {
  try {
    const response = await api.put(`/cierre/${idCierre}`, body);
    return {
      message: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCierreById: (
  idCierre: number
) => Promise<CierreGetType | ServerResponseType> = async (idCierre) => {
  try {
    const response = await api.get(`/cierre/get/${idCierre}`);
    return response.data as CierreGetType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateEgresoCaja: (
  body: EgresoInterface,
  idEgreso: number
) => Promise<ServerResponseType> = async (body, idEgreso) => {
  try {
    const response = await api.put(`/cierre/egreso-caja/${idEgreso}`, body);
    return {
      message: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const availableToFacturar: (idCaja: number) => Promise<boolean> = async (
  idCaja
) => {
  try {
    const response = await api.get(
      `/cierre/cobros/verificar-existencia/${idCaja}`
    );
    return response.data as boolean;
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

export const getImportacionesEgreso: (
  branchId: number
) => Promise<ImportacionesEgresoType[] | ServerResponseType> = async (
  branchId
) => {
  try {
    const response = await api.get(
      `/cierre/importacion/egreso-caja?branchId=${branchId}`
    );
    return response.data as ImportacionesEgresoType[];
  } catch (error) {
    return handleApiError(error);
  }
};
