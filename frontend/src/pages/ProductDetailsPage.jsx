import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProductById } from '../api/productApi'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './ProductDetailsPage.css'

const ProductDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, isInCart, getItemQuantity } = useCart()
  
  const [product, setProduct] = useState(null)
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
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
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
        <div className="error-container">
          <div className="error-content">
            <div className="error-icon">❌</div>
            <h2>Product Not Found</h2>
            <p>{error || 'The product you are looking for does not exist'}</p>
            <button 
              className="back-btn"
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
      <div className="product-details-page">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <div className="container">
            <nav className="breadcrumb-nav">
              <button onClick={() => navigate('/')} className="breadcrumb-link">Home</button>
              <span className="breadcrumb-separator">›</span>
              <button onClick={() => navigate('/products')} className="breadcrumb-link">Products</button>
              <span className="breadcrumb-separator">›</span>
              <span className="breadcrumb-current">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="container">
          <div className="product-container">
            {/* Product Images */}
            <div className="product-images">
              <div className="main-image">
                <img 
                  src={productImages[selectedImage]} 
                  alt={product.name}
                  className="main-product-image"
                />
                {product.featured && (
                  <div className="featured-badge">
                    <span>⭐ Featured</span>
                  </div>
                )}
                {inCart && (
                  <div className="in-cart-badge">
                    <span>🛒 In Cart ({cartQuantity})</span>
                  </div>
                )}
              </div>
              
              {productImages.length > 1 && (
                <div className="thumbnail-images">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img src={image} alt={`${product.name} ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-info">
              <div className="product-header">
                <h1 className="product-title">{product.name}</h1>
                <div className="product-rating">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`star ${i < (product.rating || 4) ? 'filled' : ''}`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="rating-text">({product.rating || 4.0}/5)</span>
                  <span className="review-count">({product.reviewCount || 0} reviews)</span>
                </div>
              </div>

              <div className="product-price">
                <span className="current-price">${product.price}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="original-price">${product.originalPrice}</span>
                    <span className="discount">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              <div className="product-stock">
                <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {product.stock > 0 ? `✅ In Stock (${product.stock} available)` : '❌ Out of Stock'}
                </span>
              </div>

              <div className="product-category">
                <span className="category-label">Category:</span>
                <span className="category-name">{product.category?.name || 'General'}</span>
              </div>

              {/* Quantity Selector */}
              <div className="quantity-section">
                <label className="quantity-label">Quantity:</label>
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange('decrement')}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity-display">{quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange('increment')}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button 
                  className={`add-to-cart-btn ${inCart ? 'in-cart' : ''}`}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <span className="btn-icon">🛒</span>
                  {inCart ? `In Cart (${cartQuantity})` : 'Add to Cart'}
                </button>
                <button 
                  className="buy-now-btn"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                >
                  <span className="btn-icon">⚡</span>
                  Buy Now
                </button>
              </div>

              {/* Product Features */}
              <div className="product-features">
                <div className="feature">
                  <span className="feature-icon">🚚</span>
                  <span>Free Shipping</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">↩️</span>
                  <span>30-Day Returns</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🛡️</span>
                  <span>1 Year Warranty</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">💳</span>
                  <span>Secure Payment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="product-tabs">
            <div className="tab-headers">
              <button 
                className={`tab-header ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={`tab-header ${activeTab === 'specifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('specifications')}
              >
                Specifications
              </button>
              <button 
                className={`tab-header ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'description' && (
                <div className="tab-panel">
                  <h3>Product Description</h3>
                  <p>{product.description || 'No description available for this product.'}</p>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="tab-panel">
                  <h3>Specifications</h3>
                  <div className="specifications">
                    <div className="spec-item">
                      <span className="spec-label">Brand:</span>
                      <span className="spec-value">{product.brand || 'Generic'}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">SKU:</span>
                      <span className="spec-value">{product._id}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Weight:</span>
                      <span className="spec-value">{product.weight || 'N/A'}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Dimensions:</span>
                      <span className="spec-value">{product.dimensions || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="tab-panel">
                  <h3>Customer Reviews</h3>
                  <div className="reviews-summary">
                    <div className="rating-overview">
                      <div className="avg-rating">
                        <span className="rating-number">{product.rating || 4.0}</span>
                        <div className="rating-stars">
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={i} 
                              className={`star ${i < (product.rating || 4) ? 'filled' : ''}`}
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className="total-reviews">Based on {product.reviewCount || 0} reviews</span>
                      </div>
                    </div>
                  </div>
                  <div className="no-reviews">
                    <p>No reviews yet. Be the first to review this product!</p>
                  </div>
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