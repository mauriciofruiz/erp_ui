import {
  getNotaDebitoClienteById,
  getNotaDebitoClienteByParams,
  saveNotaDebitoCliente,
  updateNotaDebitoCliente,
} from "@/backend";
import { useLoadingOverlayContext } from "@/context";
import { ServerResponseType } from "@/store";
import { PaginatedResponseType } from "@/types";
import {
  NotaDebitoClienteGet,
  NotaDebitoClientePostType,
} from "@/types/ventas/notaDebitoCliente";
import { useSnackbar } from "notistack";

export const useNotaDebitoCAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainPage = async (
    documentStatusId: string | null,
    clientId: number | null,
    documentNumber: string | null,
    invoiceNumber: string | null,
    branchId: number | null,
    ndTypeId: number | null,
    startDate: string | null,
    endDate: string | null,
    currentMonth: boolean | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getNotaDebitoClienteByParams(
        documentStatusId,
        clientId,
        documentNumber,
        invoiceNumber,
        branchId,
        ndTypeId,
        startDate,
        endDate,
        currentMonth,
        page,
        limit,
        sortDirection,
        sortField
      );

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: "error" });
        return undefined;
      }
      return response as PaginatedResponseType;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchSave = async (body: NotaDebitoClientePostType) => {
    showLoading();

    try {
      const response = await saveNotaDebitoCliente(body);

      hideLoading();

      enqueueSnackbar(response.message, {
        variant: response.status === 200 ? "success" : "error",
      });
    } catch (error) {
      hideLoading();
    }
  };

  const fetchUpdate = async (body: NotaDebitoClientePostType, id: number) => {
    showLoading();

    try {
      const response = await updateNotaDebitoCliente(body, id);

      hideLoading();

      enqueueSnackbar(response.message, {
        variant: response.status === 200 ? "success" : "error",
      });
    } catch (error) {
      hideLoading();
    }
  };

  const fetchById = async (id: number) => {
    showLoading();

    try {
      const response = await getNotaDebitoClienteById(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: "error" });
        return undefined;
      }
      return response as NotaDebitoClienteGet;
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchMainPage,
    fetchSave,
    fetchUpdate,
    fetchById,
  };
};
