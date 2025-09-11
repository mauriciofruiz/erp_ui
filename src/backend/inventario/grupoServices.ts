import { ServerResponseType } from '@/store';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { handleApiError } from '@/functions';
import { GrupoType, PaginatedResponseType, SubgrupoType } from '@/types';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.inventarioServiceUrl);

export const getAllGrupos: () => Promise<
  ServerResponseType | undefined
> = async () => {
  try {
    const response = await api.get(`/grupo`);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAllSubGrupos: () => Promise<
  ServerResponseType | undefined
> = async () => {
  try {
    const response = await api.get(`/subgrupo`);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getGruposByParams: (
  groupName: string | null,
  page: number | null,
  limit: number | null,
  sortDirection: string | null,
  sortField: string | null
) => Promise<ServerResponseType | PaginatedResponseType> = async (
  groupName,
  page,
  limit,
  sortDirection,
  sortField
) => {
    try {
      const generateQueryString = () => {
        let queryString = '/grupo?';

        if (groupName && groupName !== null) {
          queryString += `name=${groupName}&`;
        }
        if (page && page !== null) {
          queryString += `page=${page}&`;
        }
        if (limit && limit !== null) {
          queryString += `limit=${limit}&`;
        }
        if (sortDirection && sortDirection !== null) {
          queryString += `sortDirection=${sortDirection}&`;
        }
        if (sortField && sortField !== null) {
          queryString += `sortField=${sortField}&`;
        }
        queryString = queryString.replace(/&$/, '');
        return queryString;
      };

      const response = await api.get(generateQueryString());
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

export const saveGrupo: (
  grupo: GrupoType
) => Promise<ServerResponseType> = async (grupo) => {
  try {
    const response = await api.post(`/grupo`, grupo);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateGrupo: (
  grupoId: number,
  grupo: GrupoType
) => Promise<ServerResponseType> = async (grupoId, grupo) => {
  try {
    const response = await api.put(`/grupo/${grupoId}`, grupo);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};


export const getSubGruposByParams: (
  subgroupName: string | null,
  page: number | null,
  limit: number | null,
  sortDirection: string | null,
  sortField: string | null
) => Promise<ServerResponseType | PaginatedResponseType> = async (
  subgroupName,
  page,
  limit,
  sortDirection,
  sortField
) => {
    try {
      const generateQueryString = () => {
        let queryString = '/subgrupo?';

        if (subgroupName && subgroupName !== null) {
          queryString += `name=${subgroupName}&`;
        }
        if (page && page !== null) {
          queryString += `page=${page}&`;
        }
        if (limit && limit !== null) {
          queryString += `limit=${limit}&`;
        }
        if (sortDirection && sortDirection !== null) {
          queryString += `sortDirection=${sortDirection}&`;
        }
        if (sortField && sortField !== null) {
          queryString += `sortField=${sortField}&`;
        }
        queryString = queryString.replace(/&$/, '');
        return queryString;
      };
      
      const response = await api.get(generateQueryString());
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

export const saveSubGrupo: (
  subgrupo: SubgrupoType
) => Promise<ServerResponseType> = async (subgrupo) => {
  try {
    const response = await api.post(`/subgrupo`, subgrupo);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateSubGrupo: (
  subgrupoId: number,
  subgrupo: SubgrupoType
) => Promise<ServerResponseType> = async (subgrupoId, subgrupo) => {
  try {
    const response = await api.put(`/subgrupo/${subgrupoId}`, subgrupo);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};