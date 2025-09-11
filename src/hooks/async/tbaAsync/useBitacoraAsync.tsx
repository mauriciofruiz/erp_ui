import { getBitacoraByClienteId } from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { PaginatedResponseType } from '@/types';
import { useSnackbar } from 'notistack';

export const useBitacoraAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchBitacoraByClient = async (
    clientId: number,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getBitacoraByClienteId(
        clientId,
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

  return {
    fetchBitacoraByClient,
  };
};
