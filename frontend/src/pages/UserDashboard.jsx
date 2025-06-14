import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ReviewModal from "../components/ReviewModal";
import "../styles/dashboard.css";

function UserDashboard() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [reviewableItems, setReviewableItems] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [profileData, setProfileData] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States"
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchUserData();
    fetchOrders();
    fetchReviewableItems();
    fetchUserReviews();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      const response = await API.get(`/auth/profile/${user._id}`);
      if (response.data.success) {
        setProfileData(response.data.user);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await API.get(`/auth/orders/${user._id}`);
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewableItems = async () => {
    try {
      const response = await API.get(`/reviews/user/${user._id}/reviewable`);
      if (response.data.success) {
        setReviewableItems(response.data.reviewableItems);
      }
    } catch (error) {
      console.error("Error fetching reviewable items:", error);
    }
  };

  const fetchUserReviews = async () => {
    try {
      const response = await API.get(`/reviews/user/${user._id}`);
      if (response.data.success) {
        setUserReviews(response.data.reviews);
      }
    } catch (error) {
      console.error("Error fetching user reviews:", error);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const response = await API.post('/reviews', {
        userId: user._id,
        ...reviewData
      });

      if (response.data.success) {
        setMessage('Review submitted successfully!');
        setTimeout(() => setMessage(""), 3000);
        
        // Refresh reviewable items and user reviews
        await fetchReviewableItems();
        await fetchUserReviews();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit review');
      setTimeout(() => setError(""), 3000);
    }
  };

  const openReviewModal = (product) => {
    setSelectedProduct(product);
    setShowReviewModal(true);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setMessage("");

    try {
      const response = await API.put(`/auth/profile/${user._id}`, profileData);
      if (response.data.success) {
        setMessage("Profile updated successfully!");
        login(response.data.user);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile");
      setTimeout(() => setError(""), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setMessage("");

    try {
      const response = await API.put(`/auth/change-password/${user._id}`, passwordData);
      if (response.data.success) {
        setMessage("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to change password");
      setTimeout(() => setError(""), 3000);
    } finally {
      setUpdating(false);
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

  const renderStars = (rating) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`star ${star <= rating ? 'filled' : ''}`}>
            ⭐
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>My Dashboard</h1>
          <p>Welcome back, {user.name}!</p>
        </div>

        <div className="dashboard-content">
          {/* Sidebar Navigation */}
          <div className="dashboard-sidebar">
            <nav className="dashboard-nav">
              <button
                className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                <span className="nav-icon">📊</span>
                Overview
              </button>
              <button
                className={`nav-item ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                <span className="nav-icon">📦</span>
                My Orders
              </button>
              <button
                className={`nav-item ${activeTab === "reviews" ? "active" : ""}`}
                onClick={() => setActiveTab("reviews")}
              >
                <span className="nav-icon">⭐</span>
                Reviews
                {reviewableItems.length > 0 && (
                  <span className="notification-badge">{reviewableItems.length}</span>
                )}
              </button>
              <button
                className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <span className="nav-icon">👤</span>
                Profile
              </button>
              <button
                className={`nav-item ${activeTab === "password" ? "active" : ""}`}
                onClick={() => setActiveTab("password")}
              >
                <span className="nav-icon">🔒</span>
                Change Password
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="dashboard-main">
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="overview-content">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                      <h3>{orders.length}</h3>
                      <p>Total Orders</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-info">
                      <h3>{orders.filter(order => order.status === "pending").length}</h3>
                      <p>Pending Orders</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                      <h3>{orders.filter(order => order.status === "delivered").length}</h3>
                      <p>Delivered Orders</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-info">
                      <h3>{userReviews.length}</h3>
                      <p>Reviews Written</p>
                    </div>
                  </div>
                </div>

                <div className="recent-orders">
                  <h2>Recent Orders</h2>
                  {orders.slice(0, 3).map(order => (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <span className="order-number">#{order.orderNumber}</span>
                        <span className={getStatusBadge(order.status)}>{order.status}</span>
                      </div>
                      <div className="order-details">
                        <p>{order.items.length} items • ${order.totalAmount.toFixed(2)}</p>
                        <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="orders-content">
                <h2>My Orders</h2>
                {orders.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3>No Orders Yet</h3>
                    <p>You haven't placed any orders yet.</p>
                    <button onClick={() => navigate("/products")} className="btn-primary">
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map(order => (
                      <div key={order._id} className="order-item">
                        <div className="order-main-info">
                          <div className="order-id">
                            <h3>#{order.orderNumber}</h3>
                            <span className={getStatusBadge(order.status)}>{order.status}</span>
                          </div>
                          <div className="order-meta">
                            <p>Ordered on {new Date(order.createdAt).toLocaleDateString()}</p>
                            <p>{order.items.length} items • ${order.totalAmount.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="order-items-preview">
                          {order.items.slice(0, 3).map((item, index) => (
                            <img 
                              key={index}
                              src={item.image || "/api/placeholder/40/40"} 
                              alt={item.name}
                              className="item-thumbnail"
                            />
                          ))}
                          {order.items.length > 3 && (
                            <span className="more-items">+{order.items.length - 3} more</span>
                          )}
                        </div>
                        <div className="order-actions">
                          <button 
                            onClick={() => navigate(`/order/${order._id}`)}
                            className="btn-secondary"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="reviews-content">
                <h2>Product Reviews</h2>
                
                {/* Reviewable Products */}
                {reviewableItems.length > 0 && (
                  <div className="reviewable-section">
                    <h3>Products Available for Review</h3>
                    <div className="reviewable-items">
                      {reviewableItems.map((item, index) => (
                        <div key={index} className="reviewable-item">
                          <img src={item.productImage} alt={item.productName} />
                          <div className="item-info">
                            <h4>{item.productName}</h4>
                            <p>Order #{item.orderNumber}</p>
                            <p>Delivered on {new Date(item.orderDate).toLocaleDateString()}</p>
                          </div>
                          <button 
                            onClick={() => openReviewModal(item)}
                            className="review-btn"
                          >
                            Write Review
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* User's Reviews */}
                <div className="user-reviews-section">
                  <h3>Your Reviews ({userReviews.length})</h3>
                  {userReviews.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">⭐</div>
                      <h3>No Reviews Yet</h3>
                      <p>You haven't written any reviews yet.</p>
                    </div>
                  ) : (
                    <div className="user-reviews-list">
                      {userReviews.map((review) => (
                        <div key={review._id} className="review-item">
                          <div className="review-product">
                            <img src={review.product.image} alt={review.product.name} />
                            <div>
                              <h4>{review.product.name}</h4>
                              <p>Order #{review.order.orderNumber}</p>
                            </div>
                          </div>
                          <div className="review-content">
                            <div className="review-header">
                              {renderStars(review.rating)}
                              <span className="review-date">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h5>{review.title}</h5>
                            <p>{review.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="profile-content">
                <h2>Profile Information</h2>
                <form onSubmit={handleProfileUpdate} className="profile-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Address</label>
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        value={profileData.city}
                        onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        value={profileData.state}
                        onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>ZIP Code</label>
                      <input
                        type="text"
                        value={profileData.zipCode}
                        onChange={(e) => setProfileData({...profileData, zipCode: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <select
                        value={profileData.country}
                        onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" disabled={updating}>
                    {updating ? "Updating..." : "Update Profile"}
                  </button>
                </form>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <div className="password-content">
                <h2>Change Password</h2>
                <form onSubmit={handlePasswordChange} className="password-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary" disabled={updating}>
                    {updating ? "Changing..." : "Change Password"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedProduct && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          product={selectedProduct}
          onSubmit={handleReviewSubmit}
        />
      )}

      <Footer />
    </>
  );
}

export default UserDashboard;