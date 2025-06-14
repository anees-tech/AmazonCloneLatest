import axios from "axios"

const API_BASE_URL = "http://localhost:5000/api"

// Create main API instance
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: (credentials) => API.post("/auth/login", credentials),
  register: (userData) => API.post("/auth/register", userData),
  logout: () => API.post("/auth/logout"),
  getProfile: () => API.get("/auth/profile"),
}

// Product API
export const productAPI = {
  getAllProducts: () => API.get("/products"),
  getProductById: (id) => API.get(`/products/${id}`),
  createProduct: (productData) => API.post("/products", productData),
  updateProduct: (id, productData) => API.put(`/products/${id}`, productData),
  deleteProduct: (id) => API.delete(`/products/${id}`),
}

// Category API
export const categoryAPI = {
  getAllCategories: () => API.get("/categories"),
  getCategoryById: (id) => API.get(`/categories/${id}`),
  createCategory: (categoryData) => API.post("/categories", categoryData),
  updateCategory: (id, categoryData) => API.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => API.delete(`/categories/${id}`),
}

// Admin API functions
export const adminAPI = {
  // Categories
  getAdminCategories: () => API.get("/admin/categories"),
  createCategory: (data) => API.post("/admin/categories", data),
  updateCategory: (id, data) => API.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => API.delete(`/admin/categories/${id}`),

  // Products
  getAdminProducts: () => API.get("/admin/products"),
  createProduct: (data) => API.post("/admin/products", data),
  updateProduct: (id, data) => API.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => API.delete(`/admin/products/${id}`),

  // Users
  getAdminUsers: () => API.get("/admin/users"),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),

  // Orders
  getAdminOrders: () => API.get("/admin/orders"),
  getAdminOrder: (id) => API.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, data) => API.put(`/admin/orders/${id}`, data),
  deleteOrder: (id) => API.delete(`/admin/orders/${id}`),
  getOrderStats: () => API.get("/admin/orders-stats"),
}

export default API
