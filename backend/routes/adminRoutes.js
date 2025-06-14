const express = require("express")
const router = express.Router()
const Product = require("../models/Product")
const Category = require("../models/Category")
const User = require("../models/User")
const Order = require("../models/Order")

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  // Get userId from headers
  const userId = req.headers["user-id"]

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized", success: false })
  }

  try {
    const user = await User.findById(userId)
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin only.", success: false })
    }
    next()
  } catch (err) {
    return res.status(500).json({ message: "Server Error", success: false })
  }
}

// Apply admin middleware to all routes
router.use(isAdmin)

// ===== PRODUCT ROUTES =====

// Get all products
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find()
    res.json({ products, success: true })
  } catch (err) {
    res.status(500).json({ message: "Server Error", success: false })
  }
})

// Create a product
router.post("/products", async (req, res) => {
  try {
    const { name, price, description, category, size, featured, images } = req.body // change 2

    // Generate a unique ID
    const lastProduct = await Product.findOne().sort({ id: -1 })
    const id = lastProduct ? lastProduct.id + 1 : 1

    const product = new Product({
      id,
      name,
      price,
      description,
      category,
      size, // change 2
      featured: featured || false,
      images: images || ["/placeholder.svg"],
      rating: 0,
      reviews: 0,
    })

    await product.save()
    res.status(201).json({ message: "Product created successfully", product, success: true })
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message, success: false })
  }
})

// Update a product
router.put("/products/:id", async (req, res) => {
  try {
    const { name, price, description, category, featured, images } = req.body
    const productId = req.params.id

    const product = await Product.findOneAndUpdate(
      { id: productId },
      { name, price, description, category, featured, images },
      { new: true },
    )

    if (!product) {
      return res.status(404).json({ message: "Product not found", success: false })
    }

    res.json({ message: "Product updated successfully", product, success: true })
  } catch (err) {
    res.status(500).json({ message: "Server Error", success: false })
  }
})

// Delete a product
router.delete("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id
    const product = await Product.findOneAndDelete({ id: productId })

    if (!product) {
      return res.status(404).json({ message: "Product not found", success: false })
    }

    res.json({ message: "Product deleted successfully", success: true })
  } catch (err) {
    res.status(500).json({ message: "Server Error", success: false })
  }
})

// ===== CATEGORY ROUTES =====

// Get all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find()
    res.json({ categories, success: true })
  } catch (err) {
    res.status(500).json({ message: "Server Error", success: false })
  }
})

// Create a category
router.post("/categories", async (req, res) => {
  try {
    const { name, image } = req.body

    // Generate a unique ID
    const id = name.toLowerCase().replace(/\s+/g, "-")

    // Check if category with this ID already exists
    const existingCategory = await Category.findOne({ id })
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists", success: false })
    }

    const category = new Category({
      id,
      name,
      image: image || "/images/categories/default.jpg",
    })

    await category.save()
    res.status(201).json({ message: "Category created successfully", category, success: true })
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message, success: false })
  }
})

// Update a category
router.put("/categories/:id", async (req, res) => {
  try {
    const { name, image } = req.body
    const categoryId = req.params.id

    const category = await Category.findOneAndUpdate({ id: categoryId }, { name, image }, { new: true })

    if (!category) {
      return res.status(404).json({ message: "Category not found", success: false })
    }

    res.json({ message: "Category updated successfully", category, success: true })
  } catch (err) {
    res.status(500).json({ message: "Server Error", success: false })
  }
})

// Delete a category
router.delete("/categories/:id", async (req, res) => {
  try {
    const categoryId = req.params.id

    // Check if any products use this category
    const productsWithCategory = await Product.findOne({ category: categoryId })
    if (productsWithCategory) {
      return res.status(400).json({
        message: "Cannot delete category that has products. Remove or reassign products first.",
        success: false,
      })
    }

    const category = await Category.findOneAndDelete({ id: categoryId })

    if (!category) {
      return res.status(404).json({ message: "Category not found", success: false })
    }

    res.json({ message: "Category deleted successfully", success: true })
  } catch (err) {
    res.status(500).json({ message: "Server Error", success: false })
  }
})

// ===== USER ROUTES =====

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password -confirmpassword")
    res.json({ users, success: true })
  } catch (err) {
    res.status(500).json({ message: "Server Error", success: false })
  }
})

// Toggle admin status
router.put("/users/:id/toggle-admin", async (req, res) => {
  try {
    const userId = req.params.id
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: "User not found", success: false })
    }

    // Toggle admin status
    user.isAdmin = !user.isAdmin
    await user.save()

    res.json({
      message: `User ${user.isAdmin ? "promoted to" : "demoted from"} admin successfully`,
      user: { ...user.toObject(), password: undefined, confirmpassword: undefined },
      success: true,
    })
  } catch (err) {
    console.error(err) // Log the error for debugging
    res.status(500).json({ message: "Server Error", success: false })
  }
})

// Delete a user
router.delete("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id
    const adminId = req.headers["user-id"]

    // Check if user exists
    const userToDelete = await User.findById(userId)
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found", success: false })
    }

    // Prevent self-deletion
    if (userId === adminId) {
      return res.status(400).json({ message: "You cannot delete your own account while logged in", success: false })
    }

    // Check if this is the last admin
    if (userToDelete.isAdmin) {
      const adminCount = await User.countDocuments({ isAdmin: true })
      if (adminCount <= 1) {
        return res.status(400).json({
          message: "Cannot delete the last admin account. Promote another user first",
          success: false,
        })
      }
    }

    // Delete the user
    await User.findByIdAndDelete(userId)

    res.json({ message: "User deleted successfully", success: true })
  } catch (err) {
    console.error("Delete user error:", err)
    res.status(500).json({ message: "Server Error", success: false })
  }
})

// Update user details
router.put("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id
    const { name, lastName, email, isAdmin } = req.body
    const adminId = req.headers["user-id"]

    // Check if user exists
    const userToUpdate = await User.findById(userId)
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found", success: false })
    }

    // Special validation for admin status changes
    if (userToUpdate.isAdmin && !isAdmin) {
      // Attempting to remove admin status
      const adminCount = await User.countDocuments({ isAdmin: true })
      if (adminCount <= 1) {
        return res.status(400).json({
          message: "Cannot remove admin status from the last admin user",
          success: false,
        })
      }
    }

    // Update user details
    userToUpdate.name = name
    userToUpdate.lastName = lastName
    userToUpdate.email = email
    userToUpdate.isAdmin = isAdmin

    await userToUpdate.save()

    res.json({
      message: "User updated successfully",
      success: true,
      user: userToUpdate,
    })
  } catch (err) {
    console.error("Update user error:", err)

    // Handle duplicate email error
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Email address is already in use",
        success: false,
      })
    }

    res.status(500).json({ message: "Server Error", success: false })
  }
})

// ===== ORDER ROUTES =====

// Get all orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name")
      .sort({ createdAt: -1 })

    res.json({ orders, success: true })
  } catch (err) {
    res.status(500).json({ message: "Server Error", success: false })
  }
})

// Get single order
router.get("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email").populate("items.product", "name")

    if (!order) {
      return res.status(404).json({ message: "Order not found", success: false })
    }

    res.json({ order, success: true })
  } catch (err) {
    res.status(500).json({ message: "Server Error", success: false })
  }
})

// Update order status
router.put("/orders/:id", async (req, res) => {
  try {
    const { status, isPaid, isDelivered } = req.body
    const orderId = req.params.id

    const updateData = {}
    if (status) updateData.status = status
    if (isPaid !== undefined) {
      updateData.isPaid = isPaid
      if (isPaid) updateData.paidAt = new Date()
    }
    if (isDelivered !== undefined) {
      updateData.isDelivered = isDelivered
      if (isDelivered) updateData.deliveredAt = new Date()
    }

    const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true })
      .populate("user", "name email")
      .populate("items.product", "name")

    if (!order) {
      return res.status(404).json({ message: "Order not found", success: false })
    }

    res.json({ message: "Order updated successfully", order, success: true })
  } catch (err) {
    res.status(500).json({ message: "Server Error", success: false })
  }
})

// Delete order
router.delete("/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id
    const order = await Order.findByIdAndDelete(orderId)

    if (!order) {
      return res.status(404).json({ message: "Order not found", success: false })
    }

    res.json({ message: "Order deleted successfully", success: true })
  } catch (err) {
    res.status(500).json({ message: "Server Error", success: false })
  }
})

module.exports = router
