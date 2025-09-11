import { RegimenFiscalType } from "@/types";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";
import { handleApiError } from "@/functions";
import axios from "axios";
import { ServerResponseType } from "@/store";

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getRegimenFiscal: () => Promise<ServerResponseType | RegimenFiscalType[]> = async () => {
    try {
        const response = await api.get(`/tipo-identificacion-fiscal`);
        return response.data as RegimenFiscalType[];
    } catch (error) {
        return handleApiError(error);
    }
};

export const getRegimenFiscalById: (
    param: string
) => Promise<RegimenFiscalType> = async (id) => {
    try {
        const response = await api.get(`/tipo-identificacion-fiscal/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const getIdentificacionRepetida: (
    param: string
) => Promise<ServerResponseType | undefined> = async (id) => {
    try {
        const response = await api.get(`/proveedor/verificar-existencia/${id}`);
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
