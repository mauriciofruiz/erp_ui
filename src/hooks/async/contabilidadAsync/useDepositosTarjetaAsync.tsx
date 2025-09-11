import { getDepositosTarjetaByParams } from "@/backend";
import { useLoadingOverlayContext } from "@/context";
import { ServerResponseType } from "@/store";
import { PaginatedResponseType } from "@/types";
import { useSnackbar } from "notistack";

export const useDepositosTarjetasAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainPage = async (
    branchId: string | null,
    bankId: string | null,
    amount: number | null,
    documentNumber: string | null,
    statusListIds: string | null,
    registrationStartDate: string | null,
    registrationEndDate: string | null,
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
      const response = await getDepositosTarjetaByParams(
        branchId,
        bankId,
        amount,
        documentNumber,
        statusListIds,
        registrationStartDate,
        registrationEndDate,
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
  return {
    fetchMainPage,
  };
};
