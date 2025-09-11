import {
  getRolById,
  getRolByUser,
  getRolesByParams,
  saveRol,
  updateRol,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import {
  PaginatedResponseType,
  RolPost,
  RolUserPost,
  RoleInterface,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useRolUsuarioAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchRolesUser = async (id: number) => {
    showLoading();

    try {
      const response = await getRolByUser(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as RolUserPost[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchMainPageRoles = async (
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getRolesByParams(
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

  const fetchSaveRol = async (body: RolPost) => {
    showLoading();

    try {
      const response = await saveRol(body);

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

  const fetchUpdateRol = async (rolId: number, body: RolPost) => {
    showLoading();

    try {
      const response = await updateRol(rolId, body);

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

  const fetchRolById = async (rolId: number) => {
    showLoading();

    try {
      const response = await getRolById(rolId);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as RoleInterface;
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchRolesUser,
    fetchMainPageRoles,
    fetchSaveRol,
    fetchUpdateRol,
    fetchRolById,
  };
};
