"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import "./OrderSuccessPage.css"

const OrderSuccessPage = () => {
  const navigate = useNavigate()
  const [orderDetails, setOrderDetails] = useState(null)

  useEffect(() => {
    // Get order details from localStorage
    const lastOrder = localStorage.getItem("lastOrder")
    if (lastOrder) {
      setOrderDetails(JSON.parse(lastOrder))
      // Clear the stored order after displaying
      localStorage.removeItem("lastOrder")
    }
  }, [])

  return (
    <>
      <Navbar />
      <div className="order-success-page-wrapper">
        <div className="order-success-page">
          <div className="container">
            <div className="success-content">
              <div className="success-icon">✅</div>
              <h1>Order Placed Successfully!</h1>
              <p>Thank you for your purchase. Your order has been confirmed and will be processed soon.</p>

              {orderDetails && (
                <div className="order-details">
                  <h3>Order Details</h3>
                  <div className="order-summary">
                    <p>
                      <strong>Order Number:</strong> {orderDetails.orderNumber}
                    </p>
                    <p>
                      <strong>Total Amount:</strong> ${orderDetails.totalAmount?.toFixed(2)}
                    </p>
                    <p>
                      <strong>Items:</strong> {orderDetails.items?.length} item(s)
                    </p>
                    <p>
                      <strong>Payment Method:</strong> {orderDetails.paymentMethod}
                    </p>
                  </div>
                </div>
              )}

              <div className="order-details">
                <h3>What's Next?</h3>
                <ul>
                  <li>📧 You'll receive an email confirmation shortly</li>
                  <li>📦 Your items will be packed and shipped within 24 hours</li>
                  <li>🚚 Track your order status in your account</li>
                </ul>
              </div>
              <div className="action-buttons">
                <button className="continue-shopping-btn" onClick={() => navigate("/products")}>
                  Continue Shopping
                </button>
                <button className="go-home-btn" onClick={() => navigate("/")}>
                  Go to Homepage
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default OrderSuccessPage
