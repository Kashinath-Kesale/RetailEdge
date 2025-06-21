// Load environment variables from .env file
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./server/config/db");

const authRoutes = require("./server/routes/auth");
const dashboardRoutes = require("./server/routes/dashboard");
const paymentRoutes = require("./server/routes/payment");
const productRoutes = require("./server/routes/productRoutes");
const salesRoutes = require("./server/routes/sales");
const receiptRoutes = require("./server/routes/receiptRoutes");
const activityRoutes = require("./server/routes/activity");

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM',
  'FRONTEND_URL',
  'BACKEND_URL'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// ✅ CORS Setup
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve receipts
app.use('/receipts', express.static(path.join(__dirname, 'server/receipts')));

// Log all requests
app.use((req, res, next) => {
  console.log('Incoming Request:', {
    method: req.method,
    path: req.path,
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    query: req.query,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Root route handler
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'RetailEdge API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      sales: '/api/sales',
      receipts: '/api/receipts',
      payments: '/api/payments',
      dashboard: '/api/dashboard'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ✅ API Routes
console.log('Mounting routes...');
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/activity", activityRoutes);

// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ✅ 404 Catch-All
app.use((req, res) => {
  console.log("404 Not Found:", {
    path: req.path,
    method: req.method,
    query: req.query,
    headers: req.headers
  });
  res.status(404).json({
    message: "API endpoint not found",
    path: req.path,
    method: req.method
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    BACKEND_URL: process.env.BACKEND_URL,
    MONGO_URI: process.env.MONGO_URI ? 'Set' : 'Not Set',
    JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not Set',
    SMTP_HOST: process.env.SMTP_HOST ? 'Set' : 'Not Set',
    SMTP_PORT: process.env.SMTP_PORT ? 'Set' : 'Not Set',
    SMTP_USER: process.env.SMTP_USER ? 'Set' : 'Not Set',
    SMTP_PASS: process.env.SMTP_PASS ? 'Set' : 'Not Set',
    EMAIL_FROM: process.env.EMAIL_FROM ? 'Set' : 'Not Set'
  });
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`Backend URL: ${process.env.BACKEND_URL}`);
  console.log('Allowed Origins:', allowedOrigins);
});
