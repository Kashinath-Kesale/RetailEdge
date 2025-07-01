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
        // CRUD Operations
        "CREATE_PRODUCT",
        "UPDATE_PRODUCT", 
        "DELETE_PRODUCT",
        "CREATE_SALE",
        "DELETE_SALE",
        "CREATE_PAYMENT",
        "DELETE_PAYMENT",
        "CREATE_USER",
        "UPDATE_USER",
        "DELETE_USER",
        
        // User Activities
        "LOGIN",
        "LOGOUT",
        "PASSWORD_CHANGE",
        
        // Dashboard Activities
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
      required: false,
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