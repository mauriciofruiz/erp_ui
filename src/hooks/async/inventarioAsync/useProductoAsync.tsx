import {
  getMiniDataById,
  getProductByListaEmpaqueContenedor,
  getProductBySucursalAndParam,
  getProductoByBodegaCode,
  getProductoData,
  getProductoMainData,
  saveProducto,
  updateProducto,
} from '@/backend/inventario';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import {
  ProductDataType,
  ProductMainDataType,
  ProductMiniDataType,
  ProductoByBodegaType,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useProductoAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchProductByListaEmpaqueContenedor = async (
    idListaEmpaque: number,
    idContenedor: number,
    idBodega: number
  ) => {
    showLoading();

    try {
      const response = await getProductByListaEmpaqueContenedor(
        idListaEmpaque,
        idContenedor,
        idBodega
      );

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchBySucursalAndParam = async (
    idSucursal: number,
    parameter: string
  ) => {
    showLoading();

    try {
      const response = await getProductBySucursalAndParam(
        idSucursal,
        parameter
      );

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchBySucursalIdAndCode = async (
    idSucursal: number | null,
    code: string
  ) => {
    showLoading();

    try {
      const response = await getProductoByBodegaCode(idSucursal, code);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as ProductoByBodegaType;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchMainData = async (id: number) => {
    showLoading();

    try {
      const response = await getProductoMainData(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as ProductMainDataType;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchData = async (id: number) => {
    showLoading();

    try {
      const response = await getProductoData(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as ProductDataType;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchById = async (id: number) => {
    showLoading();

    try {
      const response = await getMiniDataById(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as ProductMiniDataType;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchSave = async (productoData: ProductDataType) => {
    showLoading();

    try {
      const response = await saveProducto(productoData);

      hideLoading();

      enqueueSnackbar(response.message, {
        variant: response.status === 200 ? 'success' : 'error',
      });
    } catch (error) {
      hideLoading();
    }
  };

  const fetchUpdate = async (productoData: ProductDataType, id: number) => {
    showLoading();

    try {
      const response = await updateProducto(id, productoData);

      hideLoading();

      const { message } = (response as ServerResponseType).message;
      enqueueSnackbar(message, {
        variant: response.status === 200 ? 'success' : 'error',
      });
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchProductByListaEmpaqueContenedor,
    fetchBySucursalAndParam,
    fetchBySucursalIdAndCode,
    fetchMainData,
    fetchData,
    fetchById,
    fetchSave,
    fetchUpdate,
  };
};
