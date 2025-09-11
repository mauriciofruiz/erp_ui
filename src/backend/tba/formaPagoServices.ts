import { FormaDePagoType, PaginatedResponseType } from "@/types";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";
import { handleApiError } from "@/functions";
import { ServerResponseType } from "@/store";

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getFormaDePago: () => Promise<FormaDePagoType[]> = async () => {
    try {
        const response = await api.get(`/forma-pago-cobro`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const getFormasPagoByParams: (
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
) => Promise<ServerResponseType | PaginatedResponseType> = async (
    page,
    limit,
    sortDirection,
    sortField
) => {
        try {
            const generateQueryString = () => {
                let queryString = '/forma-pago-cobro?';

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

export const saveFormaPago: (
    formaPago: FormaDePagoType
) => Promise<ServerResponseType> = async (formaPago) => {
    try {
        const response = await api.post(`/forma-pago-cobro`, formaPago);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const updateFormaPago: (
    formaPagoId: string,
    formaPago: FormaDePagoType
) => Promise<ServerResponseType> = async (formaPagoId, formaPago) => {
    try {
        const response = await api.put(`/forma-pago-cobro/${formaPagoId}`, formaPago);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};