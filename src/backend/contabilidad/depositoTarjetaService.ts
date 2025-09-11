import getServiceUrls from "../servicesUrl";
import { createApiConfig } from "../apiConfig";
import { PaginatedResponseType } from "@/types";
import { ServerResponseType } from "@/store";
import { handleApiError } from "@/functions";

const servicesUrl = getServiceUrls();

const api = createApiConfig(servicesUrl.contabilidadServiceUrl);

export const getDepositosTarjetaByParams: (
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
) => Promise<PaginatedResponseType | ServerResponseType> = async (
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
) => {
  try {
    const generateQueryString = () => {
      const queryStringRoot = "/deposito-boleta?";
      const queryString = new URLSearchParams();
      if (branchId && branchId !== null)
        queryString.append("branchId", branchId.toString());
      if (bankId && bankId !== null && bankId !== "")
        queryString.append("bankId", bankId);
      if (amount && amount !== null)
        queryString.append("amount", amount.toString());
      if (documentNumber && documentNumber !== null && documentNumber !== "")
        queryString.append("documentNumber", documentNumber);
      if (statusListIds && statusListIds !== null)
        queryString.append("statusListIds", statusListIds);
      if (registrationStartDate && registrationStartDate !== null)
        queryString.append("registrationStartDate", registrationStartDate);
      if (registrationEndDate && registrationEndDate !== null)
        queryString.append("registrationEndDate", registrationEndDate);
      if (startDate && startDate !== null)
        queryString.append("startDate", startDate);
      if (endDate && endDate !== null) queryString.append("endDate", endDate);
      if (currentMonth && currentMonth !== null)
        queryString.append("byCurrentMonth", currentMonth.toString());
      if (page && page !== null) queryString.append("page", page.toString());
      if (limit && limit !== null)
        queryString.append("limit", limit.toString());
      if (sortDirection && sortDirection !== null)
        queryString.append("sortDirection", sortDirection);
      if (sortField && sortField !== null)
        queryString.append("sortField", sortField);

      return queryStringRoot + queryString.toString();
    };

    const response = await api.get(generateQueryString());
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};