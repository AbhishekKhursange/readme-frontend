import apiClient from "./axiosConfig";

export const adminService = {
  getAllUsers: () => apiClient.get("/users").then((res) => res.data),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),
};
