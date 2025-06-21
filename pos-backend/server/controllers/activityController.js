const Activity = require('../models/Activity');
const User = require('../models/User');

// Create activity log
exports.createActivity = async (req, res) => {
  try {
    const { action, target, targetId, targetModel, details, status = 'SUCCESS', metadata = {} } = req.body;
    
    const activity = await Activity.create({
      user: req.user._id,
      action,
      target,
      targetId,
      targetModel,
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status,
      metadata
    });

    res.status(201).json({ 
      success: true,
      message: 'Activity logged successfully',
      activity 
    });
  } catch (error) {
    console.error('Activity creation error:', error);
    res.status(500).json({ message: 'Failed to log activity', error: error.message });
  }
};

// Get all activities (admin only)
exports.getAllActivities = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50
    } = req.query;

    const skip = (page - 1) * limit;
    
    const activities = await Activity.find()
      .populate('user', 'name email role')
      .populate('targetId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments();

    res.status(200).json({
      success: true,
      activities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Failed to fetch activities', error: error.message });
  }
};

// Delete activity (admin only)
exports.deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const activity = await Activity.findByIdAndDelete(id);
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.status(200).json({ 
      success: true,
      message: 'Activity deleted successfully' 
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ message: 'Failed to delete activity', error: error.message });
  }
};

// Clean up orphaned activities (admin only)
exports.cleanupOrphanedActivities = async (req, res) => {
  try {
    // Find activities that reference non-existent sales
    const orphanedSaleActivities = await Activity.find({
      targetModel: 'Sale',
      targetId: { $exists: true, $ne: null }
    });

    let deletedCount = 0;
    
    for (const activity of orphanedSaleActivities) {
      // Check if the referenced sale still exists
      const Sale = require('../models/Sale');
      const saleExists = await Sale.findById(activity.targetId);
      
      if (!saleExists) {
        await Activity.findByIdAndDelete(activity._id);
        deletedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Cleaned up ${deletedCount} orphaned activities`,
      deletedCount
    });
  } catch (error) {
    console.error('Cleanup orphaned activities error:', error);
    res.status(500).json({ message: 'Failed to cleanup orphaned activities', error: error.message });
  }
}; 