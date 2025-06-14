const express = require("express")
const router = express.Router()
const Product = require("../models/Product")
const Category = require("../models/Category")

// Get all products with filtering
router.get("/products", async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sortBy, sortOrder = "asc" } = req.query

    // Build filter object
    let filter = {}

    // Category filter
    if (category && category !== "all") {
      filter.category = category
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = parseFloat(minPrice)
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice)
    }

    // Build sort object
    let sort = {}
    if (sortBy) {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1
    } else {
      sort.createdAt = -1 // Default sort by newest first
    }

    const products = await Product.find(filter).populate("category", "name").sort(sort)

    res.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get all categories for filter dropdown
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find({}).select("name")
    res.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get single product by ID
router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name")
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }
    res.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
