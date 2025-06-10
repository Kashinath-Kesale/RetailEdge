const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const restrictTo = require('../middleware/restrictTo');

// Create product (admin only)
router.post('/', auth, restrictTo('admin'), async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;

    if (!name || !price || quantity === undefined) {
      return res.status(400).json({ message: 'Name, price, and quantity are required' });
    }

    const product = new Product({ name, description, price, quantity, category });
    await product.save();
    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all products (any role)
router.get('/', auth, restrictTo('admin', 'cashier', 'viewer'), async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product (admin only)
router.put('/:id', auth, restrictTo('admin'), async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;
    if (quantity !== undefined) product.quantity = quantity;
    if (category) product.category = category;

    await product.save();
    res.json({ message: 'Product updated', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete product (admin only)
router.delete('/:id', auth, restrictTo('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
