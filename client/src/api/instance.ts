import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { ROUTES } from "../config/env";

export const ProTimeBackend = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

interface QueuedRequest {
  resolve: (value?: unknown) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

const processQueue = (error: unknown): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

const clearAuthAndRedirect = (): void => {
  localStorage.removeItem("authSession");
  localStorage.removeItem("accessToken");
  window.location.href = ROUTES.LOGIN;
};

interface ErrorResponse {
  success?: boolean;
  message?: string;
  forceLogout?: boolean;
}

ProTimeBackend.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

ProTimeBackend.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const responseData = error.response?.data as ErrorResponse | undefined;
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const errorMessage = error.response?.data?.message || "";
    const status = error.response?.status;

    if (status === 401) {
      if (
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/refresh-token") ||
        originalRequest.url?.includes("/auth/logout")
      ) {
        if (originalRequest.url?.includes("/auth/refresh-token")) {
          clearAuthAndRedirect();
          toast.error("Session expired. Please login again.");
        }
        return Promise.reject(error);
      }

      const isAccessTokenError =
        errorMessage === "Unauthorized access" ||
        errorMessage === "Access token expired" ||
        errorMessage === "Invalid token" ||
        errorMessage === "";

      if (isAccessTokenError && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return ProTimeBackend(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await ProTimeBackend.post("/auth/refresh-token");

          processQueue(null);

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

      clearAuthAndRedirect();
      toast.error("Please login again");
      return Promise.reject(error);
    }

    if (status === 403) {
      const errorMessage = responseData?.message || "";

      if (
        errorMessage.toLowerCase().includes("blocked") ||
        responseData?.forceLogout
      ) {
        localStorage.removeItem("authSession");
        localStorage.removeItem("accessToken");

        toast.error("Your account has been blocked. Please contact support.");

        window.location.href = ROUTES.LOGIN;

        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);
