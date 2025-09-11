
import { GenderType } from "@/types";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";
import { handleApiError } from "@/functions";
import { ServerResponseType } from "@/store";

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getGenderList: () => Promise<ServerResponseType | GenderType[]> = async () => {
    try {
        const response = await api.get(`/genero`);
        return response.data as GenderType[];
    } catch (error) {
        return handleApiError(error);
    }
};