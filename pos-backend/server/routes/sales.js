const express = require('express'); 
const router = express.Router();
const salesController = require('../controllers/salesController');
const { protect } = require('../middleware/auth');
const restrictTo = require('../middleware/restrictTo');

// Test endpoint (no auth required)
router.get('/test', salesController.testSale);

// Create a new sale (protected route)
router.post('/', protect, salesController.createSale);

// Get all sales (protected route)
router.get('/', protect, salesController.getAllSales);

// Delete a sale (admin only)
router.delete('/:id', protect, restrictTo('admin'), salesController.deleteSale);

module.exports = router;
