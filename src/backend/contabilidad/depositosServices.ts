import getServiceUrls from "../servicesUrl";
import { createApiConfig } from "../apiConfig";
import { DepositoGetDto, DepositoPendienteDto, DepositoPostDto, PaginatedResponseType } from "@/types";
import { ServerResponseType } from "@/store";
import { handleApiError } from "@/functions";

const servicesUrl = getServiceUrls();

const api = createApiConfig(servicesUrl.contabilidadServiceUrl);

export const getDepositosByParams: (
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
) => Promise<PaginatedResponseType | ServerResponseType> = async (
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
) => {
  try {
    const generateQueryString = () => {
      const queryStringRoot = "/deposito-bancario?";
      const queryString = new URLSearchParams();

      if (depositId && depositId !== null)
        queryString.append("depositId", depositId.toString());
      if (documentNumber && documentNumber !== null && documentNumber !== "")
        queryString.append("documentNumber", documentNumber);
      if (bankId && bankId !== null && bankId !== "")
        queryString.append("bankId", bankId);
      if (amount && amount !== null)
        queryString.append("amount", amount.toString());
      if (startDate && startDate !== null)
        queryString.append("startDate", startDate);
      if (endDate && endDate !== null) queryString.append("endDate", endDate);
      if (registrationStartDate && registrationStartDate !== null)
        queryString.append("registrationStartDate", registrationStartDate);
      if (registrationEndDate && registrationEndDate !== null)
        queryString.append("registrationEndDate", registrationEndDate);
      if (branchId && branchId !== null)
        queryString.append("branchId", branchId);
      if (statusListIds && statusListIds !== null)
        queryString.append("statusListIds", statusListIds);
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

export const getDepositoById: (
  depositId: number
) => Promise<DepositoGetDto | ServerResponseType> = async (depositId) => {
  try {
    const response = await api.get(`/deposito-bancario/${depositId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const saveDeposito: (
  body: DepositoPostDto
) => Promise<ServerResponseType> = async (body) => {
  try {
    const response = await api.post("/deposito-bancario", body);
    return {
      message: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateDeposito: (
  body: DepositoPostDto,
  depositId: number
) => Promise<ServerResponseType> = async (body, depositId) => {
  try {
    const response = await api.put(`/deposito-bancario/${depositId}`, body);
    return {
      message: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getDepositosPendientes: (
  cashId: number,
  paymentMethodId: string
) => Promise<DepositoPendienteDto[] | ServerResponseType> = async (cashId, paymentMethodId) => {
  try {
    const response = await api.get(`/deposito-bancario/pendiente?cashId=${cashId}&paymentMethodId=${paymentMethodId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const isDepositDocumentNumberAvailable: (
  bankId: number,
  documentNumber: string,
) => Promise<boolean | ServerResponseType> = async (bankId, documentNumber) => {
  try {
    const response = await api.get(
      `/deposito-bancario/validacion/documento?bankId=${bankId}&documentNumber=${documentNumber}`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
