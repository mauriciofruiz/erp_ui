import {
  getCityByProvinceId,
  getContribuyenteList,
  getEstadoCivilList,
  getGenderList,
  getPaises,
  getParishesByCityId,
  getProvincesByCountryId,
  getRegimenFiscal,
  getSalesUsers,
  getSucursalById,
  getUsuarioById,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { handleApiError } from '@/functions';
import { ServerResponseType } from '@/store';
import {
  CityType,
  GenderType,
  MaritalStatusType,
  PaisType,
  ParroquiaType,
  ProvinceType,
  RegimenFiscalType,
  SucursalType,
  TipoContribuyenteType,
  UserType,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useComunAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchRegimenFiscalList = async () => {
    showLoading();

    try {
      const response = await getRegimenFiscal();

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as RegimenFiscalType[];
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchPaisList = async () => {
    showLoading();

    try {
      const response = await getPaises();

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as PaisType[];
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchContribuyenteList = async () => {
    showLoading();

    try {
      const response = await getContribuyenteList();

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as TipoContribuyenteType[];
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchGenderList = async () => {
    showLoading();

    try {
      const response = await getGenderList();

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as GenderType[];
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchEstadoCivilList = async () => {
    showLoading();

    try {
      const response = await getEstadoCivilList();

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as MaritalStatusType[];
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchSalesUsersList = async () => {
    showLoading();

    try {
      const response = await getSalesUsers();

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as UserType[];
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchBranchById = async (branchId: number) => {
    showLoading();

    try {
      const response = await getSucursalById(branchId);

      hideLoading();

      return response as SucursalType;
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchGetUserById = async (userId: number) => {
    showLoading();

    try {
      const response = await getUsuarioById(userId);

      hideLoading();

      return response as unknown as UserType;
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchCityByProvinceId = async (id: string) => {
    showLoading();

    try {
      const response = await getCityByProvinceId(id);

      hideLoading();

      return response as CityType[];
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchParishesByCityId = async (id: string) => {
    showLoading();

    try {
      const response = await getParishesByCityId(id);

      hideLoading();

      return response as ParroquiaType[];
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchProvincesByCountryId = async (id: number) => {
    showLoading();

    try {
      const response = await getProvincesByCountryId(id);

      hideLoading();

      return response as ProvinceType[];
    } catch (error) {
      handleApiError(error);
    }
  };

  return {
    fetchRegimenFiscalList,
    fetchPaisList,
    fetchContribuyenteList,
    fetchGenderList,
    fetchEstadoCivilList,
    fetchSalesUsersList,
    fetchBranchById,
    fetchGetUserById,
    fetchCityByProvinceId,
    fetchProvincesByCountryId,
    fetchParishesByCityId,
  };
};
