const Activity = require('../models/Activity');

// Activity logger middleware
const logActivity = (action, target, details, targetModel = null) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;
    
    // Override send function to capture response
    res.send = function(data) {
      // Restore original send
      res.send = originalSend;
      
      // Log activity after response is sent
      try {
        const responseData = JSON.parse(data);
        const status = responseData.success ? 'SUCCESS' : 'FAILED';
        
        // Extract target ID from response if available
        let targetId = null;
        if (responseData.product) targetId = responseData.product._id;
        else if (responseData.sale) targetId = responseData.sale._id;
        else if (responseData.payment) targetId = responseData.payment._id;
        else if (responseData.user) targetId = responseData.user._id;
        else if (req.params.id) targetId = req.params.id;
        
        // Create activity log
        Activity.create({
          user: req.user._id,
          action,
          target,
          targetId,
          targetModel,
          details,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          status,
          metadata: {
            method: req.method,
            url: req.originalUrl,
            responseStatus: res.statusCode
          }
        }).catch(err => {
          console.error('Failed to log activity:', err);
        });
      } catch (error) {
        console.error('Error parsing response for activity logging:', error);
      }
      
      // Call original send
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Specific activity loggers for common operations
const activityLoggers = {
  // Product operations
  logProductCreate: logActivity('CREATE_PRODUCT', 'PRODUCT', 'Created new product', 'Product'),
  logProductUpdate: logActivity('UPDATE_PRODUCT', 'PRODUCT', 'Updated product', 'Product'),
  logProductDelete: logActivity('DELETE_PRODUCT', 'PRODUCT', 'Deleted product', 'Product'),
  logProductsView: logActivity('VIEW_PRODUCTS', 'PRODUCT', 'Viewed products list'),
  
  // Sale operations
  logSaleCreate: logActivity('CREATE_SALE', 'SALE', 'Created new sale', 'Sale'),
  logSalesView: logActivity('VIEW_SALES', 'SALE', 'Viewed sales list'),
  logReceiptView: logActivity('VIEW_RECEIPT', 'SALE', 'Viewed sale receipt'),
  
  // Payment operations
  logPaymentCreate: logActivity('CREATE_PAYMENT', 'PAYMENT', 'Created new payment', 'Payment'),
  logPaymentsView: logActivity('VIEW_PAYMENTS', 'PAYMENT', 'Viewed payments list'),
  logPaymentDelete: logActivity('DELETE_PAYMENT', 'PAYMENT', 'Deleted payment', 'Payment'),
  
  // User operations
  logUserCreate: logActivity('CREATE_USER', 'USER', 'Created new user', 'User'),
  logUserUpdate: logActivity('UPDATE_USER', 'USER', 'Updated user', 'User'),
  logUserDelete: logActivity('DELETE_USER', 'USER', 'Deleted user', 'User'),
  logUserLogin: logActivity('LOGIN', 'USER', 'User logged in'),
  logUserLogout: logActivity('LOGOUT', 'USER', 'User logged out'),
  logPasswordChange: logActivity('PASSWORD_CHANGE', 'USER', 'Password changed'),
  
  // Dashboard operations
  logDashboardView: logActivity('VIEW_DASHBOARD', 'DASHBOARD', 'Viewed dashboard'),
  logReportsView: logActivity('VIEW_REPORTS', 'DASHBOARD', 'Viewed reports'),
  
  // Custom activity logger
  logCustom: (action, target, details, targetModel) => logActivity(action, target, details, targetModel)
};

module.exports = activityLoggers; 