
import { ClientCategoryType, PaginatedResponseType } from "@/types";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";
import { handleApiError } from "@/functions";
import { ServerResponseType } from "@/store";

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getClientCategoryList: () => Promise<ServerResponseType | ClientCategoryType[]> = async () => {
    try {
        const response = await api.get(`/categoria-cliente`);
        return response.data as ClientCategoryType[];
    } catch (error) {
        return handleApiError(error);
    }
};


export const getCategoriasMainByParams: (
    clientCategoryName: string | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
) => Promise<ServerResponseType | PaginatedResponseType> = async (
    clientCategoryName,
    page,
    limit,
    sortDirection,
    sortField
) => {
        try {
            const generateQueryString = () => {
                let queryString = '/categoria-cliente?';

                if (clientCategoryName && clientCategoryName !== null) {
                    queryString += `name=${clientCategoryName}&`;
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

export const saveCategory: (
    category: ClientCategoryType
) => Promise<ServerResponseType> = async (category) => {
    try {
        const response = await api.post(`/categoria-cliente`, category);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const updateCategory: (
    categoryId: number,
    category: ClientCategoryType
) => Promise<ServerResponseType> = async (categoryId, category) => {
    try {
        const response = await api.put(`/categoria-cliente/${categoryId}`, category);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};
