import {
  getByPaymentId,
  getPaymentListByParams,
  isPaymentDocumentNumberAvailable,
  savePayment,
  updatePayment,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { PaginatedResponseType, PaymentPackedInterface } from '@/types';
import { useSnackbar } from 'notistack';

export const usePaymentAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainPagePayment = async (
    bankId: number | null,
    documentNumber: string | null,
    beneficiaryName: string | null,
    paymentAmount: number | null,
    stateIds: string | null,
    paymentMethodIds: string | null,
    documentDateStart: string | null,
    documentDateEnd: string | null,
    startDate: string | null,
    endDate: string | null,
    byCurrentMonth: boolean | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getPaymentListByParams(
        bankId,
        documentNumber,
        beneficiaryName,
        paymentAmount,
        stateIds,
        paymentMethodIds,
        documentDateStart,
        documentDateEnd,
        startDate,
        endDate,
        byCurrentMonth,
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

  const fetchSave = async (body: PaymentPackedInterface) => {
    showLoading();

    try {
      const response = await savePayment(body);

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

  const fetchUpdate = async (body: PaymentPackedInterface, id: number) => {
    showLoading();

    try {
      const response = await updatePayment(body, id);

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
      const response = await getByPaymentId(id);

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

  const fetchIsPaymentDocumentNumberAvailable = async (
    bankId: number,
    documentNumber: string,
    isChequePayment: boolean,
    documentDate: string
  ): Promise<boolean> => {
    showLoading();

    try {
      const response = await isPaymentDocumentNumberAvailable(
        bankId,
        documentNumber,
        isChequePayment,
        documentDate
      );

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return false;
      }
      return !!response;
    } catch (error) {
      hideLoading();

      return false;
    }
  };

  return {
    fetchMainPagePayment,
    fetchSave,
    fetchUpdate,
    fetchGetById,
    fetchIsPaymentDocumentNumberAvailable,
  };
};
