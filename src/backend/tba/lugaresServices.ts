import { CityType, PaisType, ParroquiaType, ProvinceType } from "@/types";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";
import { handleApiError } from "@/functions";
import { ServerResponseType } from "@/store";
import axios from "axios";

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getPaises: () => Promise<ServerResponseType | PaisType[]> = async () => {
    try {
        const response = await api.get(`/pais`);
        return response.data as PaisType[];
    } catch (error) {
        return handleApiError(error);
    }
};

export const getPaisById: (
    param: string
) => Promise<PaisType[]> = async (id) => {
    try {
        const response = await api.get(`/pais/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const getProvinceById: (
    param: string
) => Promise<ProvinceType> = async (id) => {
    try {
        const response = await api.get(`/provincia/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const getProvinceByParams: (
    param: string
) => Promise<ServerResponseType | undefined> = async (param) => {
    try {
        const response = await api.get(`/provincia?provinceName=${param}`);

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
}

export const getCityById: (
    param: string
) => Promise<CityType> = async (id) => {
    try {
        const response = await api.get(`/ciudad/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const getCityByParams: (
    param: string
) => Promise<ServerResponseType | undefined> = async (param) => {
    try {
        const response = await api.get(`/ciudad?cityName=${param}`);

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
}

export const getCityByProvinceId: (id: string) => Promise<ServerResponseType | CityType[]> = async (id) => {
    try {
        const response = await api.get(`/ciudad?provinceId=${id}`);
        return response.data as CityType[];
    } catch (error) {
        return handleApiError(error);
    }
};

export const getProvincesByCountryId: (id: number) => Promise<ServerResponseType | ProvinceType[]> = async (id) => {
    try {
        const response = await api.get(`/provincia?countryId=${id}`);
        return response.data as ProvinceType[];
    } catch (error) {
        return handleApiError(error);
    }
};


export const getParishesByCityId: (id: string) => Promise<ServerResponseType | ParroquiaType[]> = async (id) => {
    try {
        const response = await api.get(`/parroquia/ciudad/${id}`);
        return response.data as ParroquiaType[];
    } catch (error) {
        return handleApiError(error);
    }
};

export const getParroquias: () => Promise<ParroquiaType[]> = async () => {
    try {
        const response = await api.get(`/parroquia`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const getParroquiaById: (
    param: string
) => Promise<ParroquiaType> = async (id) => {
    try {
        const response = await api.get(`/parroquia/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const getParroquiaByParams: (
    param: string
) => Promise<ServerResponseType | undefined> = async (param) => {
    try {
        const response = await api.get(`/parroquia?param=${param}`);

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
}
