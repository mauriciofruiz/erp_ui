import { createPayments, createReprogramFee, getCXPByParams } from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import {
  AccountsPayableRequestType,
  cxpReprogramType,
  PaginatedCXPResponseType,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useCuentasPorPagarAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainCXP = async (
    providerId: number | null,
    endDate: string,
    isDue: boolean,
    rangeDaysId: number,
    isForeign: boolean | null,
    documentNumber: string,
    page: number,
    limit: number,
    sortDirection: string,
    sortField: string
  ) => {
    showLoading();

    try {
      const response = await getCXPByParams(
        providerId,
        endDate,
        isDue,
        rangeDaysId,
        isForeign,
        documentNumber,
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
      return response as PaginatedCXPResponseType;
    } catch (error) {
      hideLoading();
    }
  };

  const fecthSavePayments = async (body: AccountsPayableRequestType) => {
    showLoading();

    try {
      const response = await createPayments(body);

      hideLoading();

      enqueueSnackbar(response.message, {
        variant: response.status === 200 ? 'success' : 'error',
      });
    } catch (error) {
      hideLoading();
    }
  };

  const fecthSaveFee = async (body: cxpReprogramType) => {
    showLoading();

    try {
      const response = await createReprogramFee(body);

      hideLoading();

      enqueueSnackbar(response.message, {
        variant: response.status === 200 ? 'success' : 'error',
      });
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchMainCXP,
    fecthSavePayments,
    fecthSaveFee,
  };
};
