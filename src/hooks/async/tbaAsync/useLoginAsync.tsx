import { loginService, logoutService } from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { AppDispatch, ServerResponseType } from '@/store';
import { signInUserAndPassword, signOutUser } from '@/store/auth/thunks';
import { LoginPayload, UserLoginType } from '@/types';
import { useSnackbar } from 'notistack';
import { useDispatch } from 'react-redux';
import CryptoJS from 'crypto-js';

export const useLoginAsync = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const dispatch: AppDispatch = useDispatch();

  const fetchLogin = async (body: LoginPayload) => {
    showLoading();

    try {
      const hashedPassword = CryptoJS.SHA256(body.password).toString();
      const requestBody = {
        nick: body.nick,
        password: hashedPassword,
      };
      const response = await loginService(requestBody);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      const reponseThunk = await dispatch(
        signInUserAndPassword(response as UserLoginType)
      );
      if (reponseThunk && reponseThunk.status === 200) {
        enqueueSnackbar(reponseThunk.message, { variant: 'success' });
      } else {
        enqueueSnackbar(reponseThunk.message, { variant: 'error' });
      }
    } catch (error) {
      hideLoading();
    }
  };

  const fetchLoginOut = async () => {
    showLoading();

    try {
      const response = await logoutService();

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      const reponseThunk = response as string;
      enqueueSnackbar(reponseThunk, { variant: 'success' });
      await dispatch(signOutUser());
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchLogin,
    fetchLoginOut,
  };
};
