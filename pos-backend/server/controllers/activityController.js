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
      limit = 50, 
      user, 
      action, 
      target, 
      startDate, 
      endDate,
      status 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (user) filter.user = user;
    if (action) filter.action = action;
    if (target) filter.target = target;
    if (status) filter.status = status;
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const activities = await Activity.find(filter)
      .populate('user', 'name email role')
      .populate('targetId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments(filter);

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

// Get activities for specific user
exports.getUserActivities = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const activities = await Activity.find({ user: userId })
      .populate('user', 'name email role')
      .populate('targetId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments({ user: userId });

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
    console.error('Get user activities error:', error);
    res.status(500).json({ message: 'Failed to fetch user activities', error: error.message });
  }
};

// Get activity statistics
exports.getActivityStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    }

    const matchStage = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    const stats = await Activity.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            action: "$action",
            target: "$target"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.target",
          actions: {
            $push: {
              action: "$_id.action",
              count: "$count"
            }
          },
          totalCount: { $sum: "$count" }
        }
      }
    ]);

    // Get top users by activity
    const topUsers = await Activity.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$user",
          activityCount: { $sum: 1 }
        }
      },
      { $sort: { activityCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          user: {
            _id: 1,
            name: 1,
            email: 1,
            role: 1
          },
          activityCount: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats,
      topUsers
    });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({ message: 'Failed to fetch activity statistics', error: error.message });
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