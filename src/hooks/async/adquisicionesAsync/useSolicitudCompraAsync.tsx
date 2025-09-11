import {
  getSolicitudByProveedorSucursal,
  getSolicitudCompra,
  getSolicitudesCompraBusqueda,
  saveSolicitudCompra,
  updateSolicitudCompra,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import { PaginatedResponseType, SolicitudCompraSaveType } from '@/types';
import { useSnackbar } from 'notistack';

export const useSolicitudCompraAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

    const fetchMainPage = async (
        stateIdList: string | null,
        requestPurchaseId: number | null,
        branchId: number | null,
        userId: number | null,
        typeAdquisitionId: number | null,
        byCurrentMonth: boolean,
        startDate: string | null,
        endDate: string | null,
        page: number | null,
        limit: number | null,
        sortDirection: string | null,
        sortField: string | null
      ) => {
        showLoading();
        try {
          const response = await getSolicitudCompra(
            stateIdList,
            requestPurchaseId,
            branchId,
            userId,
            typeAdquisitionId,
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

    const fetchSave = async (body: SolicitudCompraSaveType) => {
        showLoading();
        try {
            const response = await saveSolicitudCompra(body);
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

  const fetchAllBusqueda = async (body: any) => {
    showLoading();

    try {
      const response = await getSolicitudesCompraBusqueda(body);

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

  const fetchUpdate = async (body: SolicitudCompraSaveType, id: number) => {
    showLoading();

    try {
      const response = await updateSolicitudCompra(body, id);

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

  const fetchByProveedorSucursal = async (
    personId: number,
    branchId: number | null
  ) => {
    showLoading();

    try {
      const response = await getSolicitudByProveedorSucursal(
        personId,
        branchId
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
    fetchMainPage,
    fetchSave,
    fetchUpdate,
    fetchAllBusqueda,
    fetchByProveedorSucursal,
  };
  
};
