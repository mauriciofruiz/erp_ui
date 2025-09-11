import { EmployeeResumeType } from '@/types';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { handleApiError } from '@/functions';
import { ServerResponseType } from '@/store';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.tbaServiceUrl);

export const getEmpleadosActivosByParam: (
  param: string
) => Promise<EmployeeResumeType[]> = async (param) => {
  try {
    const response = await api.get(`/empleado/activo?param=${param}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getEmpleadoPersonaById: (
  employeeId: number
) => Promise<EmployeeResumeType | ServerResponseType> = async (employeeId) => {
  try {
    const response = await api.get(`/empleado/persona?id=${employeeId}`);
    return response.data as EmployeeResumeType;
  } catch (error) {
    return handleApiError(error);
  }
};
