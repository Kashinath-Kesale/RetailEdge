const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// Protected dashboard routes
router.get('/summary', protect, dashboardController.getDashboardSummary);
router.get('/payment-methods', protect, dashboardController.getPaymentMethodsStats);
router.get('/top-products', protect, dashboardController.getTopProducts);

module.exports = router;
