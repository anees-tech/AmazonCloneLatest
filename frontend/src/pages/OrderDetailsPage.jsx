import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/orderDetails.css";

function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchOrderDetails();
  }, [orderId, user, navigate]);

  const fetchOrderDetails = async () => {
    try {
      const response = await API.get(`/auth/order/${orderId}/${user._id}`);
      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        setError("Order not found");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "status-pending",
      processing: "status-processing",
      shipped: "status-shipped",
      delivered: "status-delivered",
      cancelled: "status-cancelled"
    };
    return `status-badge ${statusClasses[status] || "status-pending"}`;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: "⏳",
      processing: "📦",
      shipped: "🚚",
      delivered: "✅",
      cancelled: "❌"
    };
    return icons[status] || "⏳";
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="order-details-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading order details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <div className="order-details-container">
          <div className="error-state">
            <div className="error-icon">❌</div>
            <h2>Order Not Found</h2>
            <p>{error || "The order you're looking for doesn't exist."}</p>
            <button onClick={() => navigate("/dashboard")} className="btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="order-details-container">
        <div className="container">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <button onClick={() => navigate("/dashboard")} className="breadcrumb-link">
              Dashboard
            </button>
            <span className="breadcrumb-separator">›</span>
            <button onClick={() => navigate("/dashboard")} className="breadcrumb-link">
              My Orders
            </button>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">Order #{order.orderNumber}</span>
          </div>

          {/* Order Header */}
          <div className="order-header">
            <div className="order-title">
              <h1>Order #{order.orderNumber}</h1>
              <span className={getStatusBadge(order.status)}>
                {getStatusIcon(order.status)} {order.status.toUpperCase()}
              </span>
            </div>
            <div className="order-meta">
              <p>Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p>Total: <strong>${order.totalAmount.toFixed(2)}</strong></p>
            </div>
          </div>

          {/* Order Status Timeline */}
          <div className="status-timeline">
            <div className="timeline-item">
              <div className={`timeline-dot ${['pending', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                ⏳
              </div>
              <div className="timeline-content">
                <h4>Order Placed</h4>
                <p>{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className={`timeline-dot ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                📦
              </div>
              <div className="timeline-content">
                <h4>Processing</h4>
                <p>{order.status === 'processing' ? 'In progress' : order.status === 'pending' ? 'Pending' : 'Completed'}</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className={`timeline-dot ${['shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                🚚
              </div>
              <div className="timeline-content">
                <h4>Shipped</h4>
                <p>{order.status === 'shipped' ? 'In transit' : order.status === 'delivered' ? 'Completed' : 'Pending'}</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className={`timeline-dot ${order.status === 'delivered' ? 'completed' : ''}`}>
                ✅
              </div>
              <div className="timeline-content">
                <h4>Delivered</h4>
                <p>{order.status === 'delivered' ? 'Completed' : 'Pending'}</p>
              </div>
            </div>
          </div>

          <div className="order-content">
            {/* Order Items */}
            <div className="order-section">
              <h2>Order Items ({order.items.length})</h2>
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-image">
                      <img src={item.image || "/api/placeholder/80/80"} alt={item.name} />
                    </div>
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p className="item-price">${item.price.toFixed(2)} each</p>
                      <p className="item-quantity">Quantity: {item.quantity}</p>
                    </div>
                    <div className="item-total">
                      <span className="total-price">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="order-section">
              <h2>Order Summary</h2>
              <div className="order-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${order.itemsPrice.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span>${order.shippingPrice.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax:</span>
                  <span>${order.taxPrice.toFixed(2)}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="order-section">
              <h2>Shipping Information</h2>
              <div className="shipping-info">
                <div className="info-group">
                  <h4>Shipping Address</h4>
                  <div className="address">
                    <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
                <div className="info-group">
                  <h4>Contact Information</h4>
                  <p>Email: {order.shippingAddress.email}</p>
                  <p>Phone: {order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="order-section">
              <h2>Payment Information</h2>
              <div className="payment-info">
                <div className="payment-method">
                  <span className="payment-icon">
                    {order.paymentMethod === 'card' ? '💳' : '🅿️'}
                  </span>
                  <span>
                    {order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'PayPal'}
                  </span>
                  <span className="payment-status success">✅ Paid</span>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="order-section">
                <h2>Order Notes</h2>
                <div className="order-notes">
                  <p>{order.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="order-actions">
            <button onClick={() => navigate("/dashboard")} className="btn-secondary">
              Back to Orders
            </button>
            {order.status === 'delivered' && (
              <button 
                onClick={() => navigate("/dashboard")} 
                className="btn-primary"
              >
                Write Reviews
              </button>
            )}
            <button onClick={() => window.print()} className="btn-outline">
              Print Order
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default OrderDetailsPage;