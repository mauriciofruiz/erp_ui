import { MenuType, PaginatedResponseType } from "@/types";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";
import { ServerResponseType } from "@/store";
import { handleApiError } from "@/functions";
import axios from "axios";

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const createMenu: (
    menu: MenuType
) => Promise<ServerResponseType | undefined> = async (menu) => {
    try {
        const response = await api.post(`/menu`, menu);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const updateMenu: (
    menuId: number,
    menu: MenuType
) => Promise<ServerResponseType | undefined> = async (menuId, menu) => {
    try {
        const response = await api.put(`/menu/${menuId}`, menu);

        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const getMenuById: (
    menuId: number
) => Promise<ServerResponseType | undefined> = async (menuId) => {
    try {
        const response = await api.get(`/menu/${menuId}`);

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

export const getAllMenus: () => Promise<
    ServerResponseType | undefined
> = async () => {
    try {
        const response = await api.get(`/menu`);

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


export const getMenuByParams: (
    menuId: number
) => Promise<ServerResponseType | undefined> = async (menuId) => {
    try {
        const response = await api.get(`/menu?menuFatherId=${menuId}`);
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


export const getMenuMainByParams: (
    menuId: number | null,
    menuName: string | null,
    menuLevel: number | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
) => Promise<ServerResponseType | PaginatedResponseType> = async (
    menuId,
    menuName,
    menuLevel,
    page,
    limit,
    sortDirection,
    sortField
) => {
        try {
            const generateQueryString = () => {
                let queryString = '/menu?';

                if (menuId && menuId !== null) {
                    queryString += `menuId=${menuId}&`;
                }
                if (menuName && menuName !== null) {
                    queryString += `menuName=${menuName}&`;
                }
                if (menuLevel && menuLevel !== null) {
                    queryString += `menuLevel=${menuLevel}&`;
                }
                if (page && page !== null) {
                    queryString += `page=${page}&`;
                }
                if (limit && limit !== null) {
                    queryString += `limit=${limit}&`;
                }
                if (sortField && sortField !== null) {
                    queryString += `sortField=${sortField}&`;
                }
                if (sortDirection && sortDirection !== null) {
                    queryString += `sortDirection=${sortDirection}&`;
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