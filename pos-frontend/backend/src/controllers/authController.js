const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.signup = async (req, res) => {
  try {
    console.log("Raw request body:", req.body);
    const { name, email, password, role } = req.body;
    console.log("Destructured values:", { name, email, role }); // Don't log password

    // Validate required fields
    if (!name || !email || !password || !role) {
      console.log("Missing required fields:", {
        hasName: !!name,
        hasEmail: !!email,
        hasPassword: !!password,
        hasRole: !!role
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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const allowedRoles = ['admin', 'cashier', 'viewer'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    console.log("Creating user with data:", { name, email, role }); // Don't log password

    const newUser = new User({ 
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role.trim().toLowerCase()
    });

    console.log("User object before save:", newUser);

    await newUser.save();

    console.log("Saved user:", {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Signup Error Details:", {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      message: 'Signup failed', 
      error: err.message,
      details: err.errors // Include validation errors if any
    });
  }
};

// User Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
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