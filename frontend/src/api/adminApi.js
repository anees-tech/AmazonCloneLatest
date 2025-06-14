import axios from "axios"

const API_URL = "http://localhost:5000/api/admin"

// Create axios instance with credentials
const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

// Admin Authentication
export const adminLogin = async (credentials) => {
  try {
    const response = await adminApi.post("/login", credentials)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Server error" }
  }
}

// Dashboard
export const getDashboardStats = async () => {
  try {
    const response = await adminApi.get("/stats")
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Server error" }
  }
}

// Products
export const getProducts = async () => {
  try {
    const response = await adminApi.get("/products")
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Server error" }
  }
}

export const getProduct = async (id) => {
  try {
    const response = await adminApi.get(`/products/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Server error" }
  }
}

export const createProduct = async (productData) => {
  try {
    const response = await adminApi.post("/products", productData)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Server error" }
  }
}

export const updateProduct = async (id, productData) => {
  try {
    const response = await adminApi.put(`/products/${id}`, productData)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Server error" }
  }
}

export const deleteProduct = async (id) => {
  try {
    const response = await adminApi.delete(`/products/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Server error" }
  }
}

// Categories
export const getCategories = async () => {
  try {
    const response = await adminApi.get("/categories")
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Server error" }
  }
}

export const getCategory = async (id) => {
  try {
    const response = await adminApi.get(`/categories/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Server error" }
  }
}

export const createCategory = async (categoryData) => {
  try {
    const response = await adminApi.post("/categories", categoryData)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Server error" }
  }
}

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await adminApi.put(`/categories/${id}`, categoryData)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Server error" }
  }
}

export const deleteCategory = async (id) => {
  try {
    const response = await adminApi.delete(`/categories/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Server error" }
  }
}

// Users
export const getUsers = async () => {
  try {
    const response = await adminApi.get("/users")
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Server error" }
  }
}

export const getUser = async (id) => {
  try {
    const response = await adminApi.get(`/users/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Server error" }
  }
}

export const updateUser = async (id, userData) => {
  try {
    const response = await adminApi.put(`/users/${id}`, userData)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Server error" }
  }
}

export const deleteUser = async (id) => {
  try {
    const response = await adminApi.delete(`/users/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Server error" }
  }
}

// Orders
export const getOrders = async () => {
  try {
    const response = await adminApi.get("/orders")
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Server error" }
  }
}

export const getOrder = async (id) => {
  try {
    const response = await adminApi.get(`/orders/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Server error" }
  }
}

export const updateOrderStatus = async (id, status) => {
  try {
    const response = await adminApi.put(`/orders/${id}`, { status })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Server error" }
  }
}

export default adminApi
