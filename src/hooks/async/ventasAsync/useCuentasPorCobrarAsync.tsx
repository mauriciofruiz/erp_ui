import { createCharge, createReprogramFeeCXC, getCXCByParams } from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import {
  AccountsPayableSendTypeCXC,
  cxcReprogramType,
  PaginatedCXCResponseType,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useCuentasPorCobrarAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainCXC = async (
    clientId: number | null,
    endDate: string,
    isDue: boolean,
    rangeDaysId: number,
    documentNumber: string,
    page: number,
    limit: number,
    sortDirection: string,
    sortField: string
  ) => {
    showLoading();

    try {
      const response = await getCXCByParams(
        clientId,
        endDate,
        isDue,
        rangeDaysId,
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
      return response as PaginatedCXCResponseType;
    } catch (error) {
      hideLoading();
    }
  };

  const fecthSaveCharge = async (body: AccountsPayableSendTypeCXC) => {
    showLoading();

    try {
      const response = await createCharge(body);

      hideLoading();

      enqueueSnackbar(response.message, {
        variant: response.status === 200 ? 'success' : 'error',
      });
    } catch (error) {
      hideLoading();
    }
  };

  const fecthSaveFee = async (body: cxcReprogramType) => {
    showLoading();

    try {
      const response = await createReprogramFeeCXC(body);

      hideLoading();

      enqueueSnackbar(response.message, {
        variant: response.status === 200 ? 'success' : 'error',
      });
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchMainCXC,
    fecthSaveFee,
    fecthSaveCharge,
  };
};
