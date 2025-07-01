const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Activity = require('../models/Activity');
const generateReceipt = require('../utils/generateReceipt');
const path = require('path');
const fs = require('fs');

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

// Create a new sale
exports.createSale = async (req, res) => {
  try {
    console.log('Creating sale with data:', req.body);
    const { products, paymentMethod, customerName, customerEmail } = req.body;

    // Validate products array
    if (!products || !Array.isArray(products) || products.length === 0) {
      console.log('Invalid products data:', products);
      return res.status(400).json({ message: 'Products must be a non-empty array' });
    }

    // Validate payment method
    if (!paymentMethod) {
      console.log('Missing payment method');
      return res.status(400).json({ message: 'Payment method is required' });
    }

    console.log('Products to process:', products);

    let totalAmount = 0;
    const saleProducts = [];

    // Validate stock, calculate totals, update product quantities
    for (const item of products) {
      console.log('Processing product item:', item);
      const product = await Product.findById(item.product);
      console.log('Found product:', product);
      
      if (!product) {
        console.log('Product not found for ID:', item.product);
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      if (product.quantity < item.quantity) {
        console.log('Insufficient stock:', { productQuantity: product.quantity, requestedQuantity: item.quantity });
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }

      const priceAtSale = product.price;
      totalAmount += priceAtSale * item.quantity;
      console.log('Updated total amount:', totalAmount);

      product.quantity -= item.quantity;
      await product.save();
      console.log('Product stock updated:', { productId: product._id, newQuantity: product.quantity });

      saleProducts.push({
        product: product._id,
        quantity: item.quantity,
        priceAtSale,
      });
    }

    // Validate total amount
    if (typeof totalAmount !== 'number' || totalAmount <= 0) {
      console.log('Invalid total amount:', totalAmount);
      return res.status(400).json({ message: 'Total amount must be a positive number' });
    }

    console.log('Creating sale with data:', { saleProducts, totalAmount, paymentMethod, customerName, customerEmail });
    
    // Create and save the sale document
    const sale = await Sale.create({
      products: saleProducts,
      totalAmount,
      paymentMethod,
      customerName,
      customerEmail,
    });
    console.log('Sale created successfully:', sale);

    console.log('Creating payment with data:', { saleId: sale._id, amountPaid: totalAmount, paymentMethod });
    
    // Create payment record
    const payment = await Payment.create({
      sale: sale._id,
      amountPaid: totalAmount,
      paymentMethod,
      transactionId: `TXN${Date.now()}` // Generate a simple transaction ID
    });
    console.log('Payment created successfully:', payment);

    // Try to generate receipt PDF (optional - won't fail the sale if it fails)
    try {
      // Create receipts directory if it doesn't exist
      const receiptsDir = path.join(__dirname, '..', 'receipts');
      console.log('Receipts directory path:', receiptsDir);
      
      if (!fs.existsSync(receiptsDir)) {
        console.log('Creating receipts directory...');
        fs.mkdirSync(receiptsDir, { recursive: true });
        console.log('Receipts directory created successfully');
      }

      // Generate receipt PDF file path
      const receiptPath = path.join(receiptsDir, `receipt_${sale._id}.pdf`);
      console.log('Receipt file path:', receiptPath);
      
      // Populate products for receipt generation
      const populatedSale = await Sale.findById(sale._id).populate('products.product');
      console.log('Populated sale for receipt:', populatedSale);

      // Generate receipt
      await generateReceipt(populatedSale, receiptPath);
      console.log('Receipt generated successfully');
    } catch (receiptError) {
      console.error('Receipt generation failed:', receiptError);
      console.error('Receipt error stack:', receiptError.stack);
      // Don't fail the sale if receipt generation fails
    }

    console.log('Sending success response');
    
    // Log activity
    await logActivity(req.user, 'CREATE_SALE', 'SALE', `Created sale with ${saleProducts.length} products, total: ₹${totalAmount}`, sale._id, 'Sale');
    
    res.status(201).json({ 
      success: true,
      message: 'Sale and payment recorded successfully', 
      sale,
      payment 
    });
    console.log('Response sent successfully');
  } catch (error) {
    console.error('Sale error:', error);
    console.error('Sale error stack:', error.stack);
    console.error('Sale error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all sales
exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('products.product')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    // Transform sales to include stock field in populated products
    const transformedSales = sales.map(sale => {
      const saleObj = sale.toObject();
      if (saleObj.products) {
        saleObj.products = saleObj.products.map(product => ({
          ...product,
          product: product.product ? {
            ...product.product,
            stock: product.product.quantity
          } : product.product
        }));
      }
      return saleObj;
    });
    
    res.status(200).json(transformedSales);
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ message: 'Error retrieving sales', error: error.message });
  }
};

// Test endpoint for debugging
exports.testSale = async (req, res) => {
  try {
    console.log('Test sale endpoint called');
    res.status(200).json({ 
      success: true,
      message: 'Test sale endpoint working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test sale error:', error);
    res.status(500).json({ message: 'Test sale error', error: error.message });
  }
};

// Delete a sale
exports.deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting sale with ID:', id);

    // Find the sale first to get its details
    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Restore product quantities
    for (const productItem of sale.products) {
      const product = await Product.findById(productItem.product);
      if (product) {
        product.quantity += productItem.quantity;
        await product.save();
        console.log(`Restored ${productItem.quantity} units to product ${product.name}`);
      }
    }

    // Delete related payments
    await Payment.deleteMany({ sale: sale._id });
    console.log('Related payments deleted');

    // Delete related activities
    await Activity.deleteMany({ 
      targetId: sale._id, 
      targetModel: 'Sale' 
    });
    console.log('Related activities deleted');

    // Delete the sale
    await Sale.findByIdAndDelete(sale._id);
    console.log('Sale deleted successfully');

    // Log the deletion activity
    await logActivity(req.user, 'DELETE_SALE', 'SALE', `Deleted sale with ${sale.products.length} products, total: ₹${sale.totalAmount}`, sale._id, 'Sale');

    res.status(200).json({ 
      success: true,
      message: 'Sale deleted successfully',
      deletedSale: {
        id: sale._id,
        totalAmount: sale.totalAmount,
        productsCount: sale.products.length
      }
    });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({ message: 'Error deleting sale', error: error.message });
  }
};