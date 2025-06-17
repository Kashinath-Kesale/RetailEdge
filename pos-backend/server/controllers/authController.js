const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

// Helper function to clean URLs
const cleanUrl = (url) => {
  if (!url) return '';
  
  // Remove any trailing slashes and clean up multiple slashes
  let cleaned = url.trim().replace(/\/+$/, '').replace(/\/+/g, '/');
  
  // Ensure the URL starts with https://
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }
  
  // Ensure there's exactly one slash after https://
  cleaned = cleaned.replace(/^https:\/\/+/, 'https://');
  
  console.log('Cleaned URL:', cleaned);
  return cleaned;
};

// Signup with email verification
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("Signup request received:", { 
      name, 
      email, 
      role,
      headers: req.headers,
      ip: req.ip
    });

    // Validate required fields
    if (!name || !email || !password || !role) {
      console.log("Missing required fields:", {
        name: !name,
        email: !email,
        password: !password,
        role: !role
      });
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

    // Check if user exists
    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate role
    const allowedRoles = ['admin', 'cashier', 'viewer'];
    if (!allowedRoles.includes(role.toLowerCase())) {
      console.log("Invalid role:", role);
      return res.status(400).json({ 
        message: 'Invalid role selected',
        details: 'Role must be one of: admin, cashier, viewer'
      });
    }

    // Generate verification token
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
    console.log("User saved successfully:", {
      id: newUser._id,
      email: newUser.email,
      role: newUser.role
    });

    try {
      // Send verification email
      const frontendUrl = cleanUrl(process.env.FRONTEND_URL);
      const verifyURL = `${frontendUrl}/verify-email?token=${verificationToken}`;
      
      console.log("Preparing verification email:", {
        to: newUser.email,
        verifyURL,
        frontendUrl
      });

      // Create the email content with proper URL formatting
      const emailContent = `
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
      `;

      console.log("Sending verification email...");
      await sendEmail({
        to: newUser.email,
        subject: "Verify your RetailEdge email",
        html: emailContent
      });
      console.log("Verification email sent successfully");

      res.status(201).json({
        message: 'User registered successfully. Please check your email to verify.',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (emailError) {
      console.error("Error sending verification email:", {
        error: emailError.message,
        stack: emailError.stack,
        code: emailError.code
      });
      
      // Delete the user if email sending fails
      await User.findByIdAndDelete(newUser._id);
      throw new Error(`Failed to send verification email: ${emailError.message}`);
    }
  } catch (err) {
    console.error("Signup Error:", {
      error: err.message,
      stack: err.stack,
      code: err.code
    });
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
      path: req.path,
      url: req.url,
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl
    });

    if (!token) {
      console.log("No token provided in request");
      return res.status(400).json({ message: "Verification token is required" });
    }

    // First check if user is already verified
    const existingUser = await User.findOne({ emailVerificationToken: token });
    console.log("Existing user check:", existingUser ? { id: existingUser._id, email: existingUser.email, isVerified: existingUser.isVerified } : "No user found");

    if (existingUser && existingUser.isVerified) {
      return res.status(200).json({ 
        message: "Email already verified",
        verified: true
      });
    }

    // Then check for valid token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    console.log("User found with token:", user ? { id: user._id, email: user.email } : "No user found");

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired token",
        details: "Please request a new verification email"
      });
    }

    // Update user verification status
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    console.log("Email verified successfully for user:", {
      userId: user._id,
      email: user.email
    });

    return res.status(200).json({ 
      message: "Email verified successfully",
      verified: true
    });
  } catch (error) {
    console.error("Email verification error:", error);
    console.error("Error stack:", error.stack);
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
    console.log("Login request received:", { email });

    // Find user
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Prepare user data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: Boolean(user.isVerified) // Ensure boolean value
    };

    console.log("Login successful:", {
      userId: user._id,
      email: user.email,
      isVerified: userData.isVerified
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: userData
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Login failed",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update profile controller
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!name && !email) {
      return res.status(400).json({ message: "At least one field is required to update" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (name) user.name = name;
    if (email) {
      // Check if new email is already taken
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
      user.isVerified = false; // Require re-verification for email change
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// Update password controller
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: "Error updating password" });
  }
};

// Forgot password controller
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // Send reset email
    const resetUrl = cleanUrl(`${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`);
    const emailHtml = `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `;

    await sendEmail({
      to: email,
      subject: "Reset Your Password - RetailEdge",
      html: emailHtml,
    });

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Error processing forgot password request" });
  }
};

// Reset password controller
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};

// Resend Verification Email
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 3600000; // 1 hour

    // Update user with new token
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationTokenExpires;
    await user.save();

    // Send verification email
    const frontendUrl = cleanUrl(process.env.FRONTEND_URL);
    const verifyURL = `${frontendUrl}/verify-email?token=${verificationToken}`;
    
    console.log("Resending verification email to:", user.email);
    console.log("New verification URL:", verifyURL);

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">Verify your RetailEdge email</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #374151;">Hello ${user.name},</p>
        <p style="font-size: 16px; line-height: 1.5; color: #374151;">Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyURL}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: 500;">
            Verify Email Address
          </a>
        </div>
        <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link in your browser:</p>
        <p style="font-size: 14px; color: #6b7280; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">${verifyURL}</p>
        <p style="font-size: 14px; color: #6b7280;">This link will expire in 1 hour.</p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "Verify your RetailEdge email",
      html: emailContent
    });

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully"
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      message: "Failed to resend verification email",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}; 