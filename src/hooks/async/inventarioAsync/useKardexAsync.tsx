import { getKardexByParams } from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { PaginatedResponseType } from '@/types';
import { useSnackbar } from 'notistack';

export const useKardexAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchPaginationKardex = async (
    branchId: number | null,
    warehouseIdList: string | null,
    movementTypeIdList: string | null,
    byCurrentMonth: boolean,
    startDate: string | null,
    endDate: string | null,
    page: number | null,
    limit: number | null,
    productId: number | null
  ) => {
    showLoading();

    try {
      const response = await getKardexByParams(
        branchId,
        warehouseIdList,
        movementTypeIdList,
        byCurrentMonth,
        startDate,
        endDate,
        page,
        limit,
        productId
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
    fetchPaginationKardex,
  };
};
