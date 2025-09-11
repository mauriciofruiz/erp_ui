
import { getExceptionList } from '@/backend';
import { ServerResponseType } from '@/store';
import { PaginatedResponseType } from '@/types';
import { useSnackbar } from 'notistack';

export const useExceptionsAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const fetchExceptionsByClient = async (
    clientId: number,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    try {
      const response = await getExceptionList(
        clientId,
        page,
        limit,
        sortDirection,
        sortField
      );
      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as PaginatedResponseType;
    } catch (error) {
    }
  };

  

  return {
    fetchExceptionsByClient,
  };
};
