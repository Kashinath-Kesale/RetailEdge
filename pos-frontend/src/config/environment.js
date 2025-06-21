// Environment configuration
const config = {
  // API Configuration
  API_URL: process.env.REACT_APP_API_URL || 'https://retailedge-backend.onrender.com',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  
  // Feature flags
  ENABLE_LOGGING: process.env.NODE_ENV === 'development',
  ENABLE_VERIFICATION: process.env.NODE_ENV !== 'development',
  
  // App configuration
  APP_NAME: 'RetailEdge',
  APP_VERSION: '1.0.0',
  
  // Timeout configurations
  REQUEST_TIMEOUT: 30000, // 30 seconds
  SESSION_TIMEOUT: 3600000, // 1 hour
};

export default config; 