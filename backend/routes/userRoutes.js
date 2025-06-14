const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { sendOTPEmail } = require('../services/emailService');

// Register a new user
router.post("/register", async (req, res) => {
  const { name, lastName, email, password, confirmpassword } = req.body; //change 1
  try {
    let user = await User.findOne({ email });
    if (user)
      // use or !user
      return res
        .status(400)
        .json({ message: "User already exists", code: 403 });

    // new user create mechanism
    
    user = new User({ name, lastName, email, password ,confirmpassword, }); // change 2
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