import { IdentificacionFiscalType } from "@/types";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";
import { handleApiError } from "@/functions";

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getIdentificacionFiscalList: () => Promise<IdentificacionFiscalType[]> = async () => {
    try {
        const response = await api.get(`/identificacion-fiscal`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};