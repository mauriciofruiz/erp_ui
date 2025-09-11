import { ServerResponseType } from "@/store";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";
import axios from "axios";

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getCargos: () => Promise<ServerResponseType | undefined> = async () => {
    try {
        const response = await api.get(`/cargo`);

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