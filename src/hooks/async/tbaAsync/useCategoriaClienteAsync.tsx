import {
  getCategoriasMainByParams,
  saveCategory,
  updateCategory,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { ClientCategoryType, PaginatedResponseType } from '@/types';
import { useSnackbar } from 'notistack';

export const useCategoriaClienteAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainCategorias = async (
    clientCategoryName: string | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getCategoriasMainByParams(
        clientCategoryName,
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

  const fetchSaveCategory = async (body: ClientCategoryType) => {
    showLoading();

    try {
      const response = await saveCategory(body);

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

  const fetchUpdateCategory = async (id: number, body: ClientCategoryType) => {
    showLoading();

    try {
      const response = await updateCategory(id, body);

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
    fetchMainCategorias,
    fetchSaveCategory,
    fetchUpdateCategory,
  };
};
