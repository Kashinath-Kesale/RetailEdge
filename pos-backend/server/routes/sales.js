const express = require('express'); 
const router = express.Router();
const salesController = require('../controllers/salesController');
const { protect } = require('../middleware/auth');

// Create a new sale (protected route)
router.post('/', protect, salesController.createSale);

// Get all sales (protected route)
router.get('/', protect, salesController.getAllSales);

module.exports = router;
