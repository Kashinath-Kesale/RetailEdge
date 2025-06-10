const Payment = require("../models/Payment");
const Sale = require("../models/Sale");

// Get all payments with populated sale information
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
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (err) {
    console.error("Payment fetch error:", err);
    res.status(500).json({ message: "Failed to fetch payments", error: err.message });
  }
};

// Create a new payment
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