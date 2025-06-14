import API from "./axios"

// Admin API functions
export const adminAPI = {
  // Users
  getUsers: () => API.get("/admin/users"),
  updateUser: (id, userData) => API.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  toggleAdminStatus: (id) => API.put(`/admin/users/${id}/toggle-admin`),

  // Products
  getAdminProducts: () => API.get("/admin/products"),
  createProduct: (productData) => API.post("/admin/products", productData),
  updateProduct: (id, productData) => API.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => API.delete(`/admin/products/${id}`),

  // Categories
  getAdminCategories: () => API.get("/admin/categories"),
  createCategory: (categoryData) => API.post("/admin/categories", categoryData),
  updateCategory: (id, categoryData) => API.put(`/admin/categories/${id}`, categoryData),
  deleteCategory: (id) => API.delete(`/admin/categories/${id}`),

  // Orders
  getOrders: () => API.get("/admin/orders"),
  getOrder: (id) => API.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, statusData) => API.put(`/admin/orders/${id}`, statusData),
  deleteOrder: (id) => API.delete(`/admin/orders/${id}`),
  getOrderStats: () => API.get("/admin/orders-stats"),

  // Generic methods for backward compatibility
  get: (endpoint) => API.get(`/admin${endpoint}`),
  post: (endpoint, data) => API.post(`/admin${endpoint}`, data),
  put: (endpoint, data) => API.put(`/admin${endpoint}`, data),
  delete: (endpoint) => API.delete(`/admin${endpoint}`),
}

export default adminAPI
