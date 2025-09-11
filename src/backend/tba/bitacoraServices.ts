import { ServerResponseType } from "@/store";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";
import { PaginatedResponseType } from "@/types";
import { handleApiError } from "@/functions";

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getBitacoraByClienteId: (
  clientId: number,
  page: number | null,
  limit: number | null,
  sortDirection: string | null,
  sortField: string | null
) => Promise<ServerResponseType | PaginatedResponseType> = async (clientId,page,limit,sortDirection,sortField) => {
  try {
    const generateQueryString = () => {
      let queryString = `/bitacora/cliente/${clientId}?`;
     
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
