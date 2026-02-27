import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../store/hooks';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

import { signinSchema, type SigninFormData } from '../validation/signin.schema';
import { loginAPI } from '../services/auth-service';
import { loginUser } from '../store/authSlice';
import { ROUTES } from '../../../config/env';

export const useSignin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const form = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SigninFormData) => {
    setIsLoading(true);
    try {
      // POST /auth/login
      // Backend response shape: { success, message, data: { accessToken } }
      // Backend also sets access_token + refresh_token as httpOnly cookies
      const response = await loginAPI(data);
      const accessToken = response.data.data?.accessToken;

      if (!accessToken) {
        toast.error('Login failed. Please try again.');
        return;
      }

      // Backend doesn't return full user on login — only accessToken
      // Decode role from JWT payload to determine redirect
      const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
      const role = tokenPayload.role as 'ADMIN' | 'CLIENT';
      const id = tokenPayload.id as string;
      const email = tokenPayload.email as string;

      // Store in Redux + localStorage
      dispatch(loginUser({
        id,
        email,
        fullName: '',        // ← not returned on login, filled on profile fetch
        role,
        accessToken,
      }));

      toast.success('Welcome back!');

      // Redirect based on role
      if (role === 'ADMIN') {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else {
        navigate(ROUTES.DASHBOARD);  // ← /dashboard not /user/profile
      }

    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    isLoading,
  };
};
