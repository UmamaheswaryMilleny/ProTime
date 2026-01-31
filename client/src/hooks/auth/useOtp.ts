import { authApi } from "../../services/auth/authService";
import { useMutation } from "@tanstack/react-query";

type SendOtpPayload = {
  email: string;

};

export const useSendOtpMutation = () =>
  useMutation({
    mutationFn: (data: SendOtpPayload) =>
      authApi.sendOtp(data),
  });

export const useVerifyOtpMutation = () =>
  useMutation({ mutationFn: authApi.verifyOtpAndCreateUser });

export const useResendOtpMutation = () =>
  useMutation({ mutationFn: authApi.resendOtp });

