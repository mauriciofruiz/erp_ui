import { getTaxesByDocument } from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { useSnackbar } from 'notistack';

export const useImpuestoDocumentoAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchByDocument = async (
    idDocumento: number | null = null,
    idTipoDocumento: number | null = null,
    idVoucher: number | null = null
  ) => {
    showLoading();
    try {
      const response = await getTaxesByDocument(
        idDocumento,
        idTipoDocumento,
        idVoucher
      );
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
    fetchByDocument,
  };
};
