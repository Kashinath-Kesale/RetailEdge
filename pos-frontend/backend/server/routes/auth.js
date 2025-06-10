const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

// User Registration
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("Signup request received:", { name, email, role }); // Don't log password

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Validate role
    const allowedRoles = ['admin', 'cashier', 'viewer'];
    if (!role || !allowedRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ 
        msg: "Invalid role", 
        details: "Role must be one of: admin, cashier, viewer" 
      });
    }

    // Create and save user
    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role.trim().toLowerCase()
    });

    console.log("Creating user with data:", { 
      name: user.name, 
      email: user.email, 
      role: user.role 
    });

    await user.save();

    console.log("User saved successfully:", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    // Generate JWT token using secret from .env
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      msg: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      msg: "Server error", 
      error: error.message,
      details: error.errors // Include validation errors if any
    });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate JWT token using secret from .env
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      msg: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Update User Profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ msg: "Name is required" });
    }

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update name
    user.name = name.trim();
    await user.save();

    res.status(200).json({
      msg: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Update User Password
router.put("/update-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        msg: "Both current password and new password are required" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        msg: "New password must be at least 6 characters long" 
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Current password is incorrect" });
    }

    // Check if new password is same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        msg: "New password must be different from current password" 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      msg: "Password updated successfully",
      token, // Send new token to force re-authentication
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    console.log("Forgot password request received:", req.body);
    const { email } = req.body;

    // Validate email
    if (!email) {
      console.log("Email is missing in request");
      return res.status(400).json({ msg: "Email is required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log("No user found with email:", email);
      return res.status(404).json({ msg: "No account found with this email" });
    }

    console.log("User found:", { id: user._id, email: user.email });

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Reset token generated for user:", user._id);

    // In a real application, you would:
    // 1. Save the reset token to the user document
    // 2. Send an email with the reset link
    // For now, we'll just return the token in the response
    // TODO: Implement email sending functionality

    res.json({
      msg: "Password reset link has been sent to your email",
      resetToken // Remove this in production
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ 
      msg: "Server error", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ msg: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        msg: "New password must be at least 6 characters long" 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if new password is same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        msg: "New password must be different from current password" 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ msg: "Password has been reset successfully" });

  } catch (error) {
    console.error("Reset password error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

module.exports = router; 