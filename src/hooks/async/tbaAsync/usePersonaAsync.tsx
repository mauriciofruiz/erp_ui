import { getClientPersonaByParam_hook, getPersonById } from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { useSnackbar } from 'notistack';

export const usePersonaAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchPersonById = async (id: number) => {
    showLoading();

    try {
      const response = await getPersonById(id);

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

  const fetchClientPersonByParam = async (param: string) => {
    showLoading();

    try {
      const response = await getClientPersonaByParam_hook(param);

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
    fetchPersonById,
    fetchClientPersonByParam,
  };
};
