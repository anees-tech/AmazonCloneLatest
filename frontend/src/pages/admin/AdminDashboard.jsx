"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { adminAPI } from "../../api/axios"
import "../../styles/admin/adminDashboard.css"

function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    users: 0,
    orders: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    // Format current date
    const date = new Date()
    setCurrentDate(
      date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    )

    const fetchStats = async () => {
      try {
        setLoading(true)
        const [productsRes, categoriesRes, usersRes, ordersRes] = await Promise.all([
          adminAPI.getAdminProducts(),
          adminAPI.getAdminCategories(),
          adminAPI.getUsers(),
          fetch("http://localhost:5000/api/orders")
            .then(res => res.json())
            .catch(() => ({ orders: [] })), // Handle if orders endpoint fails
        ])

        setStats({
          products: productsRes.data.products?.length || 0,
          categories: categoriesRes.data.categories?.length || 0,
          users: usersRes.data.users?.length || 0,
          orders: ordersRes.orders?.length || 0, // Note: different structure for fetch response
        })
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.")
        console.error("Dashboard fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    if (user && user._id) {
      fetchStats()
    } else {
      setLoading(false)
    }
  }, [user])

  if (loading) {
    return <div className="admin-dashboard loading">Loading Dashboard...</div>
  }

  if (error) {
    return <div className="admin-dashboard error">{error}</div>
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-welcome">Welcome back, {user?.name || "Admin"}!</p>
        </div>
        <div className="dashboard-date">{currentDate}</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="card-header">
            <div className="card-icon products">
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
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <div>
              <h3 className="card-title">Products</h3>
              <p className="card-value">{stats.products}</p>
            </div>
          </div>
          <Link to="/admin/products" className="card-link">
            Manage Products →
          </Link>
        </div>

        <div className="stat-card">
          <div className="card-header">
            <div className="card-icon categories">
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
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </div>
            <div>
              <h3 className="card-title">Categories</h3>
              <p className="card-value">{stats.categories}</p>
            </div>
          </div>
          <Link to="/admin/categories" className="card-link">
            Manage Categories →
          </Link>
        </div>

        <div className="stat-card">
          <div className="card-header">
            <div className="card-icon users">
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <h3 className="card-title">Users</h3>
              <p className="card-value">{stats.users}</p>
            </div>
          </div>
          <Link to="/admin/users" className="card-link">
            Manage Users →
          </Link>
        </div>

        <div className="stat-card">
          <div className="card-header">
            <div className="card-icon orders">
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
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </div>
            <div>
              <h3 className="card-title">Orders</h3>
              <p className="card-value">{stats.orders}</p>
            </div>
          </div>
          <Link to="/admin/orders" className="card-link">
            Manage Orders →
          </Link>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Quick Actions</h2>
        </div>
        <div className="actions-grid">
          <Link to="/admin/products" className="action-card">
            <div className="action-icon">
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
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            <h3 className="action-title">Add New Product</h3>
            <p className="action-description">Create a new product listing</p>
          </Link>

          <Link to="/admin/categories" className="action-card">
            <div className="action-icon">
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
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            <h3 className="action-title">Add New Category</h3>
            <p className="action-description">Create a new product category</p>
          </Link>

          <Link to="/admin/users" className="action-card">
            <div className="action-icon">
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <h3 className="action-title">Manage Users</h3>
            <p className="action-description">View and manage user accounts</p>
          </Link>

          <Link to="/admin/orders" className="action-card">
            <div className="action-icon">
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
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <h3 className="action-title">View Orders</h3>
            <p className="action-description">Check recent customer orders</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
