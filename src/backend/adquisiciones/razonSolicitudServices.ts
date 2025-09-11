import { handleApiError } from "@/functions";
import { ServerResponseType } from "@/store";
import getServiceUrls from "../servicesUrl";
import { createApiConfig } from "../apiConfig";

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.adquisicionServiceUrl);

export const getRazonesSolicitud: () => Promise<
    ServerResponseType | undefined
> = async () => {
    try {
        const response = await api.get(`/razon-solicitud`);
        return {
            status: response.status,
            message: response.data,
        };
    } catch (error) {
        handleApiError(error);
    }
};