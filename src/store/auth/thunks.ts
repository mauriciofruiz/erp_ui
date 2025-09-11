import { ThunkAction } from 'redux-thunk';
import { login, logout, setPosition } from './authSlice';
import {
  getDeparmentsThunk,
  getGruposThunk,
  getImpuestoThunk,
  getLastPeriodsThunk,
  getPositionsThunk,
  getProjectsThunk,
  getRolesThunk,
  getSubgruposThunk,
  getSucursalesThunk,
} from '../tba/thunks';
import { Action } from 'redux';
import { MenuType, UserLoginType } from '@/types';
import { handleApiError } from '@/functions';
import { RootState, ServerResponseType } from '../types';

export const signInUserAndPassword = (
  userResponse: UserLoginType
): ThunkAction<
  Promise<ServerResponseType>,
  RootState,
  unknown,
  Action<string>
> => {
  return async (dispatch) => {
    try {
      if (userResponse) {
        const menu = userResponse.menuList[0] as MenuType;

        const historyMenu: MenuType[] = [];

        const token = userResponse.token;

        dispatch(
          login({
            status: 'authenticated',
            user: userResponse,
            activeMenu: menu,
            historyMenu,
            authToken: token,
            position: null,
            currentPeriods: [],
          })
        );

        await dispatch(getPositionsThunk());

        await dispatch(getDeparmentsThunk());

        await dispatch(getSucursalesThunk());

        await dispatch(getGruposThunk());

        await dispatch(getSubgruposThunk());

        await dispatch(setCargoUsuario());

        await dispatch(getImpuestoThunk());

        await dispatch(getRolesThunk());

        await dispatch(getLastPeriodsThunk());

        await dispatch(getProjectsThunk());

        const message: ServerResponseType = {
          status: 200,
          message: 'Ingreso Exitoso. ¡Bienvenido/a!',
        };
        return message;
      }
    } catch (error) {
      dispatch(logout());
      return handleApiError(error);
    }
    const response: ServerResponseType = {
      status: 500,
      message: 'Error Desconocido',
    };
    return response;
  };
};

export const signOutUser = (): ThunkAction<
  Promise<void>,
  RootState,
  unknown,
  Action<string>
> => {
  return async (dispatch) => {
    try {
      dispatch(logout());
    } catch (error) {
      handleApiError(error);
    } finally {
      dispatch(logout());
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
