const express = require("express");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");

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

// Public routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Protected routes
router.put("/profile", protect, authController.updateProfile);
router.put("/update-password", protect, authController.updatePassword);
router.post("/logout", protect, authController.logout);
router.post("/create-user", protect, authController.createUser);

module.exports = router;