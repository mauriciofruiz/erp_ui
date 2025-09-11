import { UserLoginType } from '@/types';
import axios, { AxiosInstance } from 'axios';

export const createApiConfig = (
  baseURL: string,
  isFormData = false
): AxiosInstance => {
  const apiConfig = axios.create({
    baseURL: baseURL,
  });

  apiConfig.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');

      const user: UserLoginType | null =
        JSON.parse(localStorage.getItem('authUser') ?? 'null') || null;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (user && user !== null) {
        config.headers['User-Id'] = JSON.stringify(user.userId);
      }
      if (isFormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return apiConfig;
};
