const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    // Add both user object and userId to request
    req.user = user; // full user object with role
    req.user.userId = user._id; // add userId for routes that need it
    
    // Add session information if available
    if (decoded.sessionId) {
      req.user.sessionId = decoded.sessionId;
      req.user.loginTimestamp = decoded.loginTimestamp;
    }

    // Log access for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log("🔐 Auth middleware - Access granted:", {
        userId: user._id,
        email: user.email,
        role: user.role,
        sessionId: decoded.sessionId,
        path: req.path,
        method: req.method,
        ip: req.ip
      });
    }

    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};

module.exports = { protect };