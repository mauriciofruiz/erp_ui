import { PaginatedResponseType, SucursalPostType, SucursalType } from "@/types";
import axios from "axios";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";
import { ServerResponseType } from "@/store";
import { handleApiError } from "@/functions";

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getSucursalByName: (
    name?: string,
    isActives?: boolean
) => Promise<SucursalType[] | undefined> = async (
    name?: string,
    isActives?: boolean
) => {
        try {
            const response = await api.get(
                `/sucursal?name=${name}&isActives=${isActives}`
            );

            return response.data
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

export const getSucursalById: (
    sucursalId: number
) => Promise<SucursalType | ServerResponseType> = async (
    sucursalId: number
) => {
        try {
            const response = await api.get(
                `/sucursal/${sucursalId}`
            );
            return response.data as SucursalType
        } catch (error) {
            return handleApiError(error);
        }
    };


export const getSucursalProduction: () => Promise<SucursalType[] | undefined> = async () => {
    try {
        const response = await api.get(`sucursal?isProduction=true`);
        return response.data
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

export const getSucursalMain: (
    cityId: number | null,
    regionId: string | null,
    categoryBranchId: string | null,
    name: string | null,
    mnemonic: string | null,
    isOutlets: boolean,
    isActive: boolean,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
) => Promise<PaginatedResponseType | ServerResponseType> = async (
    cityId,
    regionId,
    categoryBranchId,
    name,
    mnemonic,
    isOutlets,
    isActive,
    page,
    limit,
    sortDirection,
    sortField
) => {
        try {
            const generateQueryString = () => {
                let queryString = '/sucursal?';

                if (cityId && cityId !== null) {
                    queryString += `cityId=${cityId}&`;
                }
                if (regionId && regionId !== null) {
                    queryString += `regionId=${regionId}&`;
                }
                if (categoryBranchId && categoryBranchId !== null) {
                    queryString += `categoryBranchId=${categoryBranchId}&`;
                }
                if (name && name !== null) {
                    queryString += `name=${name}&`;
                }
                if (mnemonic && mnemonic !== null) {
                    queryString += `mnemonic=${mnemonic}&`;
                }
                if (isOutlets) {
                    queryString += `isOutlets=${isOutlets}&`;
                }
                if (isActive) {
                    queryString += `isActive=${isActive}&`;
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

export const saveBranch: (
    branchPost: SucursalPostType
) => Promise<ServerResponseType> = async (branchPost) => {
    try {
        const response = await api.post(`/sucursal`, branchPost);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const updateBranch: (
    branchId: number,
    branchPost: SucursalPostType
) => Promise<ServerResponseType> = async (branchId, branchPost) => {
    try {
        const response = await api.put(`/sucursal/${branchId}`, branchPost);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};