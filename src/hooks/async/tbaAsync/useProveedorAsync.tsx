import {
  getProveedorData,
  getProveedoresPendienteListaPedido,
  getProveedoresPendienteSolicitudCompra,
  getProveedoresTransportista,
  getProveedorPersonaByProveedor,
  getProviderPersonByParam,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { PersonProviderType, ProveederDataType } from '@/types';
import { useSnackbar } from 'notistack';

export const useProveedorAsync = () => {
  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const { enqueueSnackbar } = useSnackbar();

  const fetchPendientesByListaPedido = async () => {
    showLoading();

    try {
      const response = await getProveedoresPendienteListaPedido();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      hideLoading();

      return response as PersonProviderType;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchTransportistas = async () => {
    showLoading();

    try {
      const response = await getProveedoresTransportista();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      hideLoading();

      return response as PersonProviderType[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchByParam = async (param: string) => {
    showLoading();

    try {
      const response = await getProviderPersonByParam(param);
      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return false;
      }
      return response as PersonProviderType[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchProveedorPersonaByProveedor = async (providerId: number) => {
    showLoading();

    try {
      const response = await getProveedorPersonaByProveedor(providerId);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return false;
      }
      return response as PersonProviderType;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchProveedorData = async (providerId: number) => {
    showLoading();

    try {
      const response = await getProveedorData(providerId);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return false;
      }
      return response as ProveederDataType;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchBySolicitudCompra = async () => {
    showLoading();

    try {
      const response = await getProveedoresPendienteSolicitudCompra();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      hideLoading();

      return response as PersonProviderType[];
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchPendientesByListaPedido,
    fetchTransportistas,
    fetchByParam,
    fetchProveedorPersonaByProveedor,
    fetchProveedorData,
    fetchBySolicitudCompra,
  };
};
