import apiClient from "./axiosConfig";

export const bookService = {
  getAllBooks: () => apiClient.get("/books").then((res) => res.data),

  getBooksByCategory: (categorySlug) =>
    apiClient.get("/books", { params: { category: categorySlug } }).then((res) => res.data),

  searchBooks: (query) =>
    apiClient.get("/books", { params: { search: query } }).then((res) => res.data),

  getBookBySlug: (slug) => apiClient.get(`/books/${slug}`).then((res) => res.data),

  createBook: (bookRequest) => apiClient.post("/books", bookRequest).then((res) => res.data),

  deleteBook: (id) => apiClient.delete(`/books/${id}`),
};

export const categoryService = {
  getAllCategories: () => apiClient.get("/categories").then((res) => res.data),
  getCategoryBySlug: (slug) => apiClient.get(`/categories/${slug}`).then((res) => res.data),
  createCategory: (data) => apiClient.post("/categories", data).then((res) => res.data),
  deleteCategory: (id) => apiClient.delete(`/categories/${id}`),
};

export const uploadService = {
  uploadImage: (file, folder = "books") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    return apiClient
      .post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((res) => res.data);
  },
};

export const volumeService = {
  getAllVolumes: () => apiClient.get("/volumes").then((res) => res.data),
  getVolumeBySlug: (slug) => apiClient.get(`/volumes/${slug}`).then((res) => res.data),
};

export const chapterService = {
  getChapterBySlug: (slug) => apiClient.get(`/chapters/${slug}`).then((res) => res.data),
};
