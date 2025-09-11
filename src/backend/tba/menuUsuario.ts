import { MenuUsuarioType } from "@/types";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";
import { ServerResponseType } from "@/store";
import axios from "axios";

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const createMenuUsuario: (
    menu: MenuUsuarioType
) => Promise<ServerResponseType | undefined> = async (menu) => {
    try {
        const response = await api.post(`/menu-usuario`, menu);

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

export const updateMenuUsuario: (
    menu: MenuUsuarioType
) => Promise<ServerResponseType | undefined> = async (menu) => {
    try {
        const response = await api.put(`/menu-usuario/${menu.menuId}`, menu);

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

export const updateMenuUsuarioByList: (
    menuList: MenuUsuarioType[]
) => Promise<ServerResponseType | undefined> = async (menuList) => {
    try {
        const response = await api.put(`/menu-usuario`, menuList);

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

export const getMenuUsuarioById: (
    menu: MenuUsuarioType
) => Promise<ServerResponseType | undefined> = async (menu) => {
    try {
        const response = await api.get(`/menu-usuario/${menu.menuId}`);

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

export const getMenuUsuarioParams: (
    userId?: number,
    menuId?: number
) => Promise<ServerResponseType | undefined> = async (
    userId?: number,
    menuId?: number
) => {
        let cadena = userId ? `?userId=${userId}` : '';
        cadena = cadena.concat(
            userId && menuId ? `&menuId=${menuId}` : menuId ? `?menuId=${menuId}` : ''
        );
        try {
            const response = await api.get(`/menu-usuario${cadena}`);

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