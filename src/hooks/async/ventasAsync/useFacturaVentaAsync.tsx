import {
  calculateFacturaVenta,
  getFacturasForCreditNote,
  getFacturasForDebitNote,
  getFacturaVentaById,
  getFacturaVentaMain,
  isDocumentAvailable,
  saveFacturaVenta,
  updateFacturaVenta,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import {
  FacturaVentaDto,
  FacturaVentaForNC,
  PaginatedResponseType,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useFacturaVentaAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainPage = async (
    stateIdList: string | null,
    clientId: number | null,
    documentNumber: string | null,
    branchId: number | null,
    userId: number | null,
    emissionStartDate: Date | null,
    emissionEndDate: Date | null,
    currentMonth: boolean | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getFacturaVentaMain(
        stateIdList,
        clientId,
        documentNumber,
        branchId,
        userId,
        emissionStartDate,
        emissionEndDate,
        currentMonth,
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

  const fetchSaveFacturaVenta = async (factura: FacturaVentaDto) => {
    showLoading();

    try {
      const response = await saveFacturaVenta(factura);

      hideLoading();

      enqueueSnackbar(response.message, {
        variant: response.status === 200 ? 'success' : 'error',
      });
    } catch (error) {
      hideLoading();
    }
  };

  const fetchUpdateFacturaVenta = async (
    factura: FacturaVentaDto,
    id: number
  ) => {
    showLoading();

    try {
      const response = await updateFacturaVenta(factura, id);

      hideLoading();

      const { message } = (response as ServerResponseType).message;
      enqueueSnackbar(message, {
        variant: response.status === 200 ? 'success' : 'error',
      });
    } catch (error) {
      hideLoading();
    }
  };

  const fetchFacturaVentaById = async (idFactura: number) => {
    showLoading();

    try {
      const response = await getFacturaVentaById(idFactura);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return response;
      }
      return response as FacturaVentaDto;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchCalculateFacturaVenta = async (
    facturaDto: FacturaVentaDto
  ): Promise<FacturaVentaDto | undefined> => {
    try {
      const response = await calculateFacturaVenta(facturaDto);

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as FacturaVentaDto;
    } catch (error) {}
  };

  const fetchIsDocumentAvailable = async (
    documentNumber: string,
    bankId: number
  ) => {
    showLoading();

    try {
      const response = await isDocumentAvailable(documentNumber, bankId);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as boolean;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchFacturasForCreditNote = async (
    clientId: number,
    documentNumber: string,
    idTipoNC: number
  ) => {
    showLoading();

    try {
      const response = await getFacturasForCreditNote(
        clientId,
        documentNumber,
        idTipoNC
      );

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as FacturaVentaForNC[];
    } catch (error) {
      hideLoading();
    }
  };

  const fecthFacturasForDebitNote = async (
    clientId: number,
    documentNumber: string
  ) => {
    showLoading();

    try {
      const response = await getFacturasForDebitNote(clientId, documentNumber);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }

      return response as FacturaVentaForNC[];
    } catch (error) {
      hideLoading();
    }
  }

  return {
    fetchMainPage,
    fetchSaveFacturaVenta,
    fetchUpdateFacturaVenta,
    fetchFacturaVentaById,
    fetchCalculateFacturaVenta,
    fetchIsDocumentAvailable,
    fetchFacturasForCreditNote,
    fecthFacturasForDebitNote,
  };
};
