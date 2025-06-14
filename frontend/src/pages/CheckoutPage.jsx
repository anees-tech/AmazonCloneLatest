"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import "./CheckoutPage.css"

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { items, getTotalItems, getTotalPrice, clearCart } = useCart()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    // Shipping Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",

    // Payment Information
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",

    // Order Notes
    notes: "",
  })

  const [paymentMethod, setPaymentMethod] = useState("card")
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      // Store the current path so user can return after login
      localStorage.setItem('redirectAfterLogin', '/checkout')
      navigate('/login')
    }
  }, [user, navigate])

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.name || "",
        lastName: user.lastName || "",
        email: user.email || "",
      }))
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Double check user is still logged in
      if (!user || !user._id) {
        alert("Please login first to place an order")
        navigate("/login")
        return
      }

      // Generate a unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      // Prepare order data
      const orderData = {
        orderNumber: orderNumber,
        items: items.map((item) => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        paymentMethod: paymentMethod,
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalAmount: total,
        notes: formData.notes,
      }

      // Create order via API
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-ID": user._id,
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (result.success) {
        // Clear cart after successful order
        clearCart()

        // Store order details for success page
        localStorage.setItem("lastOrder", JSON.stringify(result.order))

        // Redirect to success page
        navigate("/order-success")
      } else {
        throw new Error(result.message || "Order creation failed")
      }
    } catch (error) {
      console.error("Order failed:", error)
      alert("Order failed: " + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const subtotal = getTotalPrice()
  const tax = subtotal * 0.08
  const shipping = 0 // Free shipping
  const total = subtotal + tax + shipping

  // Show loading state while checking authentication
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="checkout-page">
          <div className="container">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Checking authentication...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="checkout-page">
          <div className="container">
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h2>Your Cart is Empty</h2>
              <p>You need items in your cart to checkout.</p>
              <button className="continue-shopping-btn" onClick={() => navigate("/products")}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="checkout-page">
        <div className="container">
          <div className="checkout-header">
            <h1>Checkout</h1>
            <div className="user-info">
              <p>Logged in as: <strong>{user.email}</strong></p>
            </div>
            <div className="checkout-steps">
              <div className="step active">
                <span className="step-number">1</span>
                <span className="step-text">Shipping</span>
              </div>
              <div className="step active">
                <span className="step-number">2</span>
                <span className="step-text">Payment</span>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <span className="step-text">Review</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="checkout-content">
              {/* Left Column - Forms */}
              <div className="checkout-forms">
                {/* Shipping Information */}
                <div className="form-section">
                  <h2>Shipping Information</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Email Address *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group full-width">
                      <label>Phone Number *</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group full-width">
                      <label>Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>City *</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                      <label>State *</label>
                      <input type="text" name="state" value={formData.state} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                      <label>ZIP Code *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Country *</label>
                      <select name="country" value={formData.country} onChange={handleInputChange} required>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="form-section">
                  <h2>Payment Information</h2>

                  <div className="payment-methods">
                    <label className="payment-method">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="payment-method-text">
                        <span className="payment-icon">💳</span>
                        Credit/Debit Card
                      </span>
                    </label>
                    <label className="payment-method">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentMethod === "paypal"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="payment-method-text">
                        <span className="payment-icon">🅿️</span>
                        PayPal
                      </span>
                    </label>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label>Card Number *</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Expiry Date *</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>CVV *</label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          required
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Name on Card *</label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Notes */}
                <div className="form-section">
                  <h2>Order Notes (Optional)</h2>
                  <div className="form-group full-width">
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Any special instructions for your order..."
                      rows="4"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="order-summary">
                <div className="summary-card">
                  <h3>Order Summary</h3>

                  <div className="order-items">
                    {items.map((item) => (
                      <div key={item._id} className="order-item">
                        <img src={item.image || item.images?.[0] || "/api/placeholder/60/60"} alt={item.name} />
                        <div className="item-info">
                          <h4>{item.name}</h4>
                          <p>Qty: {item.quantity}</p>
                        </div>
                        <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="summary-totals">
                    <div className="summary-row">
                      <span>Subtotal ({getTotalItems()} items):</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping:</span>
                      <span>FREE</span>
                    </div>
                    <div className="summary-row">
                      <span>Tax:</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button type="submit" className="place-order-btn" disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <span className="processing-spinner"></span>
                        Processing...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </button>

                  <div className="security-info">
                    <div className="security-icon">🔒</div>
                    <p>Your payment information is secure and encrypted</p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default CheckoutPage
