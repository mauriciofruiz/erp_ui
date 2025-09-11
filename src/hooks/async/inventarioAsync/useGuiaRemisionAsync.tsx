import {
  getDetailRelatedDocumentsGuia,
  getGuiaRemisionById,
  getGuiaRemisionByParams,
  getRelatedDocumentsGuia,
  saveGuiaRemision,
  updateGuiaRemision,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import {
  DetailGuiaRemisionPostType,
  GuiaRemisionGetType,
  GuiaRemisionPostType,
  PaginatedResponseType,
  RelatedDocumentsGuiaType,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useGuiaRemisionAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainPage = async (
    documentNumber: string | null,
    documentNumberOrigin: string | null,
    branchId: number | null,
    stateIdList: string | null,
    userId: number | null,
    documentTypeId: number | null,
    byCurrentMonth: boolean,
    startDate: string | null,
    endDate: string | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();
    try {
      const response = await getGuiaRemisionByParams(
        documentNumber,
        documentNumberOrigin,
        branchId,
        stateIdList,
        userId,
        documentTypeId,
        byCurrentMonth,
        startDate,
        endDate,
        page,
        limit,
        sortField,
        sortDirection
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

  const fetchRelatedDocuments = async (
    branchId: number,
    isTransfer: boolean,
    startDate: string,
    endDate: string
  ) => {
    showLoading();

    try {
      const response = await getRelatedDocumentsGuia(
        branchId,
        isTransfer,
        startDate,
        endDate
      );

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return response;
      }
      return response as RelatedDocumentsGuiaType[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchDetailRelatedDocuments = async (
    documentId: number,
    isTransfer: boolean
  ) => {
    showLoading();

    try {
      const response = await getDetailRelatedDocumentsGuia(
        documentId,
        isTransfer
      );

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return response;
      }
      return response as DetailGuiaRemisionPostType[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchSave = async (body: GuiaRemisionPostType) => {
    showLoading();

    try {
      const response = await saveGuiaRemision(body);

      hideLoading();

      enqueueSnackbar(response.message, {
        variant: response.status === 200 ? 'success' : 'error',
      });
    } catch (error) {
      hideLoading();
    }
  };

  const fetchUpdate = async (body: GuiaRemisionPostType, id: number) => {
    showLoading();

    try {
      const response = await updateGuiaRemision(body, id);

      hideLoading();

      const { message } = (response as ServerResponseType).message;
      enqueueSnackbar(message, {
        variant: response.status === 200 ? 'success' : 'error',
      });
    } catch (error) {
      hideLoading();
    }
  };

  const fetchById = async (id: number) => {
    showLoading();

    try {
      const response = await getGuiaRemisionById(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return response;
      }
      return response as GuiaRemisionGetType;
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchMainPage,
    fetchRelatedDocuments,
    fetchDetailRelatedDocuments,
    fetchById,
    fetchSave,
    fetchUpdate,
  };
};
