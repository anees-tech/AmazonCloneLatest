import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProductById } from '../api/productApi'
import { useCart } from '../context/CartContext'
import API from '../api/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './ProductDetailsPage.css'

const ProductDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, isInCart, getItemQuantity } = useCart()
  
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, averageRating: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const productData = await getProductById(id)
        console.log('Product fetched:', productData)
        setProduct(productData)
        
        // Fetch reviews
        await fetchReviews(id)
      } catch (err) {
        console.error('Error fetching product:', err)
        setError('Failed to load product details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchReviews = async (productId) => {
    try {
      const response = await API.get(`/reviews/product/${productId}`)
      if (response.data.success) {
        setReviews(response.data.reviews)
        setReviewStats({
          totalReviews: response.data.totalReviews,
          averageRating: response.data.averageRating
        })
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="pdp-rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`pdp-star ${star <= rating ? 'pdp-star-filled' : ''}`}>
            ⭐
          </span>
        ))}
      </div>
    )
  }

  const handleQuantityChange = (type) => {
    if (type === 'increment') {
      setQuantity(prev => prev + 1)
    } else if (type === 'decrement' && quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  const handleAddToCart = () => {
    if (!product) {
      console.error('No product to add to cart')
      return
    }

    try {
      console.log('Adding product to cart:', product, 'Quantity:', quantity)
      addToCart(product, quantity)
      alert(`✅ Added ${quantity} ${product.name}(s) to cart!`)
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('❌ Failed to add to cart. Please try again.')
    }
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate('/cart')
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pdp-loading-wrapper">
          <div className="pdp-loading-content">
            <div className="pdp-loading-spinner"></div>
            <h2>Loading Product Details...</h2>
            <p>Please wait while we fetch the product information</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="pdp-error-wrapper">
          <div className="pdp-error-content">
            <div className="pdp-error-icon">❌</div>
            <h2>Product Not Found</h2>
            <p>{error || 'The product you are looking for does not exist'}</p>
            <button 
              className="pdp-back-btn"
              onClick={() => navigate('/products')}
            >
              Back to Products
            </button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image || '/api/placeholder/400/400']

  const productId = product._id || product.id
  const inCart = isInCart(productId)
  const cartQuantity = getItemQuantity(productId)

  return (
    <>
      <Navbar />
      <div className="pdp-main-wrapper">
        {/* Breadcrumb */}
        <div className="pdp-breadcrumb">
          <div className="pdp-container">
            <nav className="pdp-breadcrumb-nav">
              <button onClick={() => navigate('/')} className="pdp-breadcrumb-link">Home</button>
              <span className="pdp-breadcrumb-separator">›</span>
              <button onClick={() => navigate('/products')} className="pdp-breadcrumb-link">Products</button>
              <span className="pdp-breadcrumb-separator">›</span>
              <span className="pdp-breadcrumb-current">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="pdp-container">
          <div className="pdp-product-layout">
            {/* Product Images */}
            <div className="pdp-images-section">
              <div className="pdp-main-image-wrapper">
                <img 
                  src={productImages[selectedImage]} 
                  alt={product.name}
                  className="pdp-main-product-image"
                />
                {product.featured && (
                  <div className="pdp-featured-badge">
                    <span>⭐ Featured</span>
                  </div>
                )}
                {inCart && (
                  <div className="pdp-in-cart-badge">
                    <span>🛒 In Cart ({cartQuantity})</span>
                  </div>
                )}
              </div>
              
              {productImages.length > 1 && (
                <div className="pdp-thumbnail-grid">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      className={`pdp-thumbnail ${selectedImage === index ? 'pdp-thumbnail-active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img src={image} alt={`${product.name} ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="pdp-product-info">
              <div className="pdp-product-header">
                <h1 className="pdp-product-title">{product.name}</h1>
                <div className="pdp-product-rating">
                  {renderStars(reviewStats.averageRating || product.rating || 4)}
                  <span className="pdp-rating-text">({reviewStats.averageRating || product.rating || 4.0}/5)</span>
                  <span className="pdp-review-count">({reviewStats.totalReviews || product.reviewCount || 0} reviews)</span>
                </div>
              </div>

              <div className="pdp-product-pricing">
                <span className="pdp-current-price">${product.price}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="pdp-original-price">${product.originalPrice}</span>
                    <span className="pdp-discount-badge">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              <div className="pdp-stock-info">
                <span className={`pdp-stock-status ${product.stock > 0 ? 'pdp-in-stock' : 'pdp-out-of-stock'}`}>
                  {product.stock > 0 ? `✅ In Stock (${product.stock} available)` : '❌ Out of Stock'}
                </span>
              </div>

              <div className="pdp-category-info">
                <span className="pdp-category-label">Category:</span>
                <span className="pdp-category-name">{product.category?.name || 'General'}</span>
              </div>

              {/* Quantity Selector */}
              <div className="pdp-quantity-section">
                <label className="pdp-quantity-label">Quantity:</label>
                <div className="pdp-quantity-controls">
                  <button 
                    className="pdp-quantity-btn"
                    onClick={() => handleQuantityChange('decrement')}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="pdp-quantity-display">{quantity}</span>
                  <button 
                    className="pdp-quantity-btn"
                    onClick={() => handleQuantityChange('increment')}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pdp-action-buttons">
                <button 
                  className={`pdp-add-to-cart-btn ${inCart ? 'pdp-in-cart' : ''}`}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <span className="pdp-btn-icon">🛒</span>
                  {inCart ? `In Cart (${cartQuantity})` : 'Add to Cart'}
                </button>
                <button 
                  className="pdp-buy-now-btn"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                >
                  <span className="pdp-btn-icon">⚡</span>
                  Buy Now
                </button>
              </div>

              {/* Product Features */}
              <div className="pdp-features-grid">
                <div className="pdp-feature-item">
                  <span className="pdp-feature-icon">🚚</span>
                  <span>Free Shipping</span>
                </div>
                <div className="pdp-feature-item">
                  <span className="pdp-feature-icon">↩️</span>
                  <span>30-Day Returns</span>
                </div>
                <div className="pdp-feature-item">
                  <span className="pdp-feature-icon">🛡️</span>
                  <span>1 Year Warranty</span>
                </div>
                <div className="pdp-feature-item">
                  <span className="pdp-feature-icon">💳</span>
                  <span>Secure Payment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="pdp-tabs-wrapper">
            <div className="pdp-tab-headers">
              <button 
                className={`pdp-tab-header ${activeTab === 'description' ? 'pdp-tab-active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={`pdp-tab-header ${activeTab === 'specifications' ? 'pdp-tab-active' : ''}`}
                onClick={() => setActiveTab('specifications')}
              >
                Specifications
              </button>
              <button 
                className={`pdp-tab-header ${activeTab === 'reviews' ? 'pdp-tab-active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({reviewStats.totalReviews})
              </button>
            </div>

            <div className="pdp-tab-content">
              {activeTab === 'description' && (
                <div className="pdp-tab-panel">
                  <h3>Product Description</h3>
                  <p>{product.description || 'No description available for this product.'}</p>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="pdp-tab-panel">
                  <h3>Specifications</h3>
                  <div className="pdp-specs-list">
                    <div className="pdp-spec-item">
                      <span className="pdp-spec-label">Brand:</span>
                      <span className="pdp-spec-value">{product.brand || 'Generic'}</span>
                    </div>
                    <div className="pdp-spec-item">
                      <span className="pdp-spec-label">SKU:</span>
                      <span className="pdp-spec-value">{product._id}</span>
                    </div>
                    <div className="pdp-spec-item">
                      <span className="pdp-spec-label">Weight:</span>
                      <span className="pdp-spec-value">{product.weight || 'N/A'}</span>
                    </div>
                    <div className="pdp-spec-item">
                      <span className="pdp-spec-label">Dimensions:</span>
                      <span className="pdp-spec-value">{product.dimensions || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="pdp-tab-panel">
                  <h3>Customer Reviews</h3>
                  <div className="pdp-reviews-summary">
                    <div className="pdp-rating-overview">
                      <div className="pdp-avg-rating">
                        <span className="pdp-rating-number">{reviewStats.averageRating || 0}</span>
                        {renderStars(reviewStats.averageRating || 0)}
                        <span className="pdp-total-reviews">Based on {reviewStats.totalReviews} reviews</span>
                      </div>
                    </div>
                  </div>
                  
                  {reviews.length === 0 ? (
                    <div className="pdp-no-reviews">
                      <p>No reviews yet. Be the first to review this product!</p>
                    </div>
                  ) : (
                    <div className="pdp-reviews-list">
                      {reviews.map((review) => (
                        <div key={review._id} className="pdp-review-item">
                          <div className="pdp-review-header">
                            <div className="pdp-reviewer-info">
                              <span className="pdp-reviewer-name">
                                {review.user.name} {review.user.lastName}
                              </span>
                              {review.verified && (
                                <span className="pdp-verified-badge">✅ Verified Purchase</span>
                              )}
                            </div>
                            <span className="pdp-review-date">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="pdp-review-rating">
                            {renderStars(review.rating)}
                          </div>
                          <h4 className="pdp-review-title">{review.title}</h4>
                          <p className="pdp-review-comment">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default ProductDetailsPage