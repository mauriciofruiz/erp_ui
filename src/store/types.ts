import { Action, Dispatch } from 'redux';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { AuthState } from './auth/authSlice';
import { CommonState } from './commonSlice';

export interface RootState {
  auth: AuthState;
  common: CommonState;
}

export type ServerResponseType = {
  status: number;
  message: string | any;
};

export type AppDispatch = Dispatch<Action> &
  ThunkDispatch<RootState, unknown, Action>;
