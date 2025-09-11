import {
  getAllRetencionesFuenteCliente,
  getAllRetencionesIVACliente,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { RetencionGeneralInterface } from '@/types';
import { useSnackbar } from 'notistack';

export const useRetencionAsync = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchAllIva = async () => {
    showLoading();

    try {
      const response = await getAllRetencionesIVACliente();
      hideLoading();
      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }

      return response as RetencionGeneralInterface[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchAllSource = async () => {
    showLoading();

    try {
      const response = await getAllRetencionesFuenteCliente();
      hideLoading();
      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }

      return response as RetencionGeneralInterface[];
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchAllIva,
    fetchAllSource,
  };
};
