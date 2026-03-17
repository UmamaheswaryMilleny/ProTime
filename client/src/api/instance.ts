import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { ROUTES } from "../shared/constants/constants.routes";

// ─── Axios Instances ──────────────────────────────────────────────────────────

// basicApi: For public routes and internal auth (avoids interceptor loops)
const basicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// ProTimeBackend: The main instance with interceptors for authenticated requests
export const ProTimeBackend = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
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
  const sessionStr = localStorage.getItem("authSession");

  const isAdmin =
    sessionStr &&
    (() => {
      try {
        return JSON.parse(sessionStr)?.role === "ADMIN";
      } catch {
        return false;
      }
    })();

  localStorage.clear();

  const target = isAdmin ? ROUTES.ADMIN_LOGIN : ROUTES.LOGIN;
  if (!window.location.pathname.includes(target)) {
    window.location.replace(target);
  }
};

// ─── Request Interceptor ──────────────────────────────────────────────────────
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
      const isAuthRoute =
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/register") ||
        originalRequest.url?.includes("/auth/refresh-token") ||
        originalRequest.url?.includes("/auth/logout");

      if (isAuthRoute) {
        if (originalRequest.url?.includes("/auth/refresh-token")) {
          clearAuthAndRedirect();
          toast.error("Session expired. Please login again.");
        }
        return Promise.reject(error);
      }

      const isTokenError =
        errorMessage === "Unauthorized access" ||
        errorMessage === "Access token expired" ||
        errorMessage === "Invalid token" ||
        errorMessage === "Authorization token is required";

      if (isTokenError && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              // Interceptor will re-add the NEW token from localStorage
              return ProTimeBackend(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Use basicApi to avoid recursive interceptor calls
          const response = await basicApi.post("/auth/refresh-token");
          const newAccessToken = response.data?.data?.accessToken;

          if (newAccessToken) {
            localStorage.setItem("accessToken", newAccessToken);

            // Sync with Redux
            const { store } = await import("../store/store");
            const { updateAccessToken } = await import("../features/auth/store/authSlice");
            store.dispatch(updateAccessToken(newAccessToken));

            // Update header for this specific retry
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            processQueue(null);
            return ProTimeBackend(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError);
          clearAuthAndRedirect();
          toast.error("Session expired. Please login again.");
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // 401 but not a token error (e.g. wrong role)
      clearAuthAndRedirect();
      toast.error("Please login again.");
      return Promise.reject(error);
    }

    // ─── 403 Blocked Handling ─────────────────────────────────────────────
    if (status === 403) {
      if (errorMessage.toLowerCase().includes("blocked")) {
        const isLoginRoute = originalRequest.url?.includes("/auth/login");
        if (!isLoginRoute) {
          toast.error("Your account has been blocked. Please contact support.");
          clearAuthAndRedirect();
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);