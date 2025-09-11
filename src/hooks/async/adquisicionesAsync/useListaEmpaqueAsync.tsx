import {
  getByIdLE,
  getDetailsByApertura,
  getListEmpaqueTransferencia,
  getListaEmpaqueMain,
  getListaEmpaquePdf,
  getListaEmpaqueTransportePdf,
  saveLE,
  updateLE,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import {
  ListaEmpaqueGetInterface,
  ListaEmpaquePackedSendInterface,
  PaginatedResponseType,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useListaEmpaqueAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainPage = async (
    stateIdList: string | null,
    userId: number | null,
    providerId: number | null,
    importOpeningId: number | null,
    startDate: string | null,
    endDate: string | null,
    currentMonth: boolean | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getListaEmpaqueMain(
        stateIdList,
        userId,
        providerId,
        importOpeningId,
        startDate,
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

  const fetchDetailsByApertura = async (
    listaEmpaque: ListaEmpaqueGetInterface
  ) => {
    showLoading();

    try {
      const response = await getDetailsByApertura(listaEmpaque);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as ListaEmpaqueGetInterface;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchSave = async (body: ListaEmpaquePackedSendInterface) => {
    showLoading();

    try {
      const response = await saveLE(body);

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

  const fetchUpdate = async (
    body: ListaEmpaquePackedSendInterface,
    id: number
  ) => {
    showLoading();

    try {
      const response = await updateLE(body, id);

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

  const fetchGetById = async (id: number) => {
    showLoading();

    try {
      const response = await getByIdLE(id);

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

  const fetchListEmpaqueTransferencia = async () => {
    showLoading();

    try {
      const response = await getListEmpaqueTransferencia();

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

  const fetchDownloadPdf = async (id: number) => {
    showLoading();

    try {
      const response = await getListaEmpaquePdf(id);

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

  const fetchDownloadTransportePdf = async (
    id: number,
    transportistId: number
  ) => {
    showLoading();

    try {
      const response = await getListaEmpaqueTransportePdf(id, transportistId);

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

  return {
    fetchMainPage,
    fetchDetailsByApertura,
    fetchSave,
    fetchUpdate,
    fetchGetById,
    fetchListEmpaqueTransferencia,
    fetchDownloadPdf,
    fetchDownloadTransportePdf,
  };
};
// Path: src/hooks/AsyncFunctions/Adquisiciones/proveedorAsync.tsx
