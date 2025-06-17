const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const receiptController = require("../controllers/receiptController");

// Routes for receipts
router.get("/", protect, receiptController.getAllReceipts);
router.get("/pdf/:saleId", protect, receiptController.getReceiptPDF);

module.exports = router;
