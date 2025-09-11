import { handleApiError } from '@/functions';
import { BancoType, BankType, PaginatedResponseType } from '@/types';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { ServerResponseType } from '@/store';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

// * Devuelve la lista de bancos catalogo ACTIVOS
export const getBankCatalogList: () => Promise<
  ServerResponseType | BankType[]
> = async () => {
  try {
    const response = await api.get(`/catalogo-banco`);
    return response.data as BankType[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getBankList: () => Promise<
  ServerResponseType | BancoType[]
> = async () => {
  try {
    const response = await api.get(`/banco/consultar/lista`);
    return response.data as BancoType[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getLastNumberCheckByBankId: (
  bankId: number
) => Promise<ServerResponseType | number> = async (bankId) => {
  try {
    const response = await api.get(`/banco/ultimo/cheque?bankId=${bankId}`);
    return response.data as number;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAccountBankMain: (
  bankName: string | null,
  bankAccountNumber: string | null,
  page: number | null,
  limit: number | null,
  sortDirection: string | null,
  sortField: string | null
) => Promise<PaginatedResponseType | ServerResponseType> = async (
  bankName,
  bankAccountNumber,
  page,
  limit,
  sortDirection,
  sortField
) => {
  try {
    const generateQueryString = () => {
      let queryString = '/banco?';

      if (bankName && bankName !== null) {
        queryString += `bankName=${bankName}&`;
      }
      if (bankAccountNumber && bankAccountNumber !== null) {
        queryString += `bankAccountNumber=${bankAccountNumber}&`;
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
};

export const getBankById: (
  bankId: number
) => Promise<BancoType | ServerResponseType> = async (bankId: number) => {
  try {
    const response = await api.get(`/banco/${bankId}`);
    return response.data as BancoType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const saveBank: (
  banckPost: BancoType
) => Promise<ServerResponseType> = async (banckPost) => {
  try {
    const response = await api.post(`/banco`, banckPost);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateBank: (
  banckId: number,
  banckPost: BancoType
) => Promise<ServerResponseType> = async (banckId, banckPost) => {
  try {
    const response = await api.put(`/banco/${banckId}`, banckPost);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCatalogoBanksByParams: (
  bankCatalogName: string | null,
  bankCatalogCode: string | null,
  page: number | null,
  limit: number | null,
  sortDirection: string | null,
  sortField: string | null
) => Promise<ServerResponseType | PaginatedResponseType> = async (
  bankCatalogName,
  bankCatalogCode,
  page,
  limit,
  sortDirection,
  sortField
) => {
  try {
    const generateQueryString = () => {
      let queryString = '/catalogo-banco?';

      if (bankCatalogName && bankCatalogName !== null) {
        queryString += `bankCatalogName=${bankCatalogName}&`;
      }
      if (bankCatalogCode && bankCatalogCode !== null) {
        queryString += `bankCatalogCode=${bankCatalogCode}&`;
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
};

export const saveCatalogBank: (
  bankCatalogPost: BankType
) => Promise<ServerResponseType> = async (bankCatalogPost) => {
  try {
    const response = await api.post(`/catalogo-banco`, bankCatalogPost);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateCatalogBank: (
  bankCatalogId: number,
  bankCatalogPost: BankType
) => Promise<ServerResponseType> = async (bankCatalogId, bankCatalogPost) => {
  try {
    const response = await api.put(
      `/catalogo-banco/${bankCatalogId}`,
      bankCatalogPost
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getBankListIsBank: () => Promise<
  ServerResponseType | BancoType[]
> = async () => {
  try {
    const response = await api.get(`/banco/consultar/lista/banco`);
    return response.data as BancoType[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getBankListByBranchId: (
  branchId: number
) => Promise<
  ServerResponseType | BancoType[]
> = async (branchId) => {
  try {
    const response = await api.get(`/banco/consultar/lista/sucursal?branchId=${branchId}`);
    return response.data as BancoType[];
  } catch (error) {
    return handleApiError(error);
  }
};
