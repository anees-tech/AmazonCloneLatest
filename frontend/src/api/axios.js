import axios from "axios"

// Base API instance banaya gaya hai
const API = axios.create({
  baseURL: "http://localhost:5000/api", // Backend ka base URL
  headers: {
    "Content-Type": "application/json", // Default content type JSON rakha gaya hai
  },
})

// Request interceptor add kiya gaya hai taake har request ke headers mein user ID shamil ho
API.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user")) // Local storage se user data le rahe hain
    if (user && user._id) {
      config.headers["User-ID"] = user._id // Agar user authenticated hai to User-ID header mein add karte hain
    }
    return config
  },
  (error) => {
    return Promise.reject(error) // Agar koi error ho to usse reject karte hain
  },
)

// Auth endpoints ke liye functions define kiye gaye hain
export const authAPI = {
  login: (data) => API.post("/auth/login", data), // Login endpoint
  register: (data) => API.post("/auth/register", data), // Register endpoint
}

// Product endpoints ke liye functions define kiye gaye hain
export const productAPI = {
  getAllProducts: () => API.get("/products"), // Saare products lene ke liye
  getProductById: (id) => API.get(`/products/${id}`), // Specific product by ID
  getProductsByCategory: (categoryId) => API.get(`/products/category/${categoryId}`), // Category ke products
  getFeaturedProducts: () => API.get("/products/featured"), // Featured products lene ke liye
}

// Category endpoints ke liye functions define kiye gaye hain
export const categoryAPI = {
  getAllCategories: () => API.get("/categories"), // Saari categories lene ke liye
}

// Admin endpoints ke liye functions define kiye gaye hain
export const adminAPI = {
  // Saare products lene ke liye
  getAdminProducts: () => API.get("/admin/products"),
  // Naya product banane ke liye
  createProduct: (data) => API.post("/admin/products", data),
  // Product update karne ke liye
  updateProduct: (id, data) => API.put(`/admin/products/${id}`, data),
  // Product delete karne ke liye
  deleteProduct: (id) => API.delete(`/admin/products/${id}`),

  // Admin categories ke liye
  getAdminCategories: () => API.get("/admin/categories"), // Saari categories lene ke liye
  createCategory: (data) => API.post("/admin/categories", data), // Nayi category banane ke liye
  updateCategory: (id, data) => API.put(`/admin/categories/${id}`, data), // Category update karne ke liye
  deleteCategory: (id) => API.delete(`/admin/categories/${id}`), // Category delete karne ke liye

  // Admin users ke liye
  getUsers: () => API.get("/admin/users"), // Saare users lene ke liye
  toggleAdminStatus: (id) => API.put(`/admin/users/${id}/toggle-admin`), // User ka admin status toggle karne ke liye
  deleteUser: (id) => API.delete(`/admin/users/${id}`), // User delete karne ke liye
  updateUser: (userId, userData) => API.put(`/admin/users/${userId}`, userData), // User update karne ke liye
}

export default API // API instance ko export karte hain
