const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

// Protected dashboard routes
router.get('/summary', authMiddleware, dashboardController.getDashboardSummary);
router.get('/payment-methods', authMiddleware, dashboardController.getPaymentMethodsStats);
router.get('/top-products', authMiddleware, dashboardController.getTopProducts);

module.exports = router;
