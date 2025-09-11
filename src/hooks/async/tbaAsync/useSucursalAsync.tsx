import {
  getSucursalById,
  getSucursalMain,
  saveBranch,
  updateBranch,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { PaginatedResponseType, SucursalPostType } from '@/types';
import { useSnackbar } from 'notistack';

export const useSucursalAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainSucursales = async (
    cityId: number | null,
    regionId: string | null,
    categoryBranchId: string | null,
    name: string | null,
    mnemonic: string | null,
    isOutlets: boolean,
    isActive: boolean,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getSucursalMain(
        cityId,
        regionId,
        categoryBranchId,
        name,
        mnemonic,
        isOutlets,
        isActive,
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

  const fetchSaveBranch = async (body: SucursalPostType) => {
    showLoading();

    try {
      const response = await saveBranch(body);

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

  const fetchUpdatebranch = async (id: number, body: SucursalPostType) => {
    showLoading();

    try {
      const response = await updateBranch(id, body);

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

  const fetchBranchById = async (id: number) => {
    showLoading();

    try {
      const response = await getSucursalById(id);

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
    fetchMainSucursales,
    fetchSaveBranch,
    fetchUpdatebranch,
    fetchBranchById,
  };
};
