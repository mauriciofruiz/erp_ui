import {
  getAccountBankMain,
  getBankById,
  getBankList,
  getBankListByBranchId,
  getBankListIsBank,
  getLastNumberCheckByBankId,
  saveBank,
  updateBank,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { BancoType, PaginatedResponseType } from '@/types';
import { useSnackbar } from 'notistack';

export const useBankAsync = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchBankList = async () => {
    showLoading();

    try {
      const response = await getBankList();

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as BancoType[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchLastNumberCheckByBankId = async (bankId: number) => {
    try {
      const response = await getLastNumberCheckByBankId(bankId);
      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as number;
    } catch (error) {}
  };

  const fetchMainAccountBank = async (
    bankName: string | null,
    bankAccountNumber: string | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getAccountBankMain(
        bankName,
        bankAccountNumber,
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

  const fetchSaveBank = async (body: BancoType) => {
    showLoading();

    try {
      const response = await saveBank(body);

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

  const fetchUpdateBank = async (id: number, body: BancoType) => {
    showLoading();

    try {
      const response = await updateBank(id, body);

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

  const fetchBankById = async (id: number) => {
    showLoading();

    try {
      const response = await getBankById(id);

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

  const fetchBankListIsBank = async () => {
    showLoading();

    try {
      const response = await getBankListIsBank();

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as BancoType[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchBankListByBranchId = async (branchId: number) => {
    showLoading();

    try {
      const response = await getBankListByBranchId(branchId);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as BancoType[];
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchBankList,
    fetchLastNumberCheckByBankId,
    fetchMainAccountBank,
    fetchSaveBank,
    fetchUpdateBank,
    fetchBankById,
    fetchBankListIsBank,
    fetchBankListByBranchId,
  };
};
