import {
  getBankCatalogList,
  getCatalogoBanksByParams,
  saveCatalogBank,
  updateCatalogBank,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { BankType, PaginatedResponseType } from '@/types';
import { useSnackbar } from 'notistack';

export const useCatalogBankAsync = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchBankList = async () => {
    showLoading();

    try {
      const response = await getBankCatalogList();

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as BankType[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchMainCatalogBanks = async (
    bankCatalogName: string | null,
    bankCatalogCode: string | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getCatalogoBanksByParams(
        bankCatalogName,
        bankCatalogCode,
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

  const fetchSaveCatalogBank = async (body: BankType) => {
    showLoading();

    try {
      const response = await saveCatalogBank(body);

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

  const fetchUpdateCatalogBank = async (id: number, body: BankType) => {
    showLoading();

    try {
      const response = await updateCatalogBank(id, body);

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

  return {
    fetchBankList,
    fetchMainCatalogBanks,
    fetchSaveCatalogBank,
    fetchUpdateCatalogBank,
  };
};
