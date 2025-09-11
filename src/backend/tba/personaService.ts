import { ServerResponseType } from "@/store";
import axios from "axios";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);


export const getPersonByParams: (
    param: string,
) => Promise<ServerResponseType | undefined> = async (
    param,
) => {
        try {
            const response = await api.get(`/persona?param=${param}`);
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

export const getPersonById: (
    personId: number,
) => Promise<ServerResponseType | undefined> = async (
    personId,
) => {
        try {
            const response = await api.get(`/persona/${personId}`);
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