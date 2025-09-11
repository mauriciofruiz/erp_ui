import { ServerResponseType } from '@/store';
import { createApiConfig } from '../apiConfig';
import getServiceUrls from '../servicesUrl';

import {PaginatedResponseType} from '@/types';
import { handleApiError } from '@/functions';

const serviceUrls = getServiceUrls();

const api = createApiConfig(serviceUrls.contabilidadServiceUrl);


export const getEgresoCajaByParams:(
    stateIds: string | null,
    branchId: number | null,
    flowOutId: number | null,
    amount: number | null,
    description: string | null,
    userId: number | null,
    byCurrentMonth: boolean,
    startDate: string | null,
    endDate: string | null,
    page: number | null,
    limit: number | null,
    sortField: string | null,
    sortDirection: string | null
) => Promise<PaginatedResponseType | ServerResponseType> = async (
    stateIds,
    branchId,
    flowOutId,
    amount,
    description,
    userId,
    byCurrentMonth,
    startDate,
    endDate,
    page,
    limit,
    sortField,
    sortDirection
) => {
    try {
    const generateQueryString = () => {
        const queryStringRoot = '/egreso-caja?';
  
        const queryString = new URLSearchParams();
  
        if (stateIds && stateIds !== null)
          queryString.append('stateIds', stateIds);
        if (branchId && branchId !== null)
          queryString.append('branchId', branchId.toString());
        if (flowOutId && flowOutId !== null)
            queryString.append('flowOutId', flowOutId.toString());
        if (amount && amount !== null)
            queryString.append('amount', amount.toString());
        if (description && description !== null)
          queryString.append('description', description);
        if (userId && userId !== null)
          queryString.append('userId', userId.toString());
        if (byCurrentMonth && byCurrentMonth !== null)
          queryString.append('byCurrentMonth', byCurrentMonth.toString());
        if (startDate && startDate !== null)
          queryString.append('startDate', startDate);
        if (endDate && endDate !== null) queryString.append('endDate', endDate);
        if (page && page !== null) queryString.append('page', page.toString());
        if (limit && limit !== null)
          queryString.append('limit', limit.toString());
        if (sortField && sortField !== null)
          queryString.append('sortField', sortField);
        if (sortDirection && sortDirection !== null)
          queryString.append('sortDirection', sortDirection);
  
        return queryStringRoot + queryString.toString();
    };
    const response = await api.get(generateQueryString());
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};