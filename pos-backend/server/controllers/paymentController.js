const Payment = require("../models/Payment");
const Sale = require("../models/Sale");

exports.createPayment = async (req, res) => {
  try {
    const { sale, amountPaid, paymentMethod, transactionId } = req.body;

    const relatedSale = await Sale.findById(sale);
    if (!relatedSale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    const payment = await Payment.create({
      sale,
      amountPaid,
      paymentMethod,
      transactionId,
    });

    res.status(201).json({ message: "Payment recorded", payment });
  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'sale',
        populate: {
          path: 'products.product',
          model: 'Product'
        }
      })
      .sort({ createdAt: -1 }); // Sort by newest first

    // Transform payments to include stock field in populated products
    const transformedPayments = payments.map(payment => {
      const paymentObj = payment.toObject();
      if (paymentObj.sale && paymentObj.sale.products) {
        paymentObj.sale.products = paymentObj.sale.products.map(product => ({
          ...product,
          product: product.product ? {
            ...product.product,
            stock: product.product.quantity
          } : product.product
        }));
      }
      return paymentObj;
    });

    res.status(200).json(transformedPayments);
  } catch (err) {
    console.error("Payment fetch error:", err);
    res.status(500).json({ message: "Failed to fetch payments", error: err.message });
  }
};