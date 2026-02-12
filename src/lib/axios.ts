import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
// 1. Import your store
import { useAuthStore } from "@/Store/Authstore";

const BACKEND_URL = "";

export const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

interface FailedRequest {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 401 Errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/api/auth/refresh");

        processQueue(null);
        isRefreshing = false;
        return api(originalRequest);

      } catch (refreshError) {
        // If the refresh token itself fails (e.g. it's expired or invalid):
        processQueue(new Error("Token refresh failed"));
        isRefreshing = false;

        // 2. Access Zustand store outside of React components using .getState()
        // This clears the user from the frontend state immediately
        useAuthStore.getState().logout();

        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
          toast.error("Session expired. Please login again.");
          window.location.href = "/auth/signin";
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle other standard errors
    if (error.response) {
      // Optional: You can handle global errors here, but often it's better 
      // to handle specific 400/404s in the components to show specific messages.
      if (error.response.status >= 500) {
        toast.error("Server error. Please try again later.");
      }
    }

    return Promise.reject(error);
  }
);


export const authAPI = {
  signup: (data: { username: string; full_name: string; email: string; password: string }) =>
    api.post("/api/auth/signup", data),

  signin: (data: { email: string; password: string }) =>
    api.post("/api/auth/signin", data),

  refresh: () => api.post("/api/auth/refresh", {}),

  logout: () => api.post("/api/auth/logout", {}),
};

export const tasksAPI = {
  getAll: () => api.get("/api/tasks"),
  getById: (id: number) => api.get(`/api/tasks/${id}`),
  create: (data: { title: string; body: string; due_date: string }) =>
    api.post("/api/tasks", data),
  update: (id: number, data: Partial<{ title: string; body: string; status: string; due_date: string }>) =>
    api.patch(`/api/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/api/tasks/${id}`),
};

export const logsAPI = {
  getAll: () => api.get("/api/logs"),
  getById: (id: number) => api.get(`/api/logs/${id}`),
  create: (data: { summary: string; rating: number; date: string }) =>
    api.post("/api/logs", data),
  update: (id: number, data: Partial<{ summary: string; rating: number }>) =>
    api.patch(`/api/logs/${id}`, data),
  delete: (id: number) => api.delete(`/api/logs/${id}`),
};

export const sleepAPI = {
  getAll: () => api.get("/api/sleep"),
  getById: (id: number) => api.get(`/api/sleep/${id}`),
  create: (data: { start_time: string; end_time: string }) =>
    api.post("/api/sleep", data),
  update: (id: number, data: { start_time: string; end_time: string }) =>
    api.patch(`/api/sleep/${id}`, data),
  delete: (id: number) => api.delete(`/api/sleep/${id}`),
};

export const ratingAPI = {
  getDayRatings: () => api.get("/api/day-rating"),
};