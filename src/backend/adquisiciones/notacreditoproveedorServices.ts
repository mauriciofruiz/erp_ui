import { NotaCreditoProveedorResponse, NotaCreditoProveedorSender, PaginatedResponseType } from "@/types";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";
import { ServerResponseType } from "@/store";
import { handleApiError } from "@/functions";
import axios from "axios";

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.adquisicionServiceUrl);


export const getNotaCreditoProvByParams: (
    startDate: string | null,
    endDate: string | null,
    documentNumber: number | null,
    userId: number | null,
    providerId: number | null,
    stateIdList: number | null,
    value: number | null,
    typeId: number | null,
    byCurrentMonth: boolean | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
) => Promise<PaginatedResponseType | ServerResponseType> = async (
    startDate,
    endDate,
    documentNumber,
    userId,
    providerId,
    stateIdList,
    value,
    typeId,
    byCurrentMonth,
    page,
    limit,
    sortDirection,
    sortField
) => {
        try {
            const generateQueryString = () => {
                let queryString = '/nota-credito-proveedor?';

                if (startDate && startDate !== null) {
                    queryString += `startDate=${startDate}&`;
                }
                if (endDate && endDate !== null) {
                    queryString += `endDate=${endDate}&`;
                }
                if (documentNumber && documentNumber !== null) {
                    queryString += `documentNumber=${documentNumber}&`;
                }
                if (userId && userId !== null) {
                    queryString += `userId=${userId}&`;
                }
                if (providerId && providerId !== null) {
                    queryString += `providerId=${providerId}&`;
                }
                if (stateIdList && stateIdList !== null) {
                    queryString += `stateIdList=${stateIdList}&`;
                }
                if (value && value !== null) {
                    queryString += `value=${value}&`;
                }
                if (typeId && typeId !== null) {
                    queryString += `typeId=${typeId}&`;
                }
                if (byCurrentMonth && byCurrentMonth !== null) {
                    queryString += `byCurrentMonth=${byCurrentMonth}&`;
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
            throw error; // Re-throw the error after handling it if necessary
        }
    };

export const saveNotaCredito: (
    notaCreditoPost: NotaCreditoProveedorSender
) => Promise<ServerResponseType | undefined> = async (notaCreditoPost) => {
    try {
        const response = await api.post(`/nota-credito-proveedor`, notaCreditoPost);
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

export const updateNotaCredito: (
    requestId: number,
    notaCreditoPost: NotaCreditoProveedorSender
) => Promise<ServerResponseType | undefined> = async (requestId, notaCreditoPost) => {
    try {
        const response = await api.put(`/nota-credito-proveedor/${requestId}`, notaCreditoPost);
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

export const getNotaCreditoById: (
    notaCreditoId: number
) => Promise<NotaCreditoProveedorResponse | ServerResponseType> = async (notaCreditoId) => {
    try {
        const response = await api.get(`/nota-credito-proveedor/${notaCreditoId}`);
        return response.data as NotaCreditoProveedorResponse;
    } catch (error) {
        return handleApiError(error);
    }
};
