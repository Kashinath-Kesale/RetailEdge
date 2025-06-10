const Sale = require('../models/Sale');
const fs = require('fs');
const path = require('path');

const receiptController = {
    // GET: All Receipts Summary
    getAllReceipts: async (req, res) => {
        try {
            const sales = await Sale.find().sort({ createdAt: -1 });

            const receipts = sales.map((sale) => ({
                _id: sale._id,
                customerName: sale.customerName || 'N/A',
                paymentMethod: sale.paymentMethod,
                createdAt: sale.createdAt,
                totalAmount: sale.totalAmount,
            }));

            res.status(200).json({ receipts });
        } catch (err) {
            console.error("Failed to fetch receipts:", err);
            res.status(500).json({ message: "Server error" });
        }
    },

    // GET: Specific Receipt PDF
    getReceiptPDF: (req, res) => {
        const { saleId } = req.params;

        // Sanitize saleId for safety
        if (!saleId || typeof saleId !== 'string') {
            return res.status(400).json({ message: 'Invalid sale ID' });
        }

        const filePath = path.join(__dirname, '..', 'receipts', `receipt_${saleId}.pdf`);

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                return res.status(404).json({ message: 'Receipt PDF not found' });
            }

            res.sendFile(filePath);
        });
    }
};

module.exports = receiptController;
