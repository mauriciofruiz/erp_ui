import { Action } from 'redux';
import { createApiConfig } from '@/backend/apiConfig';
import getServiceUrls from '@/backend/servicesUrl';
import {
  setDepartments,
  setGrupos,
  setImpuestos,
  setPositions,
  setProjects,
  setRoles,
  setSubgrupos,
  setSucursales,
} from '../commonSlice';
import { ThunkAction } from 'redux-thunk';
import axios from 'axios';
import {
  DepartmentType,
  PeriodInterface,
  PositionType,
  ProjectType,
  RoleInterface,
  SucursalType,
  TaxRateInterface,
} from '@/types';
import { handleApiError } from '@/functions';
import { getAllGrupos, getAllSubGrupos } from '@/backend/inventario';
import { getAllRoles, getAllTaxRate, getLastPeriods } from '@/backend';
import { RootState, ServerResponseType } from '../types';
import { setCurrentPeriods, setPosition } from '../auth/authSlice';

export const getPositionsThunk = (): ThunkAction<
  Promise<void>,
  RootState,
  unknown,
  Action<string>
> => {
  return async (dispatch) => {
    try {
      const serviceUrls = getServiceUrls();

      const api = createApiConfig(serviceUrls.tbaServiceUrl);

      const response = await api.get<PositionType[]>('/cargo');

      if (response.status === 200) {
        dispatch(setPositions(response.data));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) console.error(error);
    }
  };
};

export const getDeparmentsThunk = (): ThunkAction<
  Promise<void>,
  RootState,
  unknown,
  Action<string>
> => {
  return async (dispatch) => {
    try {
      const serviceUrls = getServiceUrls();

      const api = createApiConfig(serviceUrls.tbaServiceUrl);

      const response = await api.get<DepartmentType[]>('/departamento');

      if (response.status === 200) {
        const responseDepartments: DepartmentType[] = response.data;
        dispatch(
          setDepartments(responseDepartments.filter((d) => d.departmentStatus))
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) console.error(error);
    }
  };
};

export const getSucursalesThunk = (): ThunkAction<
  Promise<void>,
  RootState,
  unknown,
  Action<string>
> => {
  return async (dispatch) => {
    try {
      const serviceUrls = getServiceUrls();

      const api = createApiConfig(serviceUrls.tbaServiceUrl);

      const response = await api.get<SucursalType[]>('/sucursal');

      if (response.status === 200) {
        const sucursalesOrdered = response.data
          .filter((s) => s.branchId !== null)
          .sort((a, b) => (a.branchId as number) - (b.branchId as number));

        dispatch(setSucursales(sucursalesOrdered));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) console.error(error);
    }
  };
};

export const getGruposThunk = (): ThunkAction<
  Promise<void>,
  RootState,
  unknown,
  Action<string>
> => {
  return async (dispatch) => {
    try {
      const response: ServerResponseType | undefined = await getAllGrupos();
      if (response && response.status === 200) {
        dispatch(setGrupos(response.message));
      }
    } catch (error) {
      handleApiError(error);
    }
  };
};

export const getSubgruposThunk = (): ThunkAction<
  Promise<void>,
  RootState,
  unknown,
  Action<string>
> => {
  return async (dispatch) => {
    try {
      const response: ServerResponseType | undefined = await getAllSubGrupos();
      if (response && response.status === 200) {
        dispatch(setSubgrupos(response.message));
      }
    } catch (error) {
      handleApiError(error);
    }
  };
};

export const getImpuestoThunk = (): ThunkAction<
  Promise<void>,
  RootState,
  unknown,
  Action<string>
> => {
  return async (dispatch) => {
    try {
      const response = await getAllTaxRate();
      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        console.error(message);
      }
      dispatch(setImpuestos(response as TaxRateInterface[]));
    } catch (error) {
      handleApiError(error);
    }
  };
};

export const getRolesThunk = (): ThunkAction<
  Promise<void>,
  RootState,
  unknown,
  Action<string>
> => {
  return async (dispatch) => {
    try {
      const response = await getAllRoles();
      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        console.error(message);
      }
      dispatch(setRoles(response as RoleInterface[]));
    } catch (error) {
      handleApiError(error);
    }
  };
};

export const getLastPeriodsThunk = (): ThunkAction<
  Promise<void>,
  RootState,
  unknown,
  Action<string>
> => {
  return async (dispatch) => {
    try {
      const response = await getLastPeriods();
      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        console.error(message);
      }
      dispatch(setCurrentPeriods(response as PeriodInterface[]));
    } catch (error) {
      handleApiError(error);
    }
  };
};

export const getProjectsThunk = (): ThunkAction<
  Promise<void>,
  RootState,
  unknown,
  Action<string>
> => {
  return async (dispatch) => {
    try {
      const serviceUrls = getServiceUrls();

      const api = createApiConfig(serviceUrls.tbaServiceUrl);

      const response = await api.get<ProjectType[]>('/proyecto');

      if (response.status === 200) {
        const projectsOrdered = response.data
          .filter((s) => s.projectId !== null)
          .sort((a, b) => (a.projectId as number) - (b.projectId as number));

        dispatch(setProjects(projectsOrdered));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) console.error(error);
    }
  };
};

export const setCargoUsuario = (): ThunkAction<
  Promise<void>,
  RootState,
  unknown,
  Action<string>
> => {
  return async (dispatch, getState) => {
    const { user } = getState().auth;
    const commonState = getState().common;
    if (commonState && commonState.positions.length > 0) {
      const usuarioCargo = commonState.positions.filter(
        (c) => c.positionId === user?.position
      );
      if (usuarioCargo) {
        dispatch(setPosition(usuarioCargo[0]));
      }
    }
  };
};
