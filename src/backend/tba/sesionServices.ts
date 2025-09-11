import { ServerResponseType } from "@/store";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";
import { PaginatedResponseType, SesionMainType } from "@/types";
import { handleApiError } from "@/functions";
import axios from "axios";

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getSesionByParams: (
    userId: number | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
) => Promise<ServerResponseType | PaginatedResponseType> = async(
    userId,
    page,
    limit,
    sortDirection,
    sortField
) => {
    try {
        const generateQueryString = () => {
            let queryString = '/sesion?';

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
        handleApiError(error);
        throw error;
    }
}

export const updateStatusSesion: (
    sessionId: number
) => Promise<ServerResponseType> = async (sessionId) => {
    try {
        const response = await api.put(`/sesion/${sessionId}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const updateAllStatusSesion: (
    body: SesionMainType[]
) => Promise<ServerResponseType> = async (body) => {
    try {
        const response = await api.put(`/sesion`, body);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const getAllSessions: () => Promise<
    ServerResponseType | undefined
> = async () => {
    try {
        const response = await api.get(`/sesion`);

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
