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

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    image: "",
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await adminAPI.getAdminCategories()
        setCategories(response.data.categories)
      } catch (err) {
        setError("Failed to load categories")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (user && user._id) {
      fetchCategories()
    }
  }, [user])

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
      image: category.image,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const categoryData = {
        ...formData,
      }

      let response

      if (editingCategory) {
        response = await adminAPI.updateCategory(editingCategory.id, categoryData)
        setCategories(categories.map((c) => (c.id === editingCategory.id ? response.data.category : c)))
      } else {
        response = await adminAPI.createCategory(categoryData)
        setCategories([...categories, response.data.category])
      }

      setShowForm(false)
      resetForm()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save category")
      console.error(err)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return
    }

    try {
      await adminAPI.deleteCategory(id)
      setCategories(categories.filter((c) => c.id !== id))
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete category")
      console.error(err)
    }
  }

  if (loading) {
    return <div className="admin-categories loading">Loading categories...</div>
  }

  return (
    <div className="admin-categories">
      <div className="categories-header">
        <h1 className="categories-title">Categories</h1>
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

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="category-form-container">
          <h2 className="category-form-title">{editingCategory ? "Edit Category" : "Add New Category"}</h2>
          <form onSubmit={handleSubmit} className="category-form">
            <div className="form-group">
              <label htmlFor="name">Category Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            

            <div className="form-group">
              <label htmlFor="image">Image URL</label>
              <input
                type="text"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="/images/categories/your-category.jpg"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-button">
                {editingCategory ? "Update Category" : "Add Category"}
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
      )}

      <div className="categories-table-container">
        <table className="categories-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((category) => (
                <tr key={category.id}>
                  <td className="category-id">{category.id}</td>
                  <td>
                    <img
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      className="category-thumbnail"
                    />
                  </td>
                  <td className="category-name">{category.name}</td>

                  <td>
                    <div className="action-buttons">
                      <button className="edit-button" onClick={() => handleEditCategory(category)} title="Edit">
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
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteCategory(category.id)}
                        title="Delete"
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
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-data">
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminCategories
