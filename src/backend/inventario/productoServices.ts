import {
  ProductDataType,
  ProductMainDataType,
  ProductMiniDataType,
  ProductoByBodegaType,
  ProveedorProductoType,
} from '@/types';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';
import { ServerResponseType } from '@/store';
import { handleApiError } from '@/functions';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.inventarioServiceUrl);

// ? --------------------------- APIS DE PRODUCTO -----------------------

export const saveProducto: (
  productoType: ProductDataType
) => Promise<ServerResponseType> = async (productoType) => {
  try {
    const response = await api.post(`/producto`, productoType);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateProducto: (
  productoId: number,
  productoType: ProductDataType
) => Promise<ServerResponseType> = async (productoId, productoType) => {
  try {
    const response = await api.put(`/producto?id=${productoId}`, productoType);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};
export const getAllActiveProductos: () => Promise<
  ServerResponseType | undefined
> = async () => {
  try {
    const response = await api.get(`/producto/get?page=0&size=10`);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const getProductosByParams: (
  param: string
) => Promise<ServerResponseType | undefined> = async (param) => {
  try {
    const response = await api.get(`/producto/get/${param}`);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const getAllProductosByParams: (
  param: string
) => Promise<ServerResponseType | undefined> = async (param) => {
  try {
    const response = await api.get(`/producto/get-all/${param}`);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const getProductosByParamsAndSupplier: (
  param: string,
  supplierId: number
) => Promise<ServerResponseType | undefined> = async (param, supplierId) => {
  try {
    const response = await api.get(`/producto/get/${param}/${supplierId}`);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const getProductoByBodega: (
  idSucursal: number | null,
  idProducto: number | null,
  idTipoAdquisicion?: number | null
) => Promise<ServerResponseType | undefined> = async (
  idSucursal,
  idProducto,
  idTipoAdquisicion = null
) => {
  try {
    const apiString = `/producto-bodega/${idSucursal}/${idProducto}`;
    const response = idTipoAdquisicion
      ? await api.get(`${apiString}?idTipoAdquisicion=${idTipoAdquisicion}`)
      : await api.get(apiString);

    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const getProductoByBodegaCode: (
  idSucursal: number | null,
  codProducto: string | null
) => Promise<ProductoByBodegaType | ServerResponseType> = async (
  idSucursal,
  codProducto
) => {
  try {
    const response = await api.get(
      `/producto-bodega/codigo-producto/${idSucursal}/${codProducto}`
    );
    return response.data as ProductoByBodegaType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getProductoMainData: (
  productId: number
) => Promise<ProductMainDataType | ServerResponseType> = async (productId) => {
  try {
    const response = await api.get(
      `/producto/main-data?productId=${productId}`
    );
    return response.data as ProductMainDataType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getProductoData: (
  productId: number
) => Promise<ProductDataType | ServerResponseType> = async (productId) => {
  try {
    const response = await api.get(`/producto/all-data?productId=${productId}`);
    return response.data as ProductDataType;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getProveedoresByProducto: (
  productId: number
) => Promise<ServerResponseType | undefined> = async (productId) => {
  try {
    const response = await api.get(
      `/producto/proveedor-producto/get?productId=${productId}`
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAllProveedoresByProducto: (
  productId: number
) => Promise<ServerResponseType | undefined> = async (productId) => {
  try {
    const response = await api.get(
      `/producto/proveedor-producto/get-all?productId=${productId}`
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const validateExistenceByProductCode: (
  code: string
) => Promise<ServerResponseType | undefined> = async (code) => {
  try {
    const response = await api.get(
      `/producto/validate/get?productCode=${code}`
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getProductosByProveedor: (
  parameter: string,
  providerId: number
) => Promise<ProveedorProductoType[] | undefined> = async (
  parameter,
  providerId
) => {
  try {
    const generateQueryString = () => {
      let queryString = '/proveedor-producto/by-parameters?';

      if (parameter && parameter !== null) {
        queryString += `parameter=${parameter}&`;
      }
      if (providerId && providerId !== null) {
        queryString += `providerId=${providerId}`;
      }
      queryString = queryString.replace(/&$/, '');
      return queryString;
    };
    const response = await api.get(generateQueryString());
    return response.data as ProveedorProductoType[];
  } catch (error) {
    handleApiError(error);
  }
};

export const getProductByStoreCode: (
  storeId: number | null,
  codProducto: string | null
) => Promise<ServerResponseType | undefined> = async (storeId, codProducto) => {
  try {
    const response = await api.get(
      `/producto-bodega/bodega/${storeId}/${codProducto}`
    );
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const getProductByListaEmpaqueContenedor: (
  idListaEmpaque: number,
  idContenedor: number,
  idBodega: number
) => Promise<ProductoByBodegaType[] | ServerResponseType> = async (
  idListaEmpaque,
  idContenedor,
  idBodega
) => {
  try {
    const response = await api.get(
      `/producto-bodega/transferencia/lista-empaque/buscar?idListaEmpaque=${idListaEmpaque}&idContenedor=${idContenedor}&idBodega=${idBodega}`
    );
    return response.data as ProductoByBodegaType[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getProductBySucursalAndParam: (
  idSucursal: number,
  parameter: string
) => Promise<ProductoByBodegaType[] | ServerResponseType> = async (
  idSucursal,
  parameter
) => {
  try {
    const response = await api.get(
      `/producto-bodega/by-parameters/${idSucursal}/${parameter}`
    );
    return response.data as ProductoByBodegaType[];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getMiniDataById: (
  id: number
) => Promise<ProductMiniDataType | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/producto/mini-data/${id}`);
    return response.data as ProductMiniDataType;
  } catch (error) {
    return handleApiError(error);
  }
};
