import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  MenuType,
  PeriodInterface,
  PositionType,
  UserLoginType,
} from '@/types';

export type AuthState = {
  status: string;
  user: UserLoginType | null;
  activeMenu: MenuType | null;
  historyMenu: MenuType[];
  authToken: string | null;
  position: PositionType | null;
  currentPeriods: PeriodInterface[];
};

const initialState: AuthState = {
  status: localStorage.getItem('authStatus') || 'not-authenticated',
  user: JSON.parse(localStorage.getItem('authUser') ?? 'null') || null,
  activeMenu: JSON.parse(localStorage.getItem('activeMenu') ?? 'null') || null,
  historyMenu: JSON.parse(localStorage.getItem('historyMenu') ?? '[]') || [],
  authToken: localStorage.getItem('authToken') || null,
  position: JSON.parse(localStorage.getItem('position') ?? 'null') || null,
  currentPeriods:
    JSON.parse(localStorage.getItem('currentPeriods') ?? '[]') || [],
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state: AuthState, action: PayloadAction<AuthState>) => {
      state.status = 'authenticated';
      state.user = action.payload.user;
      state.activeMenu = action.payload.activeMenu;
      state.historyMenu = action.payload.historyMenu;
      state.authToken = action.payload.authToken;
      state.position = action.payload.position;
      state.currentPeriods = action.payload.currentPeriods;
      localStorage.setItem('authStatus', 'authenticated');
      localStorage.setItem('authUser', JSON.stringify(action.payload.user));
      localStorage.setItem(
        'activeMenu',
        JSON.stringify(action.payload.activeMenu)
      );
      localStorage.setItem(
        'historyMenu',
        JSON.stringify(action.payload.historyMenu)
      );
      localStorage.setItem(
        'authToken',
        action.payload.authToken !== null ? action.payload.authToken : ''
      );
      localStorage.setItem('position', JSON.stringify(action.payload.position));
      localStorage.setItem(
        'currentPeriods',
        JSON.stringify(action.payload.currentPeriods)
      );
    },
    logout: (state: AuthState) => {
      state.status = 'not-authenticated';
      state.user = null;
      state.authToken = null;
      state.activeMenu = null;
      state.historyMenu = [];
      state.position = null;
      state.currentPeriods = [];
      localStorage.removeItem('authStatus');
      localStorage.removeItem('activeMenu');
      localStorage.removeItem('historyMenu');
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('state');
      localStorage.removeItem('position');
      localStorage.removeItem('currentPeriods');
    },
    checkAuth: (state: AuthState) => {
      state.status = 'checking';
    },
    setMenu: (state: AuthState, { payload }: PayloadAction<MenuType>) => {
      state.activeMenu = payload;
    },
    setHistoryMenu: (
      state: AuthState,
      { payload }: PayloadAction<MenuType[]>
    ) => {
      state.historyMenu = payload;
    },
    setPosition: (
      state: AuthState,
      { payload }: PayloadAction<PositionType>
    ) => {
      state.position = payload;
    },
    setCurrentPeriods: (
      state: AuthState,
      { payload }: PayloadAction<PeriodInterface[]>
    ) => {
      state.currentPeriods = payload;
    },
  },
});

export const {
  login,
  logout,
  checkAuth,
  setMenu,
  setHistoryMenu,
  setPosition,
  setCurrentPeriods,
} = authSlice.actions;
