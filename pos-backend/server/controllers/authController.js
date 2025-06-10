const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail'); // ✅ make sure this file exists

// ✅ Signup with email verification
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const allowedRoles = ['admin', 'cashier', 'viewer'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    // ✅ Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 3600000; // 1 hour

    // ✅ Create user
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

    // ✅ Send verification email
    const verifyURL = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: email,
      subject: 'Verify your email for RetailEdge',
      html: `<h4>Hi ${name},</h4>
        <p>Thank you for signing up on <strong>RetailEdge</strong>.</p>
        <p>Please click the link below to verify your email:</p>
        <a href="${verifyURL}" target="_blank">Verify Email</a>
        <p>This link will expire in 1 hour.</p>`
    });

    res.status(201).json({
      message: 'Signup successful. Please check your email to verify your account.',
    });

  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({
      message: 'Signup failed',
      error: err.message
    });
  }
};

// ✅ Login — only if email is verified
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({ message: "Email not verified. Please check your inbox." });
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
      error: error.message
    });
  }
};
