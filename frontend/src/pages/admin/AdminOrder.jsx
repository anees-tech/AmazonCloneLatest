"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import "../../styles/admin/adminOrders.css"

function AdminOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("all")

  // Sample data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const sampleOrders = [
        {
          id: "ORD-001",
          date: "2023-05-01",
          customer: "John Doe",
          total: 129.99,
          status: "Delivered",
          items: 3,
        },
        {
          id: "ORD-002",
          date: "2023-05-03",
          customer: "Jane Smith",
          total: 89.95,
          status: "Processing",
          items: 2,
        },
        {
          id: "ORD-003",
          date: "2023-05-05",
          customer: "Robert Johnson",
          total: 199.5,
          status: "Shipped",
          items: 4,
        },
        {
          id: "ORD-004",
          date: "2023-05-07",
          customer: "Emily Davis",
          total: 49.99,
          status: "Pending",
          items: 1,
        },
        {
          id: "ORD-005",
          date: "2023-05-10",
          customer: "Michael Wilson",
          total: 159.75,
          status: "Cancelled",
          items: 3,
        },
      ]
      setOrders(sampleOrders)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredOrders =
    filter === "all" ? orders : orders.filter((order) => order.status.toLowerCase() === filter.toLowerCase())

  const handleViewOrder = (orderId) => {
    alert(`View order details for ${orderId}`)
  }

  if (loading) {
    return <div className="admin-orders loading">Loading orders...</div>
  }

  return (
    <div className="admin-orders">
      <div className="orders-header">
        <h1 className="orders-title">Orders</h1>
        <div className="orders-filter">
          <button className={`filter-button ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
            All
          </button>
          <button
            className={`filter-button ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>
          <button
            className={`filter-button ${filter === "processing" ? "active" : ""}`}
            onClick={() => setFilter("processing")}
          >
            Processing
          </button>
          <button
            className={`filter-button ${filter === "shipped" ? "active" : ""}`}
            onClick={() => setFilter("shipped")}
          >
            Shipped
          </button>
          <button
            className={`filter-button ${filter === "delivered" ? "active" : ""}`}
            onClick={() => setFilter("delivered")}
          >
            Delivered
          </button>
          <button
            className={`filter-button ${filter === "cancelled" ? "active" : ""}`}
            onClick={() => setFilter("cancelled")}
          >
            Cancelled
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="orders-table-container">
        {filteredOrders.length > 0 ? (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">{order.id}</td>
                  <td className="order-date">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="order-customer">{order.customer}</td>
                  <td className="order-total">${order.total.toFixed(2)}</td>
                  <td>
                    <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
                  </td>
                  <td>
                    <button className="view-button" onClick={() => handleViewOrder(order.id)}>
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
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-orders">
            <div className="empty-orders-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
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
            <h3 className="empty-orders-message">No orders found</h3>
            <p className="empty-orders-description">
              There are no orders matching your current filter. Try changing the filter or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOrders
