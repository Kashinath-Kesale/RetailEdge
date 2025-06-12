const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

// Helper function to clean URLs
const cleanUrl = (url) => url.replace(/\/+/g, '/').replace(/\/$/, '');

// Signup with email verification
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("Signup request received:", { name, email, role });

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: {
          name: !name,
          email: !email,
          password: !password,
          role: !role
        }
      });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const allowedRoles = ['admin', 'cashier', 'viewer'];
    if (!allowedRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ 
        message: 'Invalid role selected',
        details: 'Role must be one of: admin, cashier, viewer'
      });
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 3600000; // 1 hour

    // Create user
    const newUser = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role.trim().toLowerCase(),
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationTokenExpires,
      isVerified: false
    });

    await newUser.save();
    console.log("User saved successfully:", newUser.email);

    try {
      // Clean the frontend URL and construct verification URL
      const frontendUrl = cleanUrl(process.env.FRONTEND_URL);
      const backendUrl = cleanUrl(process.env.BACKEND_URL || 'https://retailedge-backend.onrender.com');
      const verifyURL = `${backendUrl}/api/auth/verify-email?token=${verificationToken}`;
      
      console.log("Sending verification email to:", newUser.email);
      console.log("Verification URL:", verifyURL);

      await sendEmail({
        to: newUser.email,
        subject: "Verify your RetailEdge email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">Welcome to RetailEdge!</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #374151;">Hello ${newUser.name},</p>
            <p style="font-size: 16px; line-height: 1.5; color: #374151;">Thank you for signing up. Please click the button below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyURL}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: 500;">
                Verify Email Address
              </a>
            </div>
            <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link in your browser:</p>
            <p style="font-size: 14px; color: #6b7280; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">${verifyURL}</p>
            <p style="font-size: 14px; color: #6b7280;">This link will expire in 1 hour.</p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">If you didn't create an account, you can safely ignore this email.</p>
          </div>
        `
      });

      res.status(201).json({
        message: 'User registered successfully. Please check your email to verify.',
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Delete the user if email sending fails
      await User.findByIdAndDelete(newUser._id);
      throw new Error("Failed to send verification email. Please try again.");
    }
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({
      message: err.message || 'Signup failed',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    console.log("Verification request received:", {
      token,
      headers: req.headers,
      query: req.query,
      path: req.path
    });

    if (!token) {
      console.log("No token provided in request");
      return res.status(400).json({ message: "Verification token is required" });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log("Invalid or expired token:", token);
      return res.status(400).json({ 
        message: "Invalid or expired token",
        details: "Please request a new verification email"
      });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    console.log("Email verified successfully for user:", {
      userId: user._id,
      email: user.email
    });

    // Redirect to frontend login page with success message
    const frontendUrl = cleanUrl(process.env.FRONTEND_URL);
    res.redirect(`${frontendUrl}/login?verified=true`);
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required",
        details: {
          email: !email,
          password: !password
        }
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        message: "Please verify your email first",
        details: "Check your inbox for the verification email"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name.trim();
    if (email) {
      const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email.trim().toLowerCase();
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update Password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    const frontendUrl = cleanUrl(process.env.FRONTEND_URL);
    const resetURL = `${frontendUrl}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your RetailEdge password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">Reset Your Password</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #374151;">Hello ${user.name},</p>
          <p style="font-size: 16px; line-height: 1.5; color: #374151;">You requested to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: 500;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link in your browser:</p>
          <p style="font-size: 14px; color: #6b7280; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">${resetURL}</p>
          <p style="font-size: 14px; color: #6b7280;">This link will expire in 1 hour.</p>
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    });

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required"
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token"
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
