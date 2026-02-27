import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { ROUTES } from "../config/env";

// ─── Axios Instance ───────────────────────────────────────────────────────────
export const ProTimeBackend = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // sends httpOnly cookies (refresh_token) on every request
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface QueuedRequest {
  resolve: (value?: unknown) => void;
  reject: (error: unknown) => void;
}

interface ErrorResponse {
  success?: boolean;
  message?: string;
}

// ─── Refresh Queue ────────────────────────────────────────────────────────────
// Prevents multiple simultaneous refresh calls when several requests 401 at once
let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

const processQueue = (error: unknown): void => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const clearAuthAndRedirect = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("authSession"); // ← also clear session so Redux rehydrates as null
  window.location.href = ROUTES.LOGIN;
};

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attaches accessToken from localStorage to every request as Bearer header
ProTimeBackend.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
ProTimeBackend.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) return Promise.reject(error);

    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || "";

    // ─── 401 Handling ─────────────────────────────────────────────────────
    if (status === 401) {

      // Auth routes — 401s here are expected (wrong password, expired refresh, etc.)
      const isAuthRoute =
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/register") ||
        originalRequest.url?.includes("/auth/refresh-token") ||
        originalRequest.url?.includes("/auth/logout");

      if (isAuthRoute) {
        // Refresh token itself failed → session is unrecoverable → force logout
        if (originalRequest.url?.includes("/auth/refresh-token")) {
          clearAuthAndRedirect();
          toast.error("Session expired. Please login again.");
        }
        return Promise.reject(error);
      }

      // Only attempt token refresh for actual token errors
      const isTokenError =
        errorMessage === "Unauthorized access" ||
        errorMessage === "Access token expired" ||
        errorMessage === "Invalid token" ||
        errorMessage === "Authorization token is required";

      if (isTokenError && !originalRequest._retry) {

        // Queue this request if a refresh is already in progress
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => ProTimeBackend(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // POST /auth/refresh-token — backend reads refresh_token from httpOnly cookie
          // Response: { success: true, data: { accessToken: "..." } }
          const response = await ProTimeBackend.post("/auth/refresh-token");
          const newAccessToken = response.data?.data?.accessToken;

          if (newAccessToken) {
            // ✅ Update localStorage — interceptor will attach it to retried request
            localStorage.setItem("accessToken", newAccessToken);

            // ✅ Sync to Redux store so components reading user.accessToken stay current
            // Import store directly — hooks (useAppDispatch) only work inside React components
            const { store } = await import("../store/store");
            const { updateAccessToken } = await import("../features/auth/store/authSlice");
            store.dispatch(updateAccessToken(newAccessToken));
          }

          processQueue(null);

          // Retry the original failed request — interceptor now attaches new token
          return ProTimeBackend(originalRequest);

        } catch (refreshError) {
          processQueue(refreshError);
          clearAuthAndRedirect();
          toast.error("Session expired. Please login again.");
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // 401 but not a token error (e.g. wrong role) → redirect
      clearAuthAndRedirect();
      toast.error("Please login again.");
      return Promise.reject(error);
    }

    // ─── 403 Handling — Blocked user ──────────────────────────────────────
    if (status === 403) {
      if (errorMessage.toLowerCase().includes("blocked")) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("authSession");
        toast.error("Your account has been blocked. Please contact support.");
        window.location.href = ROUTES.LOGIN;
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);