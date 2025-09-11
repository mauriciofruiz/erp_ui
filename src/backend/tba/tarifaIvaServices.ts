import { handleApiError } from "@/functions";
import { TaxRateInterface } from "@/types";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";
import { ServerResponseType } from '@/store';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getAllTaxRate: () => Promise<TaxRateInterface[] | ServerResponseType> = async () => {
    try {
        const response = await api.get(`/tarifa-iva`);
        return response.data as TaxRateInterface[];
    } catch (error) {
        return handleApiError(error);
    }
};