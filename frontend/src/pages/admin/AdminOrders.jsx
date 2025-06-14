"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { adminAPI } from "../../api/axios"
import "../../styles/admin/adminOrders.css"

function AdminOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderModal, setShowOrderModal] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await adminAPI.get("/orders")
        setOrders(response.data.orders || [])
      } catch (err) {
        setError("Failed to load orders")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (user && user._id) {
      fetchOrders()
    }
  }, [user])

  const filteredOrders =
    filter === "all" ? orders : orders.filter((order) => order.status.toLowerCase() === filter.toLowerCase())

  const handleViewOrder = async (orderId) => {
    try {
      const response = await adminAPI.get(`/orders/${orderId}`)
      setSelectedOrder(response.data.order)
      setShowOrderModal(true)
    } catch (err) {
      setError("Failed to load order details")
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await adminAPI.put(`/orders/${orderId}`, { status: newStatus })
      setOrders(orders.map((order) => (order._id === orderId ? response.data.order : order)))
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(response.data.order)
      }
    } catch (err) {
      setError("Failed to update order status")
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return
    }

    try {
      await adminAPI.delete(`/orders/${orderId}`)
      setOrders(orders.filter((order) => order._id !== orderId))
      if (selectedOrder && selectedOrder._id === orderId) {
        setShowOrderModal(false)
        setSelectedOrder(null)
      }
    } catch (err) {
      setError("Failed to delete order")
    }
  }

  if (loading) {
    return <div className="admin-orders-wrapper loading">Loading orders...</div>
  }

  return (
    <div className="admin-orders-wrapper">
      <div className="admin-orders">
        <div className="orders-header">
          <h1 className="orders-title">Orders Management</h1>
          <div className="orders-filter">
            <button className={`filter-button ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
              All ({orders.length})
            </button>
            <button
              className={`filter-button ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pending ({orders.filter((o) => o.status === "Pending").length})
            </button>
            <button
              className={`filter-button ${filter === "processing" ? "active" : ""}`}
              onClick={() => setFilter("processing")}
            >
              Processing ({orders.filter((o) => o.status === "Processing").length})
            </button>
            <button
              className={`filter-button ${filter === "shipped" ? "active" : ""}`}
              onClick={() => setFilter("shipped")}
            >
              Shipped ({orders.filter((o) => o.status === "Shipped").length})
            </button>
            <button
              className={`filter-button ${filter === "delivered" ? "active" : ""}`}
              onClick={() => setFilter("delivered")}
            >
              Delivered ({orders.filter((o) => o.status === "Delivered").length})
            </button>
            <button
              className={`filter-button ${filter === "cancelled" ? "active" : ""}`}
              onClick={() => setFilter("cancelled")}
            >
              Cancelled ({orders.filter((o) => o.status === "Cancelled").length})
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

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
                    <td className="order-id">{order.orderNumber}</td>
                    <td className="order-date">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="order-customer">
                      {order.user?.name || "Unknown"}
                      <br />
                      <small>{order.user?.email}</small>
                    </td>
                    <td>{order.items?.length || 0} items</td>
                    <td className="order-total">${order.totalAmount?.toFixed(2)}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        className={`order-status-select ${order.status.toLowerCase()}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <span className={`payment-status ${order.isPaid ? "paid" : "unpaid"}`}>
                        {order.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="view-button" onClick={() => handleViewOrder(order._id)}>
                          View
                        </button>
                        <button className="delete-button" onClick={() => handleDeleteOrder(order._id)}>
                          Delete
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
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="order-modal-overlay" onClick={() => setShowOrderModal(false)}>
            <div className="order-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Order Details - {selectedOrder.orderNumber}</h2>
                <button className="close-button" onClick={() => setShowOrderModal(false)}>
                  ×
                </button>
              </div>

              <div className="modal-content">
                <div className="order-info-grid">
                  <div className="order-section">
                    <h3>Customer Information</h3>
                    <p>
                      <strong>Name:</strong> {selectedOrder.shippingAddress?.firstName}{" "}
                      {selectedOrder.shippingAddress?.lastName}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedOrder.shippingAddress?.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}
                    </p>
                  </div>

                  <div className="order-section">
                    <h3>Shipping Address</h3>
                    <p>{selectedOrder.shippingAddress?.address}</p>
                    <p>
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}{" "}
                      {selectedOrder.shippingAddress?.zipCode}
                    </p>
                    <p>{selectedOrder.shippingAddress?.country}</p>
                  </div>

                  <div className="order-section">
                    <h3>Order Summary</h3>
                    <p>
                      <strong>Items Price:</strong> ${selectedOrder.itemsPrice?.toFixed(2)}
                    </p>
                    <p>
                      <strong>Tax:</strong> ${selectedOrder.taxPrice?.toFixed(2)}
                    </p>
                    <p>
                      <strong>Shipping:</strong> ${selectedOrder.shippingPrice?.toFixed(2)}
                    </p>
                    <p>
                      <strong>Total:</strong> ${selectedOrder.totalAmount?.toFixed(2)}
                    </p>
                  </div>

                  <div className="order-section">
                    <h3>Payment & Status</h3>
                    <p>
                      <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
                    </p>
                    <p>
                      <strong>Payment Status:</strong> {selectedOrder.isPaid ? "Paid" : "Unpaid"}
                    </p>
                    <p>
                      <strong>Order Status:</strong> {selectedOrder.status}
                    </p>
                    <p>
                      <strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="order-items">
                  <h3>Order Items</h3>
                  <div className="items-list">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="order-item">
                        <img src={item.image || "/placeholder.svg"} alt={item.name} className="item-image" />
                        <div className="item-details">
                          <h4>{item.name}</h4>
                          <p>Quantity: {item.quantity}</p>
                          <p>Price: ${item.price}</p>
                          <p>Total: ${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="order-section">
                    <h3>Order Notes</h3>
                    <p>{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOrders
