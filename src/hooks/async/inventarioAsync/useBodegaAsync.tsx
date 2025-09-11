import { getBodegas, getBodegasBySucursal, getWarehouseById } from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { BodegaGetInterface } from '@/types';
import { useSnackbar } from 'notistack';

export const useBodegaAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchBodegaById = async (warehouseId: number) => {
    showLoading();

    try {
      const response = await getWarehouseById(warehouseId);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as BodegaGetInterface;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchBySucursal = async (branchId: number) => {
    showLoading();

    try {
      const response = await getBodegasBySucursal(branchId);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as BodegaGetInterface[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchAll = async () => {
    showLoading();

    try {
      const response = await getBodegas();

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as BodegaGetInterface[];
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchBodegaById,
    fetchBySucursal,
    fetchAll,
  };
};
