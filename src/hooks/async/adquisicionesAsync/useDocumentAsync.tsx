import { validateExistDocument } from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { useSnackbar } from 'notistack';

export const useDocumentAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const validateExistDocumentAsync = async (
    id: number,
    documentType: string,
    documentNumber: string
  ) => {
    showLoading();

    try {
      const response = await validateExistDocument(
        id,
        documentType,
        documentNumber
      );

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return false;
      }
      return response;
    } catch (error) {
      hideLoading();
    }
  };

  return {
    validateExistDocumentAsync,
  };
};
