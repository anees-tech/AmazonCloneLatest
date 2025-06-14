const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");

// Get reviews for a product
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name lastName')
      .sort({ createdAt: -1 });
    
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    res.json({ 
      success: true, 
      reviews,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's reviewable products (delivered orders)
router.get("/user/:userId/reviewable", async (req, res) => {
  try {
    const orders = await Order.find({ 
      user: req.params.userId,
      status: 'delivered'
    }).populate('items.product');

    const reviewableItems = [];
    
    for (const order of orders) {
      for (const item of order.items) {
        // Check if already reviewed
        const existingReview = await Review.findOne({
          user: req.params.userId,
          product: item.product._id,
          order: order._id
        });

        if (!existingReview) {
          reviewableItems.push({
            orderId: order._id,
            orderNumber: order.orderNumber,
            orderDate: order.createdAt,
            productId: item.product._id,
            productName: item.name,
            productImage: item.image,
            quantity: item.quantity
          });
        }
      }
    }

    res.json({ success: true, reviewableItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's reviews
router.get("/user/:userId", async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.params.userId })
      .populate('product', 'name image')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a review
router.post("/", async (req, res) => {
  try {
    const { userId, productId, orderId, rating, title, comment } = req.body;

    // Verify the order belongs to the user and is delivered
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
      status: 'delivered'
    });

    if (!order) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order not found or not delivered' 
      });
    }

    // Verify the product was in the order
    const productInOrder = order.items.find(item => 
      item.product.toString() === productId
    );

    if (!productInOrder) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product not found in this order' 
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
      order: orderId
    });

    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this product for this order' 
      });
    }

    // Create the review
    const review = new Review({
      user: userId,
      product: productId,
      order: orderId,
      rating,
      title,
      comment
    });

    await review.save();

    // Update product rating
    await updateProductRating(productId);

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update product rating helper function
const updateProductRating = async (productId) => {
  try {
    const reviews = await Review.find({ product: productId });
    const totalReviews = reviews.length;
    
    if (totalReviews > 0) {
      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
      
      await Product.findByIdAndUpdate(productId, {
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: totalReviews
      });
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};

module.exports = router;