import { TipoContribuyenteType } from "@/types";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";
import { handleApiError } from "@/functions";
import { ServerResponseType } from "@/store";

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getContribuyenteList: () => Promise<ServerResponseType | TipoContribuyenteType[]> = async () => {
    try {
        const response = await api.get(`/tipo-contribuyente`);
        return response.data as TipoContribuyenteType[] ;
    } catch (error) {
        return handleApiError(error);
    }
};