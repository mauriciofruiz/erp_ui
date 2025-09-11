import {
  availableToFacturar,
  getAllDenominacionEfectivo,
  getCierreById,
  getCierreCajaByParams,
  getCierreCajaPdf,
  getDetallesCobroCierreCaja,
  getImportacionesEgreso,
  saveCierreCaja,
  updateCierreCaja,
  updateEgresoCaja,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import {
  CierreGetType,
  CierrePostType,
  DenominacionEfectivoInterface,
  DetalleCobroCierreCajaInterface,
  EgresoInterface,
  ImportacionesEgresoType,
  PaginatedResponseType,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useCierreCajaAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainPage = async (
    stateIds: string | null,
    branchId: number | null,
    userId: number | null,
    byCurrentMonth: boolean,
    startDate: string | null,
    endDate: string | null,
    page: number | null,
    limit: number | null,
    sortField: string | null,
    sortDirection: string | null
  ) => {
    showLoading();

    try {
      const response = await getCierreCajaByParams(
        stateIds,
        branchId,
        userId,
        byCurrentMonth,
        startDate,
        endDate,
        page,
        limit,
        sortField,
        sortDirection
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

  const fetchDetalleCobroCierreCaja = async (cashId: number) => {
    showLoading();
    try {
      const response = await getDetallesCobroCierreCaja(cashId);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as DetalleCobroCierreCajaInterface[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchAllDenominaciones = async () => {
    showLoading();
    try {
      const response = await getAllDenominacionEfectivo();

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as DenominacionEfectivoInterface[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchSaveCierre = async (body: CierrePostType) => {
    showLoading();

    try {
      const response = await saveCierreCaja(body);

      hideLoading();

      enqueueSnackbar(response.message, {
        variant: response.status === 200 ? 'success' : 'error',
      });
    } catch (error) {
      hideLoading();
    }
  };

  const fetchUpdateCierre = async (body: CierrePostType, id: number) => {
    showLoading();

    try {
      const response = await updateCierreCaja(body, id);

      hideLoading();

      const { message } = (response as ServerResponseType).message;
      enqueueSnackbar(message, {
        variant: response.status === 200 ? 'success' : 'error',
      });
    } catch (error) {
      hideLoading();
    }
  };

  const fetchCierreById = async (id: number) => {
    showLoading();

    try {
      const response = await getCierreById(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return response;
      }
      return response as CierreGetType;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchUpdateEgreso = async (body: EgresoInterface, id: number) => {
    showLoading();

    try {
      const response = await updateEgresoCaja(body, id);

      hideLoading();

      const { message } = (response as ServerResponseType).message;
      enqueueSnackbar(message, {
        variant: response.status === 200 ? 'success' : 'error',
      });
    } catch (error) {
      hideLoading();
    }
  };

  const fetchValidateFacturacion = async (id: number) => {
    showLoading();

    try {
      const response = await availableToFacturar(id);

      hideLoading();

      return response as boolean;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchImportacionesEgreso = async (branchId: number) => {
    showLoading();

    try {
      const response = await getImportacionesEgreso(branchId);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return response;
      }
      return response as ImportacionesEgresoType[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchCierreCajaPdf = async (id: number) => {
    showLoading();

    try {
      const response = await getCierreCajaPdf(id);
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
  return {
    fetchMainPage,
    fetchDetalleCobroCierreCaja,
    fetchAllDenominaciones,
    fetchSaveCierre,
    fetchUpdateCierre,
    fetchCierreById,
    fetchUpdateEgreso,
    fetchValidateFacturacion,
    fetchImportacionesEgreso,
    fetchCierreCajaPdf,
  };
};
