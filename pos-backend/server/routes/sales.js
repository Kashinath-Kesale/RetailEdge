const express = require('express'); 
const router = express.Router();
const salesController = require('../controllers/salesController');
const authMiddleware = require('../middleware/auth');

// Create a new sale (protected route)
router.post('/', authMiddleware, salesController.createSale);

// Get all sales (protected route)
router.get('/', authMiddleware, salesController.getAllSales);

module.exports = router;
