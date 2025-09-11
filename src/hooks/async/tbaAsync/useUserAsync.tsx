import { getUsersMainByParams, getUsuarioById, updateUsuario } from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { PaginatedResponseType, UserPostType, UserType } from '@/types';
import { useSnackbar } from 'notistack';

export const useUserAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainUsers = async (
    nick: string | null,
    status: boolean | null,
    identification: string | null,
    name: string | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getUsersMainByParams(
        nick,
        status,
        identification,
        name,
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

  const fetchUserById = async (id: number) => {
    showLoading();

    try {
      const response = await getUsuarioById(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as UserType;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchUpdateUser = async (id: number, body: UserPostType) => {
    showLoading();

    try {
      const response = await updateUsuario(id, body);

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
    fetchMainUsers,
    fetchUserById,
    fetchUpdateUser,
  };
};
