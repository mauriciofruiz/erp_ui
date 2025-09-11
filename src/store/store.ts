import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './auth/authSlice';
import { commonSlice } from './commonSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    common: commonSlice.reducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
