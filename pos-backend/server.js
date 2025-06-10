// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./server/config/db");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static PDF files (receipts)
app.use('/receipts', express.static(path.join(__dirname, 'receipts')));

// Routes
app.use("/api/auth", require("./server/routes/auth"));
app.use("/api/products", require("./server/routes/productRoutes"));
app.use("/api/sales", require("./server/routes/sales"));
app.use("/api/receipts", require("./server/routes/receiptRoutes"));
app.use("/api/dashboard", require("./server/routes/dashboard"));
app.use("/api/payments", require("./server/routes/payment"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    msg: 'Server error',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Catch-all for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ msg: "API endpoint not found" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});