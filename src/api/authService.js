import apiClient from "./axiosConfig";

export const authService = {
  register: (data) => apiClient.post("/auth/register", data).then((res) => res.data),
  login: (data) => apiClient.post("/auth/login", data).then((res) => res.data),
  refresh: (refreshToken) => apiClient.post("/auth/refresh", { refreshToken }).then((res) => res.data),
  logout: (refreshToken) => apiClient.post("/auth/logout", { refreshToken }),
};
