
import { MaritalStatusType } from "@/types";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";
import { handleApiError } from "@/functions";
import { ServerResponseType } from "@/store";

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getEstadoCivilList: () => Promise<ServerResponseType | MaritalStatusType[]> = async () => {
    try {
        const response = await api.get(`/estado-civil`);
        return response.data as MaritalStatusType[];
    } catch (error) {
        return handleApiError(error);
    }
};