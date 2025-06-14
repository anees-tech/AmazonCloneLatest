const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Order = require("../models/Order");
const { sendOTPEmail } = require('../services/emailService');

// Register a new user
router.post("/register", async (req, res) => {
  const { name, lastName, email, password, confirmpassword } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ message: "User already exists", code: 403 });

    user = new User({ name, lastName, email, password, confirmpassword });
    await user.save();
    res
      .status(201)
      .json({
        message: "User registered successfully",
        status: 201,
        success: true,
        user,
      });
  } catch (err) {
    res.status(500).json({ message: "Server Error" + err });
  }
});

// Login a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password)
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password)
      return res
        .status(400)
        .json({ message: "Invalid credentials", code: 403 });

    res.json({ message: "Login successful", user, code: 201, success: true });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Get user profile
router.get("/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password -confirmpassword -resetOTP -resetOTPExpires');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user profile
router.put("/profile/:userId", async (req, res) => {
  try {
    const { name, lastName, email, phone, address, city, state, zipCode, country } = req.body;
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
    }

    // Update user fields
    user.name = name || user.name;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.city = city || user.city;
    user.state = state || user.state;
    user.zipCode = zipCode || user.zipCode;
    user.country = country || user.country;

    await user.save();

    // Return user without sensitive data
    const updatedUser = await User.findById(user._id).select('-password -confirmpassword -resetOTP -resetOTPExpires');
    res.json({ success: true, message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user orders
router.get("/orders/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .populate('items.product', 'name image price')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get specific order details
router.get("/order/:orderId/:userId", async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.orderId, 
      user: req.params.userId 
    }).populate('items.product', 'name image price');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Change password
router.put("/change-password/:userId", async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check current password
    if (user.password !== currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }

    // Update password
    user.password = newPassword;
    user.confirmpassword = confirmPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Generate and send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP and expiration (10 minutes)
    user.resetOTP = otp;
    user.resetOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send email
    await sendOTPEmail(email, otp);

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify OTP and reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const user = await User.findOne({ 
      email,
      resetOTP: otp,
      resetOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Update password and clear OTP
    user.password = newPassword;
    user.confirmpassword = newPassword;
    user.resetOTP = null;
    user.resetOTPExpires = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;