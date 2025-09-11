import { ServerResponseType } from '@/store';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { handleApiError } from '@/functions';
import axios from 'axios';
import { LoginPayload, UserLoginType } from '@/types';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const loginService: (
  body: LoginPayload
) => Promise<ServerResponseType | UserLoginType> = async (body) => {
  try {
    const response = await api.post('/login', body);
    return response.data as UserLoginType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const logoutService: () => Promise<
  ServerResponseType | string
> = async () => {
  try {
    const response = await api.get('/logout');
    return response.data as string;
  } catch (error) {
    return handleApiError(error);
  }
};

export const sessionStatusService: () => Promise<
  boolean | ServerResponseType
> = async () => {
  try {
    const response = await api.get('/estado-sesion');

    return response.data as boolean;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) return false;
      else return handleApiError(error);
    } else return handleApiError(error);
  }
};
