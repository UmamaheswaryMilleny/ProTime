import { ProTimeBackend } from "../../../api/instance";
import { API_ROUTES } from "../../../config/env";
import type {
  ApiResponse,
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenResponseData,
  GoogleAuthRequest,
  GoogleAuthResponseData,
} from "../types/auth.types";

// ─── Register ─────────────────────────────────────────────────────────────────
// POST /auth/register
// Sends user details, backend stores temp user + sends OTP email
export const registerAPI = (data: RegisterRequest) => {
  return ProTimeBackend.post<ApiResponse>(API_ROUTES.REGISTER, data);
};

// ─── Send OTP ─────────────────────────────────────────────────────────────────
// POST /auth/send-otp
// Triggers OTP send for a given email
export const sendOtpAPI = (email: string) => {
  return ProTimeBackend.post<ApiResponse>(API_ROUTES.SEND_OTP, { email });
};

// ─── Resend OTP ───────────────────────────────────────────────────────────────
// POST /auth/resend-otp
// Resends OTP — only works within 5 min TTL of register
export const resendOtpAPI = (data: ResendOtpRequest) => {
  return ProTimeBackend.post<ApiResponse>(API_ROUTES.RESEND_OTP, data);
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────
// POST /auth/verify-otp
// Verifies OTP + creates real user + creates profile in DB
export const verifyOtpAPI = (data: VerifyOtpRequest) => {
  return ProTimeBackend.post<ApiResponse>(API_ROUTES.VERIFY_OTP, data);
};

// ─── Login ────────────────────────────────────────────────────────────────────
// POST /auth/login
// Returns accessToken in body + sets refresh_token + access_token httpOnly cookies
export const loginAPI = (data: LoginRequest) => {
  return ProTimeBackend.post<ApiResponse<LoginResponseData>>(
    API_ROUTES.LOGIN,
    data
  );
};

// ─── Logout ───────────────────────────────────────────────────────────────────
// POST /auth/logout
// Deletes refresh token from Redis + clears cookies
export const logoutAPI = () => {
  return ProTimeBackend.post<ApiResponse>(API_ROUTES.LOGOUT);
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
// POST /auth/refresh-token
// Uses refresh_token cookie to generate new access token
// No body needed — cookie is sent automatically via withCredentials: true
export const refreshTokenAPI = () => {
  return ProTimeBackend.post<ApiResponse<RefreshTokenResponseData>>(
    API_ROUTES.REFRESH_TOKEN
  );
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
// POST /auth/forgot-password
// Sends reset link to email — never reveals if email exists
export const forgotPasswordAPI = (data: ForgotPasswordRequest) => {
  return ProTimeBackend.post<ApiResponse>(API_ROUTES.FORGOT_PASSWORD, data);
};

// ─── Verify Reset Token ───────────────────────────────────────────────────────
// GET /auth/verify-reset-token?token=...
// Validates reset token before showing reset form
export const verifyResetTokenAPI = (token: string) => {
  return ProTimeBackend.get<ApiResponse>(API_ROUTES.VERIFY_RESET_TOKEN, {
    params: { token },
  });
};

// ─── Reset Password ───────────────────────────────────────────────────────────
// POST /auth/reset-password
// Resets password using token + new password
export const resetPasswordAPI = (data: ResetPasswordRequest) => {
  return ProTimeBackend.post<ApiResponse>(API_ROUTES.RESET_PASSWORD, data);
};

// ─── Google Auth ──────────────────────────────────────────────────────────────
// POST /auth/google
// Verifies Google ID token, creates/logs in user, returns accessToken
export const googleAuthAPI = (data: GoogleAuthRequest) => {
  return ProTimeBackend.post<ApiResponse<GoogleAuthResponseData>>(
    API_ROUTES.GOOGLE_AUTH,
    data
  );
};