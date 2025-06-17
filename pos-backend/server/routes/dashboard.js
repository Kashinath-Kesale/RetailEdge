const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

// Protected dashboard routes
router.get('/summary', authMiddleware, (req, res) => dashboardController.getDashboardSummary(req, res));
router.get('/payment-methods', authMiddleware, (req, res) => dashboardController.getPaymentMethodsStats(req, res));
router.get('/top-products', authMiddleware, (req, res) => dashboardController.getTopProducts(req, res));

module.exports = router;
