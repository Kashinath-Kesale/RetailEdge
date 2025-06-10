const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const receiptController = require("../controllers/receiptController");

// Routes for receipts
router.get("/", authMiddleware, receiptController.getAllReceipts);
router.get("/pdf/:saleId", authMiddleware, receiptController.getReceiptPDF);

module.exports = router;
