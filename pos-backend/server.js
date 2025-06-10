// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./server/config/db");
const authRoutes = require("./server/routes/auth");
const dashboardRoutes = require("./server/routes/dashboard");
const paymentRoutes = require("./server/routes/payment");

const app = express();

// Connect to MongoDB
connectDB();

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['https://retailedge-app.vercel.app', 'http://localhost:3000'];

console.log('Allowed Origins:', allowedOrigins);
console.log('Environment:', process.env.NODE_ENV);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('CORS blocked request from:', origin);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    console.log('CORS allowed request from:', origin);
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
app.use(express.urlencoded({ extended: true }));

// Serve static PDF files (receipts)
app.use('/receipts', express.static(path.join(__dirname, 'server/receipts')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", require("./server/routes/productRoutes"));
app.use("/api/sales", require("./server/routes/sales"));
app.use("/api/receipts", require("./server/routes/receiptRoutes"));
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/payments", paymentRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    message: "Server is running",
    environment: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL,
    allowedOrigins: allowedOrigins
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    headers: req.headers
  });

  res.status(500).json({
    msg: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Catch-all for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ msg: "API endpoint not found" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Frontend URL:', process.env.FRONTEND_URL);
  console.log('Allowed Origins:', allowedOrigins);
});