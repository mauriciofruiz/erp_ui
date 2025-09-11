import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../store/auth/authSlice';
import { AppDispatch, RootState, ServerResponseType } from '@/store/types';
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
} from '@/store/tba/thunks';
import { sessionStatusService } from '@/backend';
import { setCargoUsuario } from '@/store/auth/thunks';

export const useCheckAuth = () => {
  const { status } = useSelector((state: RootState) => state.auth);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');

      const sessionStatus = await sessionStatusService();

      if (
        !sessionStatus ||
        (sessionStatus as ServerResponseType).status === 404
      ) {
        dispatch(logout());
        return;
      }

      const user = JSON.parse(localStorage.getItem('authUser') ?? 'null');
      const menu = JSON.parse(localStorage.getItem('activeMenu') ?? 'null');
      const historyMenu = JSON.parse(
        localStorage.getItem('historyMenu') ?? '[]'
      );

      const position = JSON.parse(localStorage.getItem('position') ?? 'null');

      const currentPeriods = JSON.parse(
        localStorage.getItem('currentPeriods') ?? '[]'
      );

      if (user) {
        dispatch(
          login({
            status: 'authenticated',
            user,
            activeMenu: menu,
            historyMenu,
            authToken: token,
            position,
            currentPeriods,
          })
        );

        await dispatch(getPositionsThunk());

        await dispatch(getSucursalesThunk());

        await dispatch(getDeparmentsThunk());

        await dispatch(getGruposThunk());

        await dispatch(getSubgruposThunk());

        await dispatch(getImpuestoThunk());

        await dispatch(getRolesThunk());

        await dispatch(getLastPeriodsThunk());

        await dispatch(getProjectsThunk);

        dispatch(setCargoUsuario());
      } else {
        dispatch(logout());
      }
    };

    checkAuth();
  }, []);

  return status;
};
