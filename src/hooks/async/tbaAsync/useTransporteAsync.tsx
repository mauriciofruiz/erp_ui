import { TransportistaGuiaInterface } from '@/types';
import { getTransportistaByIdentification } from '@/backend';
import { ServerResponseType } from '@/store';
import { useLoadingOverlayContext } from '@/context';
import { useSnackbar } from 'notistack';

export const useTransporteAsync = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchTransportistaByIdentification = async (param: string) => {
    showLoading();

    try {
      const response = await getTransportistaByIdentification(param);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as TransportistaGuiaInterface[];
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchTransportistaByIdentification,
  };
};
