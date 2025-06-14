"use client"

import React, { useState, useEffect, useCallback } from "react"
import { productAPI, categoryAPI } from "../../api/axios"
import { useAuth } from "../../context/AuthContext"
import "../../styles/admin/adminProducts.css"

function AdminProducts() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(10)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: "",
    featured: false,
  })

  // Create a memoized fetch function to prevent infinite loops
  const fetchData = useCallback(async () => {
    if (!user?._id) return

    try {
      setLoading(true)
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getAllProducts(),
        categoryAPI.getAllCategories(),
      ])

      console.log("Products response:", productsRes.data)
      console.log("Categories response:", categoriesRes.data)

      // Handle different response structures
      const productsData = productsRes.data?.products || productsRes.data || []
      const categoriesData = categoriesRes.data?.categories || categoriesRes.data || []

      setProducts(productsData)
      setCategories(categoriesData)
    } catch (err) {
      setError("Failed to load products data")
      console.error(err)
      setProducts([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [user?._id]) // Only depend on user._id

  // Use the memoized function in useEffect
  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.price || !formData.category) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      setError("")

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
      }

      if (editingProduct) {
        const response = await productAPI.updateProduct(editingProduct._id || editingProduct.id, productData)
        
        // Update the specific product in the array instead of refetching
        setProducts(prev => prev.map(p => 
          (p._id || p.id) === (editingProduct._id || editingProduct.id) 
            ? { ...p, ...productData, _id: p._id || p.id }
            : p
        ))
      } else {
        const response = await productAPI.createProduct(productData)
        
        // Add the new product to the array instead of refetching
        if (response.data) {
          setProducts(prev => [...prev, response.data])
        }
      }

      resetForm()
      setShowModal(false)
    } catch (err) {
      console.error("Error saving product:", err)
      setError(err.response?.data?.message || "Failed to save product")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      category: (typeof product.category === 'object' ? product.category._id : product.category) || "",
      image: product.image || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : ""),
      stock: product.stock?.toString() || "0",
      featured: product.featured || false,
    })
    setShowModal(true)
  }

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      setLoading(true)
      await productAPI.deleteProduct(productId)
      
      // Remove the product from the array instead of refetching
      setProducts(prev => prev.filter(p => (p._id || p.id) !== productId))
    } catch (err) {
      console.error("Error deleting product:", err)
      setError(err.response?.data?.message || "Failed to delete product")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      image: "",
      stock: "",
      featured: false,
    })
    setEditingProduct(null)
    setError("")
  }

  const openModal = () => {
    resetForm()
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  // Memoize filtered products to prevent unnecessary recalculations
  const filteredProducts = React.useMemo(() => {
    if (!Array.isArray(products)) return []

    return products.filter((product) => {
      if (!product) return false

      const matchesSearch =
        !searchTerm || (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory =
        !selectedCategory ||
        (product.category && (
          product.category._id === selectedCategory || 
          product.category === selectedCategory ||
          (typeof product.category === 'string' && product.category === selectedCategory)
        ))

      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, selectedCategory])

  // Memoize pagination calculations
  const paginationData = React.useMemo(() => {
    const indexOfLastProduct = currentPage * productsPerPage
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

    return { currentProducts, totalPages }
  }, [filteredProducts, currentPage, productsPerPage])

  const getCategoryName = (categoryId) => {
    if (!categoryId || !Array.isArray(categories)) return categoryId || "Unknown"

    const actualCategoryId = typeof categoryId === 'object' ? categoryId._id || categoryId.id : categoryId
    
    const category = categories.find(
      (cat) => cat && (cat._id === actualCategoryId || cat.id === actualCategoryId)
    )
    return category?.name || actualCategoryId || "Unknown"
  }

  if (!user) {
    return (
      <div className="admin-products">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          Please log in to access the admin panel.
        </div>
      </div>
    )
  }

  if (loading && (!Array.isArray(products) || products.length === 0)) {
    return (
      <div className="admin-products">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-products">
      <div className="header">
        <h1>Product Management</h1>
        <button className="add-button" onClick={openModal} disabled={loading}>
          + Add New Product
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button className="close-error" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
            {Array.isArray(categories) &&
              categories.map(
                (category) =>
                  category && (
                    <option key={category._id || category.id} value={category._id || category.id}>
                      {category.name}
                    </option>
                  )
              )}
            <option value="home-assesories">Home Accessories</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginationData.currentProducts.length > 0 ? (
              paginationData.currentProducts.map((product) => {
                if (!product) return null

                return (
                  <tr key={product._id || product.id}>
                    <td>
                      <img
                        src={
                          product.image || 
                          (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null) ||
                          "/api/placeholder/50/50"
                        }
                        alt={product.name || "Product"}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = "/api/placeholder/50/50"
                        }}
                      />
                    </td>
                    <td className="product-name">{product.name || "Unnamed Product"}</td>
                    <td>{getCategoryName(product.category)}</td>
                    <td className="price">${Number(product.price || 0).toFixed(2)}</td>
                    <td className="stock">
                      <span
                        className={`stock-badge ${
                          (product.stock || 0) > 10
                            ? "in-stock"
                            : (product.stock || 0) > 0
                            ? "low-stock"
                            : "out-of-stock"
                        }`}
                      >
                        {product.stock !== undefined ? product.stock : "N/A"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`featured-badge ${
                          product.featured ? "featured" : "not-featured"
                        }`}
                      >
                        {product.featured ? "⭐ Yes" : "No"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-button"
                          onClick={() => handleEdit(product)}
                          disabled={loading}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(product._id || product.id)}
                          disabled={loading}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="7" className="no-products">
                  {searchTerm || selectedCategory ? "No products match your filters" : "No products found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginationData.totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-button"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <span className="page-info">
            Page {currentPage} of {paginationData.totalPages}
          </span>

          <button
            className="page-button"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, paginationData.totalPages))}
            disabled={currentPage === paginationData.totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Modal - Keep existing modal code */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              <button className="close-button" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="form-textarea"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock">Stock</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="">Select a category</option>
                  {Array.isArray(categories) &&
                    categories.map(
                      (category) =>
                        category && (
                          <option key={category._id || category.id} value={category._id || category.id}>
                            {category.name}
                          </option>
                        )
                    )}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="image">Image URL</label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span className="checkbox-text">Featured Product</span>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={closeModal}
                  className="cancel-button"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts