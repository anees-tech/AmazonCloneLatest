const express = require("express")
const router = express.Router()
const Order = require("../models/Order")
const User = require("../models/User")

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
router.post("/", isAuth, async (req, res) => {
  try {
    // Generate a unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const { items, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalAmount, notes } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No order items" })
    }

    const order = new Order({
      user: req.userId,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalAmount,
      notes,
      orderNumber: orderNumber, // Add this line
    })

    const createdOrder = await order.save()

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: createdOrder,
    })
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
