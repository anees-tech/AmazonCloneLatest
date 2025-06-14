const express = require("express")
const router = express.Router()
const Order = require("../models/Order")
const User = require("../models/User")
const mongoose = require("mongoose")

// Middleware to check if user is authenticated
const isAuth = (req, res, next) => {
  const userId = req.headers["user-id"]
  if (!userId) {
    return res.status(401).json({ success: false, message: "Not authenticated" })
  }
  req.userId = userId
  next()
}

// Create new order
router.post("/", async (req, res) => {
  try {
    // Extract user ID from header
    const userId = req.headers["user-id"]

    // Check if user ID exists
    if (!userId) {
      return res.status(401).json({ success: false, message: "User ID is required. Please login first." })
    }

    // Check if user ID is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format" })
    }

    const { orderNumber, items, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalAmount, notes } = req.body

    // Create new order with the user ID from header
    const order = new Order({
      user: userId, // Use the extracted user ID
      orderNumber,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalAmount,
      notes: notes || "",
    })

    const savedOrder = await order.save()
    res.status(201).json({ success: true, order: savedOrder })
  } catch (error) {
    console.error("Create order error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Get user orders
router.get("/my-orders", isAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).populate("items.product", "name").sort({ createdAt: -1 })

    res.json({ success: true, orders })
  } catch (error) {
    console.error("Get user orders error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Get single order
router.get("/:id", isAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email").populate("items.product", "name")

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" })
    }

    // Check if user owns this order or is admin
    const user = await User.findById(req.userId)
    if (order.user._id.toString() !== req.userId && !user.isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized" })
    }

    res.json({ success: true, order })
  } catch (error) {
    console.error("Get order error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

module.exports = router
