import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../store/hooks';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

import { signupSchema, type SignupFormData } from '../validation/signup.schema';
import { registerAPI } from '../services/auth-service';
import { setPendingEmail } from '../store/authSlice';
import { ROUTES } from '../../../config/env';

export const useSignup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',       // ✅ lowercase — matches backend + schema
      email: '',
      password: '',
      confirmPassword: '',
      // ✅ no role — backend always assigns CLIENT on register
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      // POST /auth/register → { fullname, email, password, confirmPassword }
      await registerAPI({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      // Store email in Redux so OTP page can read it
      dispatch(setPendingEmail(data.email));

      toast.success('Account created! Please check your email for OTP.');

      // Navigate to OTP page — also pass email via state as fallback
      navigate(ROUTES.VERIFY_OTP, { state: { email: data.email } });

    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
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