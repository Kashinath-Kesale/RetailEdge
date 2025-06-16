const express = require("express");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

// Log all requests for debugging
router.use((req, res, next) => {
  console.log('Auth Route:', {
    method: req.method,
    path: req.path,
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    query: req.query,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Auth routes
router.post("/signup", authController.signup);
router.get("/verify-email", (req, res, next) => {
  console.log("Verify email route hit:", {
    query: req.query,
    path: req.path,
    url: req.url
  });
  authController.verifyEmail(req, res, next);
});
router.post("/login", authController.login);

// Protected routes
router.put("/profile", auth, authController.updateProfile);
router.put("/update-password", auth, authController.updatePassword);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;