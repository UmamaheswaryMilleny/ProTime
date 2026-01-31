import { ProTimeBackend } from "../../api/instance";
import { AUTH_CONFIG } from "../../config/env";
import type {
  RegisterPayload,
  LoginPayload,
  AdminLoginPayload,
  User
} from "../../types/auth-types";

export const authApi = {
  registerService: async (data: RegisterPayload) => {
    const response = await ProTimeBackend.post(AUTH_CONFIG.REGISTER, data);
    return response.data;
  },
  loginService: async (data: LoginPayload) => {
    const response = await ProTimeBackend.post(AUTH_CONFIG.LOGIN, data);
    return response.data;
  },

  AdminloginService: async (data: AdminLoginPayload) => {
    const response = await ProTimeBackend.post(
      AUTH_CONFIG.ADMIN_LOGIN,
      data
    );
    return response.data;
  },

  //otp service
  sendOtp: async (data: { email: string;  }) => {
    return ProTimeBackend.post("/auth/send-otp", data);
  },

  verifyOtpAndCreateUser: async (data: {
    email: string;
    otp: string;
    // userData: {
    //   firstName: string;
    //   lastName: string;
    //   email: string;
    //   password: string;
    //   role: "client";
    // };
  }) => {
    return ProTimeBackend.post("/auth/verify-createuser", data);
  },

  resendOtp: async (email: string) => {
    return ProTimeBackend.post("/auth/resend-otp", { email });
  },


  logoutService: async () => {
    const response = await ProTimeBackend.post(AUTH_CONFIG.LOGOUT);
    return response.data;
  },

   me: async (): Promise<User> => {
    const response = await ProTimeBackend.get(AUTH_CONFIG.ME);
    // backend returns { data: CurrentUserResponseDTO } via ResponseHelper.success
    return response.data.data as User;
  },

  forgotPassword: async (data: { email: string; role?: string }) => {
    const response = await ProTimeBackend.post("/auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (data: {
    token: string;
    password: string;
    confirmPassword: string;
  }) => {
    const response = await ProTimeBackend.post("/auth/reset-password", data);
    return response.data;
  },

  verifyResetToken: async (token: string) => {
    const response = await ProTimeBackend.get(
      `/auth/verify-reset-token?token=${token}`
    );
    return response.data;
  },

googleAuth: async (data: { accessToken: string }) => {
  const response = await ProTimeBackend.post("/auth/google", data);
  return response.data;
},

};