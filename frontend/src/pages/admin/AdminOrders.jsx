"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { adminAPI } from "../../api/adminApi"
import "../../styles/admin/adminOrders.css"

function AdminOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [filter, setFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderStats, setOrderStats] = useState({})

  useEffect(() => {
    fetchOrders()
    fetchOrderStats()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await adminAPI.getOrders()
      if (response.data.success) {
        setOrders(response.data.orders || [])
      } else {
        setError("Failed to load orders")
      }
    } catch (err) {
      setError("Failed to load orders: " + (err.response?.data?.message || err.message))
      console.error("Error fetching orders:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderStats = async () => {
    try {
      const response = await adminAPI.getOrderStats()
      if (response.data.success) {
        setOrderStats(response.data.stats)
      }
    } catch (err) {
      console.error("Error fetching order stats:", err)
    }
  }

  const filteredOrders =
    filter === "all" ? orders : orders.filter((order) => order.status.toLowerCase() === filter.toLowerCase())

  const handleViewOrder = async (orderId) => {
    try {
      const response = await adminAPI.getOrder(orderId)
      if (response.data.success) {
        setSelectedOrder(response.data.order)
        setShowOrderModal(true)
      } else {
        setError("Failed to load order details")
      }
    } catch (err) {
      setError("Failed to load order details: " + (err.response?.data?.message || err.message))
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setError("")
      setSuccess("")

      const response = await adminAPI.updateOrderStatus(orderId, { status: newStatus })

      if (response.data.success) {
        setOrders(orders.map((order) => (order._id === orderId ? response.data.order : order)))

        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(response.data.order)
        }

        setSuccess(`Order status updated to ${newStatus}`)
        fetchOrderStats()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError("Failed to update order status")
      }
    } catch (err) {
      setError("Failed to update order status: " + (err.response?.data?.message || err.message))
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      return
    }

    try {
      setError("")
      setSuccess("")

      const response = await adminAPI.deleteOrder(orderId)

      if (response.data.success) {
        setOrders(orders.filter((order) => order._id !== orderId))

        if (selectedOrder && selectedOrder._id === orderId) {
          setShowOrderModal(false)
          setSelectedOrder(null)
        }

        setSuccess("Order deleted successfully")
        fetchOrderStats()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError("Failed to delete order")
      }
    } catch (err) {
      setError("Failed to delete order: " + (err.response?.data?.message || err.message))
    }
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "status-pending",
      processing: "status-processing",
      shipped: "status-shipped",
      delivered: "status-delivered",
      cancelled: "status-cancelled",
    }
    return `status-badge ${statusClasses[status] || "status-pending"}`
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0)
  }

  if (loading) {
    return (
      <div className="admin-orders-wrapper">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-orders-wrapper">
      <div className="admin-orders">
        {/* Orders Header with Stats */}
        <div className="orders-header">
          <div className="header-content">
            <h1 className="orders-title">Orders Management</h1>
            <button className="refresh-btn" onClick={fetchOrders} disabled={loading}>
              🔄 Refresh
            </button>
          </div>

          {/* Order Stats */}
          <div className="order-stats">
            <div className="stat-card">
              <div className="stat-number">{orderStats.totalOrders || 0}</div>
              <div className="stat-label">Total Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{orderStats.pendingOrders || 0}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{orderStats.processingOrders || 0}</div>
              <div className="stat-label">Processing</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{orderStats.deliveredOrders || 0}</div>
              <div className="stat-label">Delivered</div>
            </div>
            <div className="stat-card revenue">
              <div className="stat-number">{formatCurrency(orderStats.totalRevenue)}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Filter Buttons */}
        <div className="orders-filter">
          <button className={`filter-button ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
            All ({orders.length})
          </button>
          <button
            className={`filter-button ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending ({orders.filter((o) => o.status === "pending").length})
          </button>
          <button
            className={`filter-button ${filter === "processing" ? "active" : ""}`}
            onClick={() => setFilter("processing")}
          >
            Processing ({orders.filter((o) => o.status === "processing").length})
          </button>
          <button
            className={`filter-button ${filter === "shipped" ? "active" : ""}`}
            onClick={() => setFilter("shipped")}
          >
            Shipped ({orders.filter((o) => o.status === "shipped").length})
          </button>
          <button
            className={`filter-button ${filter === "delivered" ? "active" : ""}`}
            onClick={() => setFilter("delivered")}
          >
            Delivered ({orders.filter((o) => o.status === "delivered").length})
          </button>
          <button
            className={`filter-button ${filter === "cancelled" ? "active" : ""}`}
            onClick={() => setFilter("cancelled")}
          >
            Cancelled ({orders.filter((o) => o.status === "cancelled").length})
          </button>
        </div>

        {/* Orders Table */}
        <div className="orders-table-container">
          {filteredOrders.length > 0 ? (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="order-id">
                      <strong>{order.orderNumber}</strong>
                    </td>
                    <td className="order-date">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      <br />
                      <small>
                        {new Date(order.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    </td>
                    <td className="order-customer">
                      <div className="customer-info">
                        <strong>
                          {order.user?.name || "Unknown"} {order.user?.lastName || ""}
                        </strong>
                        <br />
                        <small>{order.user?.email || "No email"}</small>
                      </div>
                    </td>
                    <td className="order-items">
                      <span className="items-count">{order.items?.length || 0} items</span>
                      <div className="items-preview">
                        {order.items?.slice(0, 2).map((item, idx) => (
                          <img
                            key={idx}
                            src={item.image || "/placeholder.svg?height=30&width=30"}
                            alt={item.name}
                            className="item-thumbnail"
                          />
                        ))}
                        {order.items?.length > 2 && <span className="more-items">+{order.items.length - 2}</span>}
                      </div>
                    </td>
                    <td className="order-total">
                      <strong>{formatCurrency(order.totalAmount)}</strong>
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        className={`order-status-select ${order.status}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <span className={`payment-status ${order.isPaid ? "paid" : "unpaid"}`}>
                        {order.isPaid ? "✅ Paid" : "❌ Unpaid"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="view-button" onClick={() => handleViewOrder(order._id)} title="View Details">
                          👁️ View
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteOrder(order._id)}
                          title="Delete Order"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-orders">
              <div className="empty-orders-icon">📦</div>
              <h3 className="empty-orders-message">No orders found</h3>
              <p className="empty-orders-description">
                {filter === "all" ? "No orders have been placed yet." : `No orders with status "${filter}" found.`}
              </p>
              <button onClick={fetchOrders} className="refresh-btn">
                🔄 Refresh Orders
              </button>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="order-modal-overlay" onClick={() => setShowOrderModal(false)}>
            <div className="order-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Order Details - {selectedOrder.orderNumber}</h2>
                <div className="modal-header-actions">
                  <span className={getStatusBadge(selectedOrder.status)}>{selectedOrder.status.toUpperCase()}</span>
                  <button className="close-button" onClick={() => setShowOrderModal(false)}>
                    ×
                  </button>
                </div>
              </div>

              <div className="modal-content">
                <div className="order-info-grid">
                  <div className="order-section">
                    <h3>📋 Order Information</h3>
                    <div className="info-item">
                      <strong>Order Number:</strong> {selectedOrder.orderNumber}
                    </div>
                    <div className="info-item">
                      <strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}
                    </div>
                    <div className="info-item">
                      <strong>Status:</strong>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => handleUpdateOrderStatus(selectedOrder._id, e.target.value)}
                        className={`status-select ${selectedOrder.status}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="order-section">
                    <h3>👤 Customer Information</h3>
                    <div className="info-item">
                      <strong>Name:</strong> {selectedOrder.shippingAddress?.firstName}{" "}
                      {selectedOrder.shippingAddress?.lastName}
                    </div>
                    <div className="info-item">
                      <strong>Email:</strong> {selectedOrder.shippingAddress?.email}
                    </div>
                    <div className="info-item">
                      <strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}
                    </div>
                  </div>

                  <div className="order-section">
                    <h3>🚚 Shipping Address</h3>
                    <div className="address-info">
                      <p>{selectedOrder.shippingAddress?.address}</p>
                      <p>
                        {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}{" "}
                        {selectedOrder.shippingAddress?.zipCode}
                      </p>
                      <p>{selectedOrder.shippingAddress?.country}</p>
                    </div>
                  </div>

                  <div className="order-section">
                    <h3>💰 Order Summary</h3>
                    <div className="summary-details">
                      <div className="summary-row">
                        <span>Items Price:</span>
                        <span>{formatCurrency(selectedOrder.itemsPrice)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Tax:</span>
                        <span>{formatCurrency(selectedOrder.taxPrice)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Shipping:</span>
                        <span>{formatCurrency(selectedOrder.shippingPrice)}</span>
                      </div>
                      <div className="summary-row total">
                        <span>
                          <strong>Total:</strong>
                        </span>
                        <span>
                          <strong>{formatCurrency(selectedOrder.totalAmount)}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="order-section">
                    <h3>💳 Payment Information</h3>
                    <div className="info-item">
                      <strong>Payment Method:</strong>
                      <span className="payment-method">
                        {selectedOrder.paymentMethod === "card" ? "💳 Credit Card" : "🅿️ PayPal"}
                      </span>
                    </div>
                    <div className="info-item">
                      <strong>Payment Status:</strong>
                      <span className={`payment-status ${selectedOrder.isPaid ? "paid" : "unpaid"}`}>
                        {selectedOrder.isPaid ? "✅ Paid" : "❌ Unpaid"}
                      </span>
                    </div>
                    {selectedOrder.paidAt && (
                      <div className="info-item">
                        <strong>Paid At:</strong> {new Date(selectedOrder.paidAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="order-items-section">
                  <h3>📦 Order Items ({selectedOrder.items?.length || 0})</h3>
                  <div className="items-list">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="order-item-card">
                        <img
                          src={item.image || "/placeholder.svg?height=60&width=60"}
                          alt={item.name}
                          className="item-image"
                        />
                        <div className="item-details">
                          <h4>{item.name}</h4>
                          <div className="item-meta">
                            <span className="quantity">Qty: {item.quantity}</span>
                            <span className="price">Price: {formatCurrency(item.price)}</span>
                            <span className="total">Total: {formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="order-section">
                    <h3>📝 Order Notes</h3>
                    <div className="notes-content">
                      <p>{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowOrderModal(false)}>
                  Close
                </button>
                <button
                  className="btn-danger"
                  onClick={() => {
                    setShowOrderModal(false)
                    handleDeleteOrder(selectedOrder._id)
                  }}
                >
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOrders
