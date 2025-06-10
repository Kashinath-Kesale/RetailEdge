const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, paymentController.createPayment);
router.get("/", authMiddleware, paymentController.getAllPayments);

module.exports = router;
