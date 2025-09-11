import { CardInterface } from '@/types';
import { getCardList } from '@/backend';
import { ServerResponseType } from '@/store';
import { useLoadingOverlayContext } from '@/context';
import { useSnackbar } from 'notistack';

export const useTarjetaAsync = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchCardList = async () => {
    showLoading();

    try {
      const response = await getCardList();

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as CardInterface[];
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchCardList,
  };
};
