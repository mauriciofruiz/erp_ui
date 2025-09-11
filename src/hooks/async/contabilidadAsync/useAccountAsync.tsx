import {
  getAccountsForClient,
  getCuentaByIdHook,
  getCuentaByParam,
  getCuentaByParamAutomatic,
  getCuentaEgresoCaja,
  getCuentaTarjetasPago,
  getPlanCuentas,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import {
  AccountEgresoType,
  AccountSendInterface,
  AccountTreeNodeType,
  AccountType,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useAccountAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchAccountCreditCard = async () => {
    showLoading();

    try {
      const response = await getCuentaTarjetasPago();

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return false;
      }
      return response as AccountSendInterface[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchAccountsForClient = async () => {
    showLoading();

    try {
      const response = await getAccountsForClient();

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return false;
      }
      return response as AccountType[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchAccountsAutomatic = async (param: string) => {
    showLoading();

    try {
      const response = await getCuentaByParamAutomatic(param);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return false;
      }
      return response as AccountType[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchAccountEgresoCaja = async () => {
    showLoading();

    try {
      const response = await getCuentaEgresoCaja();

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return false;
      }
      return response as AccountEgresoType[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchAccountByNumber = async (accountNumber: string) => {
    showLoading();

    try {
      const response = await getCuentaByParam(accountNumber);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return false;
      }
      return response as AccountType[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchPlanCuentas = async () => {
    showLoading();

    try {
      const response = await getPlanCuentas();

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return false;
      }
      return response as AccountTreeNodeType;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchById = async (id: number) => {
    showLoading();

    try {
      const response = await getCuentaByIdHook(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return false;
      }
      return response as AccountType;
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchAccountCreditCard,
    fetchAccountsForClient,
    fetchAccountsAutomatic,
    fetchAccountEgresoCaja,
    fetchAccountByNumber,
    fetchPlanCuentas,
    fetchById,
  };
};
