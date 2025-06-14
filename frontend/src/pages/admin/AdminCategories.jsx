"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { adminAPI } from "../../api/axios"
import "../../styles/admin/adminCategories.css"

function AdminCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    image: "",
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await adminAPI.getAdminCategories()
      
      if (response.data.success) {
        setCategories(response.data.categories || [])
      } else {
        setError("Failed to load categories")
      }
    } catch (err) {
      setError("Failed to load categories: " + (err.response?.data?.message || err.message))
      console.error("Error fetching categories:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      image: "",
    })
    setEditingCategory(null)
    setError("")
    setSuccess("")
  }

  const handleAddCategory = () => {
    setShowForm(true)
    resetForm()
  }

  const handleEditCategory = (category) => {
    setShowForm(true)
    setEditingCategory(category)
    setFormData({
      name: category.name,
      image: category.image || "",
    })
    setError("")
    setSuccess("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate form data
    if (!formData.name.trim()) {
      setError("Category name is required")
      return
    }

    try {
      const categoryData = {
        name: formData.name.trim(),
        image: formData.image.trim() || "",
      }

      let response

      if (editingCategory) {
        // Use _id for MongoDB operations
        response = await adminAPI.updateCategory(editingCategory._id, categoryData)
        
        if (response.data.success) {
          setCategories(categories.map((c) => 
            c._id === editingCategory._id ? response.data.category : c
          ))
          setSuccess("Category updated successfully")
        }
      } else {
        response = await adminAPI.createCategory(categoryData)
        
        if (response.data.success) {
          setCategories([...categories, response.data.category])
          setSuccess("Category created successfully")
        }
      }

      setShowForm(false)
      resetForm()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to save category"
      setError(errorMessage)
      console.error("Error saving category:", err)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return
    }

    try {
      setError("")
      const response = await adminAPI.deleteCategory(categoryId)
      
      if (response.data.success) {
        setCategories(categories.filter((c) => c._id !== categoryId))
        setSuccess("Category deleted successfully")
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to delete category"
      setError(errorMessage)
      console.error("Error deleting category:", err)
    }
  }

  if (loading) {
    return (
      <div className="admin-categories">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-categories">
      <div className="categories-header">
        <h1 className="categories-title">Categories Management</h1>
        <button className="add-category-btn" onClick={handleAddCategory}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Category
        </button>
      </div>

      {/* Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <div className="category-form-overlay">
          <div className="category-form-container">
            <div className="form-header">
              <h2 className="category-form-title">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button 
                className="close-form-btn"
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label htmlFor="name">Category Name *</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Enter category name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">Image URL</label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg or /images/category.jpg"
                />
                {formData.image && (
                  <div className="image-preview">
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="save-button">
                  {editingCategory ? "Update Category" : "Create Category"}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="categories-table-container">
        {categories.length > 0 ? (
          <table className="categories-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>ID</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id}>
                  <td>
                    <div className="category-image">
                      <img
                        src={category.image || "/api/placeholder/50/50"}
                        alt={category.name}
                        className="category-thumbnail"
                        onError={(e) => {
                          e.target.src = "/api/placeholder/50/50"
                        }}
                      />
                    </div>
                  </td>
                  <td className="category-name">
                    <strong>{category.name}</strong>
                  </td>
                  <td className="category-id">
                    <code>{category._id}</code>
                  </td>
                  <td className="category-date">
                    {category.createdAt ? new Date(category.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : 'N/A'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-button" 
                        onClick={() => handleEditCategory(category)} 
                        title="Edit Category"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteCategory(category._id)}
                        title="Delete Category"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-categories">
            <div className="empty-categories-icon">📂</div>
            <h3 className="empty-categories-message">No categories found</h3>
            <p className="empty-categories-description">
              Start by creating your first category to organize your products.
            </p>
            <button onClick={handleAddCategory} className="add-category-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create First Category
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCategories
