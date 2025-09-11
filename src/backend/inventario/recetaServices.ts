import { handleApiError } from '@/functions';
import { ServerResponseType } from '@/store';
import {
  RecetaGetIdType,
  RecetaPostType,
} from '@/types/inventario/receta.type';
import axios from 'axios';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { PaginatedResponseType } from '@/types';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.inventarioServiceUrl);

export const getMaterialsByUserId: (
  userId: number
) => Promise<ServerResponseType | undefined> = async (userId) => {
  try {
    const response = await api.get(`/receta?userId=${userId}`);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getMaterialsByParams: (
  startDate: string | null,
  endDate: string | null,
  productCode: number | null,
  productId: number | null,
  productName: string | null,
  userId: number | null,
  byCurrentMonth: boolean | null,
  page: number | null,
  limit: number | null,
  sortDirection: string,
  sortField: string
) => Promise<PaginatedResponseType | ServerResponseType> = async (
  startDate,
  endDate,
  productCode,
  productId,
  productName,
  userId,
  byCurrentMonth,
  page,
  limit,
  sortDirection,
  sortField
) => {
  try {
    const generateQueryString = () => {
      let queryString = '/receta?';

      queryString += `byCurrentMonth=${byCurrentMonth}&`;

      if (startDate && startDate !== null) {
        queryString += `startDate=${startDate}&`;
      }
      if (endDate && endDate !== null) {
        queryString += `endDate=${endDate}&`;
      }
      if (productCode && productCode !== null) {
        queryString += `productCode=${productCode}&`;
      }
      if (productId && productId !== null) {
        queryString += `productId=${productId}&`;
      }
      if (productName && productName !== null) {
        queryString += `productName=${productName}&`;
      }
      if (userId && userId !== null) {
        queryString += `userId=${userId}&`;
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
    return handleApiError(error);
  }
};

export const getProductsReceta: (
  productCode: string | null,
  shortName: string | null,
  isProduction: boolean | null,
  rawMaterial: boolean | null,
  belongsRecipe: boolean | null,
  param: string | null
) => Promise<ServerResponseType | undefined> = async (
  productCode,
  shortName,
  isProduction,
  rawMaterial,
  belongsRecipe,
  param
) => {
  try {
    const generateQueryString = () => {
      let queryString = '/producto/receta?';

      if (productCode && productCode !== null) {
        queryString += `codProducto=${productCode}&`;
      }
      if (shortName && shortName !== null) {
        queryString += `shortName=${shortName}&`;
      }
      if (isProduction && isProduction !== null) {
        queryString += `isProduction=${isProduction}&`;
      }
      if (rawMaterial && rawMaterial !== null) {
        queryString += `rawMaterial=${rawMaterial}&`;
      }
      if (belongsRecipe && belongsRecipe !== null) {
        queryString += `belongsRecipe=${belongsRecipe}&`;
      }
      if (param && param !== null) {
        queryString += `param=${param}&`;
      }
      queryString = queryString.replace(/&$/, '');
      return queryString;
    };
    const response = await api.get(generateQueryString());
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManoObra: (
  labourName: string | null,
  labourCode: string | null,
  param: string | null
) => Promise<ServerResponseType | undefined> = async (
  labourName,
  labourCode,
  param
) => {
  try {
    const generateQueryString = () => {
      let queryString = '/mano-obra/buscar/lista?';

      if (labourName && labourName !== null) {
        queryString += `labourName=${labourName}&`;
      }
      if (labourCode && labourCode !== null) {
        queryString += `labourCode=${labourCode}&`;
      }
      if (param && param !== null) {
        queryString += `param=${param}&`;
      }
      queryString = queryString.replace(/&$/, '');
      return queryString;
    };
    const response = await api.get(generateQueryString());
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCostosIndirectos: (
  cifName: string | null,
  cifCode: string | null,
  param: string | null
) => Promise<ServerResponseType | undefined> = async (
  cifName,
  cifCode,
  param
) => {
  try {
    const generateQueryString = () => {
      let queryString = 'cif/buscar/lista?';

      if (cifName && cifName !== null) {
        queryString += `cifName=${cifName}&`;
      }
      if (cifCode && cifCode !== null) {
        queryString += `cifCode=${cifCode}&`;
      }
      if (param && param !== null) {
        queryString += `param=${param}&`;
      }
      queryString = queryString.replace(/&$/, '');
      return queryString;
    };
    const response = await api.get(generateQueryString());
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const saveReceta: (
  recetaPost: RecetaPostType
) => Promise<ServerResponseType | undefined> = async (recetaPost) => {
  try {
    const response = await api.post(`/receta`, recetaPost);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return {
          status: error.response.status,
          message: error.response.data,
        };
      } else {
        return {
          status: 500,
          message: 'Error Del Servidor: ' + error.message,
        };
      }
    }
  }
};

export const updateReceta: (
  requestId: number,
  recetaPost: RecetaPostType
) => Promise<ServerResponseType | undefined> = async (
  requestId,
  recetaPost
) => {
  try {
    const response = await api.put(`/receta/${requestId}`, recetaPost);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return {
          status: error.response.status,
          message: error.response.data,
        };
      } else {
        return {
          status: 500,
          message: 'Error Del Servidor: ' + error.message,
        };
      }
    }
  }
};

export const getRecetaTypeById: (
  requestId: number
) => Promise<RecetaGetIdType | ServerResponseType> = async (requestId) => {
  try {
    const response = await api.get(`/receta/${requestId}`);
    return response.data as RecetaGetIdType;
  } catch (error) {
    return handleApiError(error);
  }
};
