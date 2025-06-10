const Sale = require("../models/Sale");
const Payment = require("../models/Payment");
const Product = require("../models/Product");
const { generateReceiptPDF } = require('../utils/generateReceiptPDF');

// Create a new sale
exports.createSale = async (req, res) => {
  try {
    const { products, customerName, customerEmail, paymentMethod, totalAmount } = req.body;

    // Validate products array
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products array is required and must not be empty' });
    }

    // Calculate total amount if not provided
    const calculatedTotal = products.reduce((sum, item) => sum + (item.priceAtSale * item.quantity), 0);
    const finalTotal = totalAmount || calculatedTotal;

    // Create sale document
    const sale = new Sale({
      products,
      customerName,
      customerEmail,
      paymentMethod,
      totalAmount: finalTotal,
      createdBy: req.user._id
    });

    // Create payment record
    const payment = new Payment({
      sale: sale._id,
      amount: finalTotal,
      method: paymentMethod,
      status: 'completed',
      createdBy: req.user._id
    });

    // Save both documents
    await Promise.all([sale.save(), payment.save()]);

    // Generate receipt PDF
    const receiptPath = await generateReceiptPDF(sale);

    // Populate sale with product details
    await sale.populate('products.product');

    res.status(201).json({
      success: true,
      message: 'Sale completed successfully',
      sale,
      payment,
      receiptPath
    });
  } catch (error) {
    console.error('Error in createSale:', error);
    res.status(500).json({ message: 'Error creating sale', error: error.message });
  }
};

// Get all sales
exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .select('_id products customerName customerEmail paymentMethod totalAmount createdAt')
      .populate({
        path: 'products.product',
        select: 'name sku price'
      })
      .sort({ createdAt: -1 }); // Sort by newest first
    res.status(200).json(sales);
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ message: 'Error retrieving sales', error: error.message });
  }
}; 