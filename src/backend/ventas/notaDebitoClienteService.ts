import { handleApiError } from "@/functions";
import { createApiConfig } from "../apiConfig";
import getServiceUrls from "../servicesUrl";
import { PaginatedResponseType } from "@/types";
import { ServerResponseType } from "@/store";
import {
  NotaDebitoClienteGet,
  NotaDebitoClientePostType,
} from "@/types/ventas/notaDebitoCliente";

const servicesUrl = getServiceUrls();

const api = createApiConfig(servicesUrl.ventasServiceUrl);

export const getNotaDebitoClienteByParams: (
  documentStatusId: string | null,
  clientId: number | null,
  documentNumber: string | null,
  invoiceNumber: string | null,
  branchId: number | null,
  ncTypeId: number | null,
  startDate: string | null,
  endDate: string | null,
  currentMonth: boolean | null,
  page: number | null,
  limit: number | null,
  sortDirection: string | null,
  sortField: string | null
) => Promise<PaginatedResponseType | ServerResponseType> = async (
  documentStatusId,
  clientId,
  documentNumber,
  invoiceNumber,
  branchId,
  ncTypeId,
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
      const queryStringRoot = "/nota-debito-cliente?";

      const queryString = new URLSearchParams();

      if (documentStatusId && documentStatusId !== null)
        queryString.append("stateIdList", documentStatusId);
      if (clientId && clientId !== null)
        queryString.append("clientId", clientId.toString());
      if (documentNumber && documentNumber !== null && documentNumber !== "")
        queryString.append("documentNumber", documentNumber);
      if (invoiceNumber && invoiceNumber !== null && invoiceNumber !== "")
        queryString.append("invoiceNumber", invoiceNumber);
      if (branchId && branchId !== null)
        queryString.append("branchId", branchId.toString());
      if (ncTypeId && ncTypeId !== null)
        queryString.append("ncTypeId", ncTypeId.toString());
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

export const saveNotaDebitoCliente: (
  body: NotaDebitoClientePostType
) => Promise<ServerResponseType> = async (body) => {
  try {
    const response = await api.post("/nota-debito-cliente", body);
    return {
      message: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateNotaDebitoCliente: (
  body: NotaDebitoClientePostType,
  id: number
) => Promise<ServerResponseType> = async (body, id) => {
  try {
    const response = await api.put(`/nota-debito-cliente/${id}`, body);
    return {
      message: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getNotaDebitoClienteById: (
  id: number
) => Promise<NotaDebitoClienteGet | ServerResponseType> = async (id) => {
  try {
    const response = await api.get(`/nota-debito-cliente/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
