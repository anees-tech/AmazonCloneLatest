// 2)\AmazonClone (2)\frontend\src\pages\AllProductsPage.jsx
import React, { useState, useEffect } from "react"
import ProductCard from "../components/ProductCard"
import { getAllProducts, getAllCategories } from "../api/productApi"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import './AllProductsPage.css'

const AllProductsPage = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filter states
  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // Filter panel visibility
  const [showFilters, setShowFilters] = useState(false)

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getAllCategories()
        setCategories(Array.isArray(fetchedCategories) ? fetchedCategories : [])
      } catch (err) {
        console.error("Failed to fetch categories:", err)
        setCategories([])
      }
    }
    fetchCategories()
  }, [])

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Prepare filters for API call
        const apiFilters = { ...filters }
        if (apiFilters.category === 'all') {
          delete apiFilters.category
        }
        
        const fetchedProducts = await getAllProducts(apiFilters)
        
        if (Array.isArray(fetchedProducts)) {
          setProducts(fetchedProducts)
        } else {
          console.warn("getAllProducts did not return an array:", fetchedProducts)
          setProducts([])
        }
      } catch (err) {
        console.error("Failed to fetch products:", err)
        setError(err.message || "Failed to fetch products. Please try again later.")
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      category: 'all',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <h2>Loading Products...</h2>
            <p>Please wait while we fetch the latest products</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="error-container">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button 
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="all-products-page">
        {/* Header Section */}
        <div className="page-header">
          <div className="container">
            <div className="header-content">
              <div className="header-text">
                <h1 className="page-title">All Products</h1>
                <p className="page-subtitle">Discover amazing products at great prices</p>
              </div>
              <button
                className="mobile-filter-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <span className="filter-icon">🔧</span>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="main-content">
            {/* Filter Sidebar */}
            <div className={`filter-sidebar ${showFilters ? 'show-mobile' : ''}`}>
              <div className="filter-card">
                <div className="filter-header">
                  <h2>
                    <span className="filter-icon">🎯</span>
                    Filters
                  </h2>
                  <button
                    className="clear-filters-btn"
                    onClick={clearFilters}
                  >
                    Clear All
                  </button>
                </div>

                {/* Category Filter */}
                <div className="filter-group">
                  <label className="filter-label">
                    <span className="label-icon">📂</span>
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div className="filter-group">
                  <label className="filter-label">
                    <span className="label-icon">💰</span>
                    Price Range
                  </label>
                  <div className="price-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="price-input"
                    />
                    <span className="price-separator">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="price-input"
                    />
                  </div>
                </div>

                {/* Sort Options */}
                <div className="filter-group">
                  <label className="filter-label">
                    <span className="label-icon">🔄</span>
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="filter-select"
                  >
                    <option value="createdAt">Newest First</option>
                    <option value="price">Price</option>
                    <option value="name">Name</option>
                    <option value="rating">Rating</option>
                  </select>
                  
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    className="filter-select"
                  >
                    <option value="asc">Low to High</option>
                    <option value="desc">High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="products-section">
              {/* Results Header */}
              <div className="results-header">
                <div className="results-info">
                  <div className="results-icon">📦</div>
                  <div className="results-text">
                    <h3>{products.length} Product{products.length !== 1 ? 's' : ''}</h3>
                    <p>Found matching your criteria</p>
                  </div>
                </div>
                
                {/* Active Filters */}
                <div className="active-filters">
                  {filters.category !== 'all' && (
                    <span className="filter-tag category-tag">
                      {categories.find(cat => cat._id === filters.category)?.name || 'Category'}
                    </span>
                  )}
                  {(filters.minPrice || filters.maxPrice) && (
                    <span className="filter-tag price-tag">
                      ${filters.minPrice || '0'} - ${filters.maxPrice || '∞'}
                    </span>
                  )}
                </div>
              </div>
              
              {products.length === 0 ? (
                <div className="no-products">
                  <div className="no-products-icon">🔍</div>
                  <h3>No products found</h3>
                  <p>Try adjusting your filters to see more results</p>
                  <button
                    className="clear-filters-main-btn"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="products-grid">
                  {products.map((product) => (
                    <div key={product._id} className="product-card-wrapper">
                      <ProductCard product={product} />
                    </div>
                  ))}
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

export default AllProductsPage