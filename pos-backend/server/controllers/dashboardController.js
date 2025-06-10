const Product = require('../models/Product');
const Sale = require('../models/Sale');

// GET /api/dashboard/summary
exports.getDashboardSummary = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalSales = await Sale.countDocuments();
    const totalRevenue = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    res.status(200).json({
      totalProducts,
      totalSales,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/dashboard/payment-methods
exports.getPaymentMethodsStats = async (req, res) => {
  try {
    const stats = await Sale.aggregate([
      { $group: { _id: "$paymentMethod", count: { $sum: 1 } } }
    ]);
    res.status(200).json({ paymentStats: stats });
  } catch (error) {
    console.error('Payment method stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/dashboard/top-products
exports.getTopProducts = async (req, res) => {
  try {
    const stats = await Sale.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalSold: { $sum: "$products.quantity" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" }
    ]);

    res.status(200).json({ topProducts: stats });
  } catch (error) {
    console.error('Top products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
