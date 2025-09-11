import { ServerResponseType } from '@/store';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { handleApiError } from '@/functions';
import { BodegaGetInterface } from '@/types';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.inventarioServiceUrl);

export const getBodegasBySucursal: (
  branchId: number
) => Promise<BodegaGetInterface[] | ServerResponseType> = async (branchId) => {
  try {
    const response = await api.get(`/bodega?branchId=${branchId}`);
    return response.data as BodegaGetInterface[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getBodegas: () => Promise<
  BodegaGetInterface[] | ServerResponseType
> = async () => {
  try {
    const response = await api.get(`/bodega`);
    return response.data as BodegaGetInterface[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getBodegasProduction: (
  warehouseTypeId: number
) => Promise<ServerResponseType | undefined> = async (warehouseTypeId) => {
  try {
    const response = await api.get(
      `/bodega?warehouseTypeId=${warehouseTypeId}`
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getWarehouseById: (
  warehouseId: number
) => Promise<BodegaGetInterface | ServerResponseType> = async (warehouseId) => {
  try {
    const response = await api.get(`/bodega/${warehouseId}`);
    return response.data as BodegaGetInterface;
  } catch (error) {
    return handleApiError(error);
  }
};
