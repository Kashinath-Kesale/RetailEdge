const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const auth = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

// ==================== Signup ====================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("Signup request received:", { name, email, role });

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        msg: "Missing required fields",
        details: {
          name: !name,
          email: !email,
          password: !password,
          role: !role
        }
      });
    }

    const userExists = await User.findOne({ email: email.trim().toLowerCase() });
    if (userExists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const allowedRoles = ["admin", "cashier", "viewer"];
    if (!role || !allowedRoles.includes(role.toLowerCase())) {
      return res.status(400).json({
        msg: "Invalid role",
        details: "Role must be one of: admin, cashier, viewer",
      });
    }

    // Email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role.trim().toLowerCase(),
      isVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationTokenExpires,
    });

    await user.save();
    console.log("User saved successfully:", user.email);

    try {
      // Create the verification URL that points directly to the login page
      const verifyURL = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      
      // Send verification email
      await sendEmail({
        to: user.email,
        subject: "Verify your RetailEdge email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="background-color: #2563eb; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">RetailEdge POS</h1>
            </div>
            <div style="padding: 20px; background-color: #f8fafc;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Welcome to RetailEdge!</h2>
              <p style="font-size: 16px; line-height: 1.5; color: #374151;">Hello ${user.name},</p>
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
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-radius: 0 0 8px 8px;">
              <p>This is an automated message from RetailEdge POS. Please do not reply to this email.</p>
            </div>
          </div>
        `,
      });

      res.status(201).json({
        msg: "User registered successfully. Please check your email to verify.",
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Delete the user if email sending fails
      await User.findByIdAndDelete(user._id);
      throw new Error("Failed to send verification email. Please try again.");
    }
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      msg: error.message || "Server error",
      error: error.message,
      details: error.errors,
    });
  }
});

// ==================== Forgot Password ====================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ msg: "No account found with this email" });
    }

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: "RetailEdge – Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="background-color: #2563eb; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">RetailEdge POS</h1>
          </div>
          <div style="padding: 20px; background-color: #f8fafc;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Reset Your Password</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #374151;">Hello ${user.name},</p>
            <p style="font-size: 16px; line-height: 1.5; color: #374151;">Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetURL}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: 500;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link in your browser:</p>
            <p style="font-size: 14px; color: #6b7280; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">${resetURL}</p>
            <p style="font-size: 14px; color: #6b7280;">This link will expire in 1 hour.</p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-radius: 0 0 8px 8px;">
            <p>This is an automated message from RetailEdge POS. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    });

    res.json({ msg: "Password reset link has been sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// ==================== Email Verification ====================
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ msg: "Verification token is required" });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        msg: "Invalid or expired verification token. Please request a new verification email." 
      });
    }

    // Update user verification status
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ msg: "Email verified successfully" });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

module.exports = router; 