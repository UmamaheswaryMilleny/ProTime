import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../store/hooks';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

import { googleAuthAPI } from '../services/auth-service';
import { loginUser } from '../store/authSlice';
import { ROUTES } from '../../../config/env';

export const useGoogleAuth = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  /**
   * Called by GoogleLogin onSuccess callback
   * credential = Google ID token (JWT) returned by Google
   * We send it to our backend → backend verifies + creates/logs in user
   */
  const handleGoogleSuccess = async (credential: string) => {
    try {
      // POST /auth/google → { idToken: credential }
      // Backend verifies with Google, creates user if new, returns accessToken
      const response = await googleAuthAPI({ idToken: credential });
      const accessToken = response.data.data?.accessToken;

      if (!accessToken) {
        toast.error('Google login failed. Please try again.');
        return;
      }

      // Decode JWT to get user info
      const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
      const role = tokenPayload.role as 'ADMIN' | 'CLIENT';
      const id = tokenPayload.id as string;
      const email = tokenPayload.email as string;

      dispatch(loginUser({
        id,
        email,
        fullName: '',   // filled on profile fetch
        role,
        accessToken,
      }));

      toast.success('Welcome to ProTime!');

      if (role === 'ADMIN') {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else {
        navigate(ROUTES.DASHBOARD); // ← CLIENT always lands on /dashboard, not /dashboard/profile
      }

    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message = err.response?.data?.message || 'Google login failed. Please try again.';
      toast.error(message);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign-in was cancelled or failed.');
  };

  return {
    handleGoogleSuccess,
    handleGoogleError,
  };
};