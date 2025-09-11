import {
  getDepositosByParams,
  getDepositoById,
  saveDeposito,
  updateDeposito,
  getDepositosPendientes,
  isDepositDocumentNumberAvailable,
} from "@/backend";
import { useLoadingOverlayContext } from "@/context";
import { ServerResponseType } from "@/store";
import {
  DepositoGetDto,
  DepositoPendienteDto,
  DepositoPostDto,
  PaginatedResponseType,
} from "@/types";
import { useSnackbar } from "notistack";

export const useDepositosAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainPage = async (
    depositId: number | null,
    documentNumber: string | null,
    bankId: string | null,
    amount: number | null,
    startDate: string | null,
    endDate: string | null,
    registrationStartDate: string | null,
    registrationEndDate: string | null,
    branchId: string | null,
    statusListIds: string | null,
    currentMonth: boolean | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getDepositosByParams(
        depositId,
        documentNumber,
        bankId,
        amount,
        startDate,
        endDate,
        registrationStartDate,
        registrationEndDate,
        branchId,
        statusListIds,
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

  const fetchById = async (depositId: number) => {
    showLoading();

    try {
      const response = await getDepositoById(depositId);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: "error" });
        return undefined;
      }

      return response as DepositoGetDto;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchSave = async (body: DepositoPostDto) => {
    showLoading();

    try {
      const response = await saveDeposito(body);

      hideLoading();

      enqueueSnackbar(response.message, {
        variant: response.status === 200 ? "success" : "error",
      });

      return response;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchUpdate = async (depositId: number, body: DepositoPostDto) => {
    showLoading();

    try {
      const response = await updateDeposito(body, depositId);

      hideLoading();

      enqueueSnackbar(response.message, {
        variant: response.status === 200 ? "success" : "error",
      });
    } catch (error) {
      hideLoading();
    }
  };

  const depositPendings = async (cashId: number, paymentMethodId: string) => {
    showLoading();

    try {
      const response = await getDepositosPendientes(cashId, paymentMethodId);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: "error" });
        return undefined;
      }

      return response as DepositoPendienteDto[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchIsDepositDocumentNumberAvailable = async (
    bankId: number,
    documentNumber: string
  ): Promise<boolean> => {
    showLoading();

    try {
      const response = await isDepositDocumentNumberAvailable(
        bankId,
        documentNumber
      );

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: "error" });
        return false;
      }
      return !!response;
    } catch (error) {
      hideLoading();

      return false;
    }
  };

  return {
    fetchMainPage,
    fetchById,
    fetchSave,
    fetchUpdate,
    depositPendings,
    fetchIsDepositDocumentNumberAvailable,
  };
};
