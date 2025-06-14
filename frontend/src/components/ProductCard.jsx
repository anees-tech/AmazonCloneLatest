"use client"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import "../styles/product-card.css"

const ProductCard = ({ product }) => {
  const navigate = useNavigate()
  const { addToCart, isInCart, getItemQuantity } = useCart()

  const handleCardClick = () => {
    navigate(`/product/${product._id || product.id}`)
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()

    console.log("ProductCard - Adding product to cart:", product)

    if (!product) {
      console.error("No product to add to cart")
      return
    }

    try {
      addToCart(product, 1)

      // Show success message
      const productName = product.name || "Product"
      alert(`✅ ${productName} added to cart!`)

      // Log for debugging
      console.log("Product added successfully:", product)
    } catch (error) {
      console.error("Error adding product to cart:", error)
      alert("❌ Failed to add product to cart. Please try again.")
    }
  }

  const productId = product._id || product.id
  const inCart = isInCart(productId)
  const cartQuantity = getItemQuantity(productId)

  return (
    <div className="product-card-wrapper">
      <div className="product-card" onClick={handleCardClick}>
        <div className="product-image-container">
          <img
            src={product.image || product.images?.[0] || "/api/placeholder/300/300"}
            alt={product.name}
            className="product-image"
          />
          {product.featured && (
            <div className="featured-badge">
              <span>⭐ Featured</span>
            </div>
          )}
          {product.discount && (
            <div className="discount-badge">
              <span>{product.discount}% OFF</span>
            </div>
          )}
          {inCart && (
            <div className="in-cart-badge">
              <span>🛒 In Cart ({cartQuantity})</span>
            </div>
          )}
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">
            {product.description
              ? product.description.length > 100
                ? `${product.description.substring(0, 100)}...`
                : product.description
              : "No description available"}
          </p>

          <div className="product-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`star ${i < (product.rating || 4) ? "filled" : ""}`}>
                  ⭐
                </span>
              ))}
            </div>
            <span className="rating-text">({product.rating || 4.0})</span>
          </div>

          <div className="product-price">
            <span className="current-price">${product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="original-price">${product.originalPrice}</span>
            )}
          </div>

          <div className="product-actions">
            <button className={`add-to-cart-btn ${inCart ? "in-cart" : ""}`} onClick={handleAddToCart}>
              {inCart ? `In Cart (${cartQuantity})` : "Add to Cart"}
            </button>
            <button className="view-details-btn">View Details</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
