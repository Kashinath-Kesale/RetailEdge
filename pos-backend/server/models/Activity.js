const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        // Product operations
        "CREATE_PRODUCT",
        "UPDATE_PRODUCT", 
        "DELETE_PRODUCT",
        "VIEW_PRODUCTS",
        
        // Sale operations
        "CREATE_SALE",
        "VIEW_SALES",
        "VIEW_RECEIPT",
        
        // Payment operations
        "CREATE_PAYMENT",
        "VIEW_PAYMENTS",
        "DELETE_PAYMENT",
        
        // User operations
        "CREATE_USER",
        "UPDATE_USER",
        "DELETE_USER",
        "LOGIN",
        "LOGOUT",
        "PASSWORD_CHANGE",
        
        // Dashboard operations
        "VIEW_DASHBOARD",
        "VIEW_REPORTS",
        
        // System operations
        "SYSTEM_LOGIN",
        "SYSTEM_LOGOUT"
      ],
    },
    target: {
      type: String,
      required: true,
      enum: [
        "PRODUCT",
        "SALE", 
        "PAYMENT",
        "USER",
        "DASHBOARD",
        "SYSTEM"
      ],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'targetModel',
    },
    targetModel: {
      type: String,
      enum: ["Product", "Sale", "Payment", "User"],
    },
    details: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "PENDING"],
      default: "SUCCESS",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { 
    timestamps: true,
    // Add index for better query performance
    indexes: [
      { user: 1, createdAt: -1 },
      { action: 1, createdAt: -1 },
      { target: 1, createdAt: -1 },
      { createdAt: -1 }
    ]
  }
);

module.exports = mongoose.model("Activity", activitySchema); 