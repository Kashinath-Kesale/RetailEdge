const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
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
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;