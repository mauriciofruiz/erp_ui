import { handleApiError } from "@/functions";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";
import { ServerResponseType } from "@/store";
import { PaginatedResponseType } from "@/types";

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getDocsByParams: (
    documentNumber: string | null,
    documentType: string | null,
    name: string | null,
    identification: string | null,
    accesKey: string | null,	
    isAuthorized: boolean,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
) => Promise<ServerResponseType | PaginatedResponseType> = async (
    documentNumber,
    documentType,
    name,
    identification,
    accesKey,
    isAuthorized,
    page,
    limit,
    sortDirection,
    sortField
) => {
        try {
            const generateQueryString = () => {
                let queryString = '/documento?';

                if (documentNumber && documentNumber !== null) {
                    queryString += `documentNumber=${documentNumber}&`;
                }
                if (documentType !== null) {
                    queryString += `documentType=${documentType}&`;
                }
                if (name && name !== null) {
                    queryString += `name=${name}&`;
                }
                if (identification && identification !== null) {
                    queryString += `identification=${identification}&`;
                }
                if (accesKey && accesKey !== null) {
                    queryString += `accesKey=${accesKey}&`;
                }
                if (isAuthorized) {
                    queryString += `isAuthorized=${isAuthorized}&`;
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