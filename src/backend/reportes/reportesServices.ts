import { handleApiError } from '@/functions';
import { ServerResponseType } from '@/store';
import getServiceUrls from '../servicesUrl';
import { createApiConfig } from '../apiConfig';
import axios from 'axios';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.reportesServiceUrl);

const apiFormData = createApiConfig(serviceUrls.reportesServiceUrl, true);

export const getOrdenCompraPdf: (
  idOrden: number
) => Promise<Blob | ServerResponseType> = async (idOrden) => {
  try {
    const response = await api.get(`/orden-compra/get-pdf?orderId=${idOrden}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getRecepcionCompraPdf: (
  receptionId: number
) => Promise<Blob | ServerResponseType> = async (receptionId) => {
  try {
    const response = await api.get(
      `/recepcion-compra/get-pdf?receptionId=${receptionId}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getComprasDashboard: () => Promise<
  ServerResponseType | undefined
> = async () => {
  try {
    const response = await api.get(`/dashboard/compras`);

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

export const getComprasTableDashboard: () => Promise<
  ServerResponseType | undefined
> = async () => {
  try {
    const response = await api.get(`/dashboard/compras/table`);

    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const getListaPedidoPdf: (
  id: number
) => Promise<Blob | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/lista-pedido/get-pdf?orderListId=${id}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getListaEmpaquePdf: (
  id: number
) => Promise<Blob | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(
      `/lista-empaque/get-pdf?packingListId=${id}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getListaEmpaqueTransportePdf: (
  id: number,
  transportistId: number
) => Promise<Blob | ServerResponseType> = async (id, transportistId) => {
  try {
    const response = await api.get(
      `/lista-empaque/transporte/get-pdf?packingListId=${id}&providerTransportId=${transportistId}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAsientoContablePdf: (
  id: number
) => Promise<Blob | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/asiento/get-pdf?journalEntryId=${id}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAsientoContableMultidimensionPdf: (
  idOridden: number
) => Promise<Blob | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(
      `/asiento/multidimensional/get-pdf?journalEntryId=${id}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// ? * * * * * * * * * APIS DE IMAGENES * * * * * * * * * * * * *
export const uploadPhotoProducto: (
  photo: FormData
) => Promise<ServerResponseType | undefined> = async (photo) => {
  try {
    const response = await apiFormData.post(`/imagen/upload`, photo);

    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const downloadPhotoProducto: (
  productCode: string
) => Promise<Blob | undefined> = async (productCode) => {
  try {
    const response = await api.get(
      `/imagen/download?fileName=${productCode}.jpg`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const uploadFileProducto: (
  documentType: number | null,
  file: FormData
) => Promise<ServerResponseType | undefined> = async (file, documentType) => {
  try {
    const generateQueryString = () => {
      let queryString = '/file/upload?';
      if (documentType && documentType !== null) {
        queryString += `documentType=${documentType}&`;
      }
      queryString = queryString.replace(/&$/, '');
      return queryString;
    };
    const response = await apiFormData.post(generateQueryString(), file);
    return {
      status: response.status,
      message: response.data,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const downloadFileProducto: (
  productCode: string
) => Promise<Blob | undefined> = async (productCode) => {
  try {
    const response = await api.get(
      `/file/download?fileName=${productCode}.pdf`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const downloadFileProveedor: (
  productCode: string
) => Promise<Blob | undefined> = async (productCode) => {
  try {
    const response = await api.get(
      `/file/download?fileName=${productCode}.pdf`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// ? * * * * * * * * * APIS REPORTES V2 * * * * * * * * *

export const getLiquidacionCompraPdf: (
  id: number
) => Promise<Blob | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/liquidacion-compra/get-pdf?liqId=${id}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getLiquidacionImportacionPdf: (
  id: number
) => Promise<Blob | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(
      `/liquidacion-importacion/get-pdf?importId=${id}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getListaMaterialesPdf: (
  id: number
) => Promise<Blob | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/lista-materiales/get-pdf?recetaId=${id}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getOrdenCompraExteriorPdf: (
  id: number
) => Promise<Blob | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/orden-compra-ext/get-pdf?orderId=${id}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getOrdenPedidoPdf: (
  id: number
) => Promise<Blob | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/orden-pedido/get-pdf?ordenId=${id}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getRetecionProveedorPdf: (
  id: number
) => Promise<Blob | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/retencion/get-pdf?retencionId=${id}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getTransferenciaPdf: (
  id: number
) => Promise<Blob | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/transferencia/get-pdf?transferId=${id}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCierreCajaPdf: (
  id: number
) => Promise<Blob | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/cierre-caja/get-pdf?cierreId=${id}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCobroPdf: (
  id: number
) => Promise<Blob | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/cobro/get-pdf?idCobro=${id}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getEgresoPdf: (
  id: number
) => Promise<Blob | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/egreso-caja/get-pdf?egresoCajaId=${id}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
