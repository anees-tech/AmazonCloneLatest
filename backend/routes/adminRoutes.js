const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Product = require("../models/Product")
const Category = require("../models/Category")
const Order = require("../models/Order")

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}).select("-password -confirmpassword").sort({ createdAt: -1 })
    res.json({ success: true, users })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Update user
router.put("/users/:id", async (req, res) => {
  try {
    const { name, lastName, email, isAdmin } = req.body
    const user = await User.findByIdAndUpdate(req.params.id, { name, lastName, email, isAdmin }, { new: true }).select(
      "-password -confirmpassword",
    )

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    res.json({ success: true, user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Toggle admin status
router.put("/users/:id/toggle-admin", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // Check if this is the last admin
    if (user.isAdmin) {
      const adminCount = await User.countDocuments({ isAdmin: true })
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot remove admin status from the last admin",
        })
      }
    }

    user.isAdmin = !user.isAdmin
    await user.save()

    const updatedUser = await User.findById(user._id).select("-password -confirmpassword")
    res.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Get all products
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find({}).populate("category").sort({ createdAt: -1 })
    res.json({ success: true, products })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Create product
router.post("/products", async (req, res) => {
  try {
    const product = new Product(req.body)
    await product.save()
    const populatedProduct = await Product.findById(product._id).populate("category")
    res.status(201).json({ success: true, product: populatedProduct })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Update product
router.put("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("category")
    res.json({ success: true, product })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Delete product
router.delete("/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: "Product deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Get all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 })
    res.json({ success: true, categories })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Create category
router.post("/categories", async (req, res) => {
  try {
    const category = new Category(req.body)
    await category.save()
    res.status(201).json({ success: true, category })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Update category
router.put("/categories/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json({ success: true, category })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Delete category
router.delete("/categories/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: "Category deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// ===== ORDER MANAGEMENT ROUTES =====

// Get all orders with user and product details
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name lastName email")
      .populate("items.product", "name image price")
      .sort({ createdAt: -1 })

    res.json({ success: true, orders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    res.status(500).json({ success: false, message: "Failed to fetch orders" })
  }
})

// Get single order details
router.get("/orders/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("user", "name lastName email")
      .populate("items.product", "name image price")

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" })
    }

    res.json({ success: true, order })
  } catch (error) {
    console.error("Error fetching order:", error)
    res.status(500).json({ success: false, message: "Failed to fetch order" })
  }
})

// Update order status
router.put("/orders/:orderId", async (req, res) => {
  try {
    const { status, notes } = req.body

    const order = await Order.findById(req.params.orderId)
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" })
    }

    // Update order fields
    if (status) order.status = status.toLowerCase()
    if (notes !== undefined) order.notes = notes

    // Update timestamps based on status
    const now = new Date()
    switch (status?.toLowerCase()) {
      case "processing":
        if (!order.processedAt) order.processedAt = now
        break
      case "shipped":
        if (!order.shippedAt) order.shippedAt = now
        break
      case "delivered":
        if (!order.deliveredAt) order.deliveredAt = now
        break
    }

    await order.save()

    // Populate and return updated order
    const updatedOrder = await Order.findById(order._id)
      .populate("user", "name lastName email")
      .populate("items.product", "name image price")

    res.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error("Error updating order:", error)
    res.status(500).json({ success: false, message: "Failed to update order" })
  }
})

// Delete order
router.delete("/orders/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" })
    }

    await Order.findByIdAndDelete(req.params.orderId)
    res.json({ success: true, message: "Order deleted successfully" })
  } catch (error) {
    console.error("Error deleting order:", error)
    res.status(500).json({ success: false, message: "Failed to delete order" })
  }
})

// Get order statistics
router.get("/orders-stats", async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments()
    const pendingOrders = await Order.countDocuments({ status: "pending" })
    const processingOrders = await Order.countDocuments({ status: "processing" })
    const shippedOrders = await Order.countDocuments({ status: "shipped" })
    const deliveredOrders = await Order.countDocuments({ status: "delivered" })
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" })

    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ])
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0

    // Get recent orders
    const recentOrders = await Order.find({}).populate("user", "name lastName email").sort({ createdAt: -1 }).limit(5)

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
      },
      recentOrders,
    })
  } catch (error) {
    console.error("Error fetching order stats:", error)
    res.status(500).json({ success: false, message: "Failed to fetch order statistics" })
  }
})

module.exports = router
