import {
  getListaMaterialesPdf,
  getMaterialsByParams,
  getRecetaTypeById,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { PaginatedResponseType, RecetaGetIdType } from '@/types';
import { useSnackbar } from 'notistack';

export const useListaMaterialesAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fecthMainPageListaMateriales = async (
    startDate: string | null,
    endDate: string | null,
    productCode: number | null,
    productId: number | null,
    productName: string | null,
    userId: number | null,
    byCurrentMonth: boolean | null,
    page: number | null,
    limit: number | null,
    sortDirection: string,
    sortField: string
  ) => {
    showLoading();

    try {
      const response = await getMaterialsByParams(
        startDate,
        endDate,
        productCode,
        productId,
        productName,
        userId,
        byCurrentMonth,
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

  const fetchListaMaterialPdf = async (id: number) => {
    showLoading();

    try {
      const response = await getListaMaterialesPdf(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as Blob;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchById = async (id: number) => {
    showLoading();

    try {
      const response = await getRecetaTypeById(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as RecetaGetIdType;
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fecthMainPageListaMateriales,
    fetchListaMaterialPdf,
    fetchById,
  };
};
