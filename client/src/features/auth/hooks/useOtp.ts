import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

import { verifyOtpAPI, resendOtpAPI } from '../services/auth-service';
import { clearPendingEmail } from '../store/authSlice';
import { selectPendingEmail } from '../store/authSelectors';
import { ROUTES } from '../../../config/env';

export const useOtp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Get email from Redux (set during register) or from navigation state (fallback)
  const pendingEmailFromRedux = useAppSelector(selectPendingEmail);
  const email = pendingEmailFromRedux || location.state?.email;

  // Redirect if no email found — user came to OTP page directly
  useEffect(() => {
    if (!email) {
      toast.error('No email found. Please register again.');
      navigate(ROUTES.REGISTER);
    }
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Format timer as MM:SS
  const formattedTimer = `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`;

  const handleVerifyOtp = async (otp: string) => {
    if (!email) return;

    setIsLoading(true);
    try {
      // POST /auth/verify-otp → { email, otp }
      // Creates real user + profile in DB
      await verifyOtpAPI({ email, otp });

      // Clean up pending email from Redux
      dispatch(clearPendingEmail());

      toast.success('Email verified! Please login.');
      navigate(ROUTES.LOGIN);

    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message = err.response?.data?.message || 'Verification failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email || !canResend) return;

    setIsResending(true);
    try {
      // POST /auth/resend-otp → { email }
      await resendOtpAPI({ email });

      toast.success('OTP resent successfully!');

      // Reset timer
      setTimer(60);
      setCanResend(false);

    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message = err.response?.data?.message || 'Failed to resend OTP.';

      // Session expired — temp user deleted from Redis after 5 min
      // Redirect back to register so they can start fresh
      if (err.response?.status === 400) {
        toast.error('Session expired. Please register again.');
        dispatch(clearPendingEmail());
        navigate(ROUTES.REGISTER);
        return;
      }

      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return {
    email,
    isLoading,
    isResending,
    canResend,
    formattedTimer,
    handleVerifyOtp,
    handleResendOtp,
  };
};