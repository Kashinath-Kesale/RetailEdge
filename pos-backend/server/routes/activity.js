const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { protect } = require('../middleware/auth');
const restrictTo = require('../middleware/restrictTo');

// Create activity log (protected, any role)
router.post('/', protect, activityController.createActivity);

// Get all activities (admin only)
router.get('/', protect, restrictTo('admin'), activityController.getAllActivities);

// Get activity statistics (admin only)
router.get('/stats', protect, restrictTo('admin'), activityController.getActivityStats);

// Get activities for specific user (admin only)
router.get('/user/:userId', protect, restrictTo('admin'), activityController.getUserActivities);

// Delete activity (admin only)
router.delete('/:id', protect, restrictTo('admin'), activityController.deleteActivity);

module.exports = router; 