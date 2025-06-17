const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const generateReceipt = require('../utils/generateReceipt');
const path = require('path');

// Create a new sale
exports.createSale = async (req, res) => {
  try {
    const { products, paymentMethod, customerName } = req.body;

    // Validate products array
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products must be a non-empty array' });
    }

    let totalAmount = 0;
    const saleProducts = [];

    // Validate stock, calculate totals, update product quantities
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }

      const priceAtSale = product.price;
      totalAmount += priceAtSale * item.quantity;

      product.quantity -= item.quantity;
      await product.save();

      saleProducts.push({
        product: product._id,
        quantity: item.quantity,
        priceAtSale,
      });
    }

    // Create and save the sale document
    const sale = await Sale.create({
      products: saleProducts,
      totalAmount,
      paymentMethod,
      customerName,
    });

    // Create payment record
    const payment = await Payment.create({
      sale: sale._id,
      amountPaid: totalAmount,
      paymentMethod,
      transactionId: `TXN${Date.now()}` // Generate a simple transaction ID
    });

    // Generate receipt PDF file path
    const receiptPath = path.join(__dirname, '..', 'receipts', `receipt_${sale._id}.pdf`);
    
    // Populate products for receipt generation
    const populatedSale = await Sale.findById(sale._id).populate('products.product');

    // Generate receipt
    await generateReceipt(populatedSale, receiptPath);

    res.status(201).json({ 
      message: 'Sale and payment recorded successfully', 
      sale,
      payment 
    });
  } catch (error) {
    console.error('Sale error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all sales
exports.getAllSales = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Sale.countDocuments();

    // Get sales with pagination and selective population
    const sales = await Sale.find()
      .populate('products.product', 'name price') // Only populate necessary fields
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      sales,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ message: 'Error retrieving sales', error: error.message });
  }
};