import { handleApiError } from "@/functions";
import { ServerResponseType } from "@/store";
import { CajaGetType, CajaPostType, PaginatedResponseType } from "@/types";
import axios from "axios";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);


export const getCajaBySucursalId: (
    branchId: number
) => Promise<ServerResponseType | undefined> = async (
    branchId
) => {
        try {
            const response = await api.get(
                `/caja/sucursal/${branchId}`
            );
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


export const getCajasMainByParams: (
    branchId: number | null,
    name: string | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
) => Promise<ServerResponseType | PaginatedResponseType> = async (
    branchId,
    name,
    page,
    limit,
    sortDirection,
    sortField
) => {
        try {
            const generateQueryString = () => {
                let queryString = '/caja?';

                if (branchId && branchId !== null) {
                    queryString += `branchId=${branchId}&`;
                }
                if (name && name !== null) {
                    queryString += `name=${name}&`;
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

export const saveCaja: (
    caja: CajaPostType
) => Promise<ServerResponseType> = async (caja) => {
    try {
        const response = await api.post(`/caja`, caja);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const updateCaja: (
    cajaId: number,
    caja: CajaPostType
) => Promise<ServerResponseType> = async (cajaId, caja) => {
    try {
        const response = await api.put(`/caja/${cajaId}`, caja);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const getCajaBylId: (
    cajaId: number
) => Promise<ServerResponseType | CajaGetType> = async (
    cajaId
) => {
        try {
            const response = await api.get(
                `/caja/${cajaId}`
            );
            return response.data as CajaGetType;
        } catch (error) {
            return handleApiError(error);
        }
    };