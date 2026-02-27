// ─── Request Types (what we send to backend) ─────────────────────────────────

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

// ─── Response Types (what backend sends back) ─────────────────────────────────

// Standard wrapper — every backend response has this shape
export interface ApiResponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
}

// POST /auth/login → response.data.data
export interface LoginResponseData {
  accessToken: string;
}

// POST /auth/refresh-token → response.data.data
export interface RefreshTokenResponseData {
  accessToken: string;
}

// POST /auth/google → response.data.data
export interface GoogleAuthResponseData {
  accessToken: string;
  isNewUser: boolean;
}

// ─── Redux State User Shape ───────────────────────────────────────────────────

// Stored in Redux + localStorage after login
// Built from login response + JWT decode or separate profile fetch
export interface AuthUser {
  id: string;
  fullName: string;         // ← capital N to match backend UserProfileResponseDTO
  email: string;
  role: "ADMIN" | "CLIENT";
  accessToken: string;
  profileImage?: string;    // ← from profile, optional
}

// ─── Redux Auth State ─────────────────────────────────────────────────────────

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  pendingEmail: string | null; // email stored between register → verify-otp
}