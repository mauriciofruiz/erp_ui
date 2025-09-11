import { TipoCuentaType } from "@/types";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";
import { handleApiError } from "@/functions";

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getTipoCuenta: () => Promise<TipoCuentaType[]> = async () => {
    try {
        const response = await api.get(`/tipo-cuenta`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};