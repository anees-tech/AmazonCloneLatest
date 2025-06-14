import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './CartPage.css'

const CartPage = () => {
  const navigate = useNavigate()
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalItems, 
    getTotalPrice 
  } = useCart()

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return
    updateQuantity(productId, newQuantity)
  }

  const handleRemoveItem = (productId) => {
    removeFromCart(productId)
  }

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart()
    }
  }

  const handleCheckout = () => {
    navigate('/checkout')
  }

  const handleContinueShopping = () => {
    navigate('/products')
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="cart-page">
          <div className="container">
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h2>Your Cart is Empty</h2>
              <p>Looks like you haven't added any items to your cart yet.</p>
              <button 
                className="continue-shopping-btn"
                onClick={handleContinueShopping}
              >
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
      <div className="cart-page">
        <div className="container">
          {/* Cart Header */}
          <div className="cart-header">
            <h1>Shopping Cart</h1>
            <div className="cart-actions">
              <button 
                className="clear-cart-btn"
                onClick={handleClearCart}
              >
                Clear Cart
              </button>
              <button 
                className="continue-shopping-btn"
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </button>
            </div>
          </div>

          <div className="cart-content">
            {/* Cart Items */}
            <div className="cart-items">
              <div className="cart-items-header">
                <h3>Items ({getTotalItems()})</h3>
              </div>

              {items.map((item) => (
                <div key={item._id} className="cart-item">
                  <div className="item-image">
                    <img 
                      src={item.image || item.images?.[0] || '/api/placeholder/150/150'} 
                      alt={item.name}
                      onClick={() => navigate(`/product/${item._id}`)}
                    />
                  </div>

                  <div className="item-details">
                    <h4 
                      className="item-name"
                      onClick={() => navigate(`/product/${item._id}`)}
                    >
                      {item.name}
                    </h4>
                    <p className="item-category">
                      Category: {item.category?.name || 'General'}
                    </p>
                    <div className="item-price">
                      <span className="current-price">${item.price}</span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="original-price">${item.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  <div className="item-quantity">
                    <label>Quantity:</label>
                    <div className="quantity-controls">
                      <button 
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button 
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="item-total">
                    <span className="total-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <div className="item-actions">
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item._id)}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="cart-summary">
              <div className="summary-card">
                <h3>Order Summary</h3>
                
                <div className="summary-row">
                  <span>Items ({getTotalItems()}):</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span>FREE</span>
                </div>
                
                <div className="summary-row">
                  <span>Tax:</span>
                  <span>${(getTotalPrice() * 0.08).toFixed(2)}</span>
                </div>
                
                <div className="summary-divider"></div>
                
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>${(getTotalPrice() + (getTotalPrice() * 0.08)).toFixed(2)}</span>
                </div>

                <button 
                  className="checkout-btn"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </button>

                <div className="payment-methods">
                  <p>We accept:</p>
                  <div className="payment-icons">
                    <span>💳</span>
                    <span>🏦</span>
                    <span>📱</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default CartPage