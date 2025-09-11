import { handleApiError } from '@/functions';
import { PaginatedResponseType, RolPost, RolUserPost, RoleInterface } from '@/types';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { ServerResponseType } from '@/store';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getAllRoles: () => Promise<
  RoleInterface[] | ServerResponseType
> = async () => {
  try {
    const response = await api.get(`/rol`);
    return response.data as RoleInterface[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getRolByUser: (
  userId: number
) => Promise<
  RolUserPost[] | ServerResponseType
> = async (
  user
) => {
    try {
      const response = await api.get(`/rol-usuario/${user}`);
      return response.data as RolUserPost[];
    } catch (error) {
      return handleApiError(error);
    }
  };


export const getRolesByParams: (
  page: number | null,
  limit: number | null,
  sortDirection: string | null,
  sortField: string | null
) => Promise<
  PaginatedResponseType | ServerResponseType
> = async (
  page,
  limit,
  sortDirection,
  sortField
) => {
    try {
      const generateQueryString = () => {
        let queryString = '/rol?';

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
      return handleApiError(error);
    }
  };

export const saveRol: (
  rolPost: RolPost
) => Promise<ServerResponseType> = async (rolPost) => {
  try {
    const response = await api.post(`/rol`, rolPost);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateRol: (
  rolId: number,
  rolPost: RolPost
) => Promise<ServerResponseType> = async (rolId, rolPost) => {
  try {
    const response = await api.put(`/rol/${rolId}`, rolPost);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getRolById: (
  rolId: number
) => Promise<RoleInterface | ServerResponseType> = async (
  rolId
) => {
    try {
      const response = await api.get(`/rol/${rolId}`);
      return response.data as RoleInterface;
    } catch (error) {
      return handleApiError(error);
    }
  };