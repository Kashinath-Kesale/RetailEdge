const Product = require('../models/Product');
const Activity = require('../models/Activity');

// Helper function to log activity
const logActivity = async (user, action, target, details, targetId = null, targetModel = null) => {
  try {
    await Activity.create({
      user: user._id,
      action,
      target,
      targetId,
      targetModel,
      details,
      status: 'SUCCESS'
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// Create product (admin only)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;

    if (!name || !price || quantity === undefined) {
      return res.status(400).json({ message: 'Name, price, and quantity are required' });
    }

    const product = new Product({ name, description, price, quantity, category });
    await product.save();
    
    // Log activity
    await logActivity(req.user, 'CREATE_PRODUCT', 'PRODUCT', `Created product: ${name}`, product._id, 'Product');
    
    // Transform product to include stock field for frontend compatibility
    const transformedProduct = {
      ...product.toObject(),
      stock: product.quantity
    };
    
    res.status(201).json({ message: 'Product created', product: transformedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all products (any role)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    
    // Transform products to include stock field for frontend compatibility
    const transformedProducts = products.map(product => ({
      ...product.toObject(),
      stock: product.quantity // Add stock field that maps to quantity
    }));
    
    res.json({ products: transformedProducts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update product (admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: 'Product not found' });

    const oldName = product.name;
    
    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;
    if (quantity !== undefined) product.quantity = quantity;
    if (category) product.category = category;

    await product.save();
    
    // Log activity
    await logActivity(req.user, 'UPDATE_PRODUCT', 'PRODUCT', `Updated product: ${oldName}`, product._id, 'Product');
    
    // Transform product to include stock field for frontend compatibility
    const transformedProduct = {
      ...product.toObject(),
      stock: product.quantity
    };
    
    res.json({ message: 'Product updated', product: transformedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Log activity
    await logActivity(req.user, 'DELETE_PRODUCT', 'PRODUCT', `Deleted product: ${product.name}`, product._id, 'Product');

    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 