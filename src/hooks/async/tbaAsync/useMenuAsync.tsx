import { createMenu, getMenuMainByParams, updateMenu } from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { MenuType, PaginatedResponseType } from '@/types';
import { useSnackbar } from 'notistack';

export const useMenuAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainMenus = async (
    menuId: number | null,
    menuName: string | null,
    menuLevel: number | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getMenuMainByParams(
        menuId,
        menuName,
        menuLevel,
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

  const fetchSaveMenu = async (body: MenuType) => {
    showLoading();

    try {
      const response = await createMenu(body);

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

  const fetchUpdateMenu = async (menuId: number, body: MenuType) => {
    showLoading();

    try {
      const response = await updateMenu(menuId, body);

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
    fetchMainMenus,
    fetchSaveMenu,
    fetchUpdateMenu,
  };
};
