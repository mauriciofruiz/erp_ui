import { ServerResponseType } from "@/store";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";
import axios from "axios";
import { PaginatedResponseType, UserPostType, UserType } from "@/types";
import { handleApiError } from "@/functions";

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getUsuarioParams: (
    nick?: string,
    status?: boolean
) => Promise<ServerResponseType | undefined> = async (
    nick?: string,
    status?: boolean
) => {
        try {
            const response = await api.get(
                `/usuario?nick=${nick}&status=${status}`
            );

            return {
                status: response.status,
                message: response.data.list,
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

export const getUsuariosSolicitudCompra: () => Promise<
    ServerResponseType | undefined
> = async () => {
    try {
        const response = await api.get(`/solicitud-compra/usuario`);
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

export const getUsuariosOrdenCompra: () => Promise<
    ServerResponseType | undefined
> = async () => {
    try {
        const response = await api.get(`/orden-compra/usuario`);
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

export const getUsuarioByName: (
    name?: string,
    status?: boolean
) => Promise<ServerResponseType | undefined> = async (
    name?: string,
    status?: boolean
) => {
        try {
            const response = await api.get(
                `/usuario?name=${name}&status=${status}`
            );

            return {
                status: response.status,
                message: response.data.list,
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

export const getUsuarioById: (
    userId: number
) => Promise<ServerResponseType | UserType> = async (
    userId
) => {
        try {
            const response = await api.get(
                `/usuario/${userId}`
            );
            return response.data as UserType;
        } catch (error) {
            return handleApiError(error);
        }
    };

export const getUsersMainByParams: (
    nick: string | null,
    status: boolean | null,
    identification: string | null,
    name: string | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
) => Promise<ServerResponseType | PaginatedResponseType> = async (
    nick,
    status,
    identification,
    name,
    page,
    limit,
    sortDirection,
    sortField
) => {
        try {
            const generateQueryString = () => {
                let queryString = '/usuario?';

                if (nick && nick !== null) {
                    queryString += `nick=${nick}&`;
                }
                if (status !== null) {
                    queryString += `status=${status}&`;
                }
                if (identification && identification !== null) {
                    queryString += `identification=${identification}&`;
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

export const getSalesUsers: () => Promise<ServerResponseType | UserType[]> = async () => {
    try {
        const response = await api.get(`/venta/usuario`);
        return response.data as UserType[];
    } catch (error) {
        return handleApiError(error);
    }
};

export const updateUsuario: (
    userId: number,
    usuarioPost: UserPostType
) => Promise<ServerResponseType> = async (userId, usuarioPost) => {
    try {
        const response = await api.put(`/usuario/${userId}`, usuarioPost);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};
