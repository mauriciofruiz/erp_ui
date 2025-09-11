import { getDocsByParams } from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { PaginatedResponseType } from '@/types';
import { useSnackbar } from 'notistack';

export const useAutorizacionesSriAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainDocs = async (
    documentNumber: string | null,
    documentType: string | null,
    identification: string | null,
    name: string | null,
    accesKey: string | null,
    isAuthorized: boolean,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getDocsByParams(
        documentNumber,
        documentType,
        name,
        identification,
        accesKey,
        isAuthorized,
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
    fetchMainDocs,
  };
};
