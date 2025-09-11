import { getAcquirerList } from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { AcquirerInterface } from '@/types';
import { useSnackbar } from 'notistack';

export const useAdquirienteAsync = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchAcquirerList = async () => {
    showLoading();

    try {
      const response = await getAcquirerList();

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as AcquirerInterface[];
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchAcquirerList,
  };
};
