const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const restrictTo = require('../middleware/restrictTo');
const productController = require('../controllers/productController');

// Create product (admin only)
router.post('/', protect, restrictTo('admin'), productController.createProduct);

// Get all products (any role)
router.get('/', protect, restrictTo('admin', 'cashier', 'viewer'), productController.getAllProducts);

// Update product (admin only)
router.put('/:id', protect, restrictTo('admin'), productController.updateProduct);

// Delete product (admin only)
router.delete('/:id', protect, restrictTo('admin'), productController.deleteProduct);

module.exports = router;
