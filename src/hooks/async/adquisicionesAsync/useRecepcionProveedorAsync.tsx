import {
  getDetailRecepcionCompraByRecepcionId,
  getRecepcionCompraById,
  getRecepcionCompraPdf,
  getRecepcionesCompraMain,
  saveRecepcionCompra,
  updateRecepcionCompra,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import {
  DetailRecepcionCompraGetType,
  PaginatedResponseType,
  RecepcionCompraGetType,
  RecepcionCompraPackeageSendType,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useRecepcionProveedorAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainPage = async (
    stateIdList: string | null,
    receptionId: number | null,
    invoiceNumber: string | null,
    providerId: number | null,
    branchId: number | null,
    starDate: string | null,
    endDate: string | null,
    currentMonth: boolean | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getRecepcionesCompraMain(
        stateIdList,
        receptionId,
        invoiceNumber,
        providerId,
        branchId,
        starDate,
        endDate,
        currentMonth,
        page,
        limit,
        sortDirection,
        sortField
      );

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as PaginatedResponseType;
    } catch (error) {
      hideLoading();
    }
  };

  const saveRecepcionBackEnd = async (
    data: RecepcionCompraPackeageSendType
  ) => {
    showLoading();

    try {
      const response = await saveRecepcionCompra(data);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as RecepcionCompraPackeageSendType;
    } catch (error) {
      hideLoading();
    }
  };

  const updateRecepcionBackEnd = async (
    data: RecepcionCompraPackeageSendType,
    id: number
  ) => {
    showLoading();

    try {
      const response = await updateRecepcionCompra(data, id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as RecepcionCompraPackeageSendType;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchDownloadPdf = async (id: number) => {
    showLoading();

    try {
      const response = await getRecepcionCompraPdf(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as Blob;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchById = async (id: number) => {
    showLoading();

    try {
      const response = await getRecepcionCompraById(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as RecepcionCompraGetType;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchDetailsById = async (id: number) => {
    showLoading();

    try {
      const response = await getDetailRecepcionCompraByRecepcionId(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as DetailRecepcionCompraGetType[];
    } catch (error) {
      hideLoading();
    }
  };
  return {
    fetchMainPage,
    saveRecepcionBackEnd,
    updateRecepcionBackEnd,
    fetchDownloadPdf,
    fetchById,
    fetchDetailsById,
  };
};
