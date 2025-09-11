import { getAdvancesByClientId, getCobroById, getCobroMain, getCobroPdf } from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import {
  AdvanceClientType,
  CobroGetType,
  PaginatedResponseType,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useCobroAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainPage = async (
    chargeNumber: number | null,
    clientId: number | null,
    userId: number | null,
    invoiceNumber: string | null,
    branchId: number | null,
    amount: number | null,
    emissionStartDate: Date | null,
    emissionEndDate: Date | null,
    currentMonth: boolean | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();
    try {
      const response = await getCobroMain(
        chargeNumber,
        clientId,
        userId,
        invoiceNumber,
        branchId,
        amount,
        emissionStartDate,
        emissionEndDate,
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

  const fetchCobroById = async (idCobro: number) => {
    showLoading();
    try {
      const response = await getCobroById(idCobro);
      hideLoading();
      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return response;
      }
      return response as CobroGetType;
    } catch (error) {
      hideLoading();
    }
  };

  const fecthAdvancesByClientId = async (id: number) => {
    showLoading();

    try {
      const response = await getAdvancesByClientId(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return false;
      }
      return response as AdvanceClientType[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchCobroPdf = async (id: number) => {
    showLoading();

    try {
      const response = await getCobroPdf(id);
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
    fecthAdvancesByClientId,
    fetchMainPage,
    fetchCobroById,
    fetchCobroPdf
  };
};
