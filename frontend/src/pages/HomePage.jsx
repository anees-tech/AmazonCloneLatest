"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Carousel from "../components/Carousel"
import ProductCard from "../components/ProductCard"
import { productAPI, categoryAPI } from "../api/axios"
import "../styles/home-page.css"

function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [carouselData, setCarouselData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError("")

        const [productsRes, categoriesRes] = await Promise.all([
          productAPI.getAllProducts(),
          categoryAPI.getAllCategories(),
        ])

        const productsData = productsRes?.data?.products || productsRes?.data || []
        const categoriesData = categoriesRes?.data?.categories || categoriesRes?.data || []

        setProducts(Array.isArray(productsData) ? productsData : [])
        setCategories(Array.isArray(categoriesData) ? categoriesData : [])

        setCarouselData([
          {
            id: 1,
            title: "Summer Collection",
            subtitle: "50% Off Selected Items",
            image: "/image/Banners/b1.jpg",
            link: "/products?category=clothing",
          },
          {
            id: 2,
            title: "New Electronics",
            subtitle: "Latest Gadgets & Accessories",
            image: "/image/banners/electronics.jfif",
            link: "/products?category=electronics",
          },
          {
            id: 3,
            title: "Home Essentials",
            subtitle: "Create Your Perfect Space",
            image: "/image/banners/homeessential.jfif",
            link: "/products?category=home",
          },
        ])
      } catch (err) {
        setError("Failed to load data")
        console.error("HomePage fetch error:", err)
        setProducts([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredProducts =
    selectedCategory && Array.isArray(products)
      ? products.filter((product) => product.category === selectedCategory)
      : products

  if (loading) {
    return (
      <div className="home-page-wrapper">
        <div
          className="loading-container"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
            fontSize: "18px",
          }}
        >
          Loading...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="home-page-wrapper">
        <div
          className="error-container"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
            color: "red",
            fontSize: "18px",
          }}
        >
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="home-page-wrapper">
      <div className="home-page">
        <section className="hero-section">
          <Carousel slides={carouselData} />
        </section>

        <section className="featured-products section">
          <div className="container">
            <div className="section-header">
              <h2>Featured Products</h2>
              <Link to="/products" className="view-all">
                View All
              </Link>
            </div>

            <div className="products-grid">
              {Array.isArray(products) && products.length > 0 ? (
                products
                  .filter((product) => product.featured)
                  .map((product) => <ProductCard key={product._id || product.id} product={product} />)
              ) : (
                <p>No featured products available.</p>
              )}
            </div>
          </div>
        </section>

        <div className="sectionContainer">
          <section className="section">
            <h2>Categories</h2>
            <div className="categories-grid">
              <button
                className={`category-button ${!selectedCategory ? "active" : ""}`}
                onClick={() => setSelectedCategory(null)}
              >
                Show All
              </button>
              {Array.isArray(categories) && categories.length > 0 ? (
                categories.map((category) => (
                  <button
                    key={category._id || category.id}
                    className={`category-button ${selectedCategory === (category._id || category.id) ? "active" : ""}`}
                    onClick={() => setSelectedCategory(category._id || category.id)}
                  >
                    {category.name}
                  </button>
                ))
              ) : (
                <p>No categories available.</p>
              )}
            </div>
          </section>

          <section className="section">
            <h2>Products</h2>
            <div className="products-grid">
              {Array.isArray(filteredProducts) && filteredProducts.length > 0 ? (
                filteredProducts.map((product) => <ProductCard key={product._id || product.id} product={product} />)
              ) : (
                <p>No products found in this category.</p>
              )}
            </div>
          </section>
        </div>

        <section className="promo-banner">
          <div className="container">
            <div className="promo-content">
              <h2>New Season Arrivals</h2>
              <p>Check out all the new trends and styles for 2023</p>
              <Link to="/products" className="btn btn-secondary">
                Shop Now
              </Link>
            </div>
          </div>
        </section>

        <section className="newsletter-section section">
          <div className="container">
            <div className="newsletter-content">
              <h2>Subscribe to Our Newsletter</h2>
              <p>Get the latest updates on new products and upcoming sales</p>
              <form className="newsletter-form">
                <input type="email" placeholder="Your email address" required />
                <button type="submit" className="btn btn-primary">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default HomePage
