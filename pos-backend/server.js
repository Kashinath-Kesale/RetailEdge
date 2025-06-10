// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./server/config/db");

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration
const allowedOrigins = [
  'https://retailedge-app.vercel.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Middleware
app.use(express.json());

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
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
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
  console.log(`✅ Environment: ${process.env.NODE_ENV}`);
  console.log(`✅ Frontend URL: ${process.env.FRONTEND_URL}`);
});