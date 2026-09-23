import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT (if we have one) to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ReadMe_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let waiters = [];

function clearSessionAndRedirect() {
  localStorage.removeItem("ReadMe_token");
  localStorage.removeItem("ReadMe_refresh_token");
  localStorage.removeItem("ReadMe_user");
  window.location.href = "/login";
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest?.url?.includes("/auth/");

    if (error.response?.status !== 401 || originalRequest._retry || isAuthRoute) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        waiters.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem("ReadMe_refresh_token");
    if (!refreshToken) {
      clearSessionAndRedirect();
      return Promise.reject(error);
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
      const { token, refreshToken: newRefreshToken } = res.data;

      localStorage.setItem("ReadMe_token", token);
      localStorage.setItem("ReadMe_refresh_token", newRefreshToken);

      waiters.forEach(({ resolve }) => resolve(token));
      waiters = [];

      originalRequest.headers.Authorization = `Bearer ${token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      waiters.forEach(({ reject }) => reject(refreshError));
      waiters = [];
      clearSessionAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
