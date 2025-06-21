const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/restrictTo');

// All routes require authentication
router.use(protect);

// Get all activities (admin only)
router.get('/', restrictTo('admin'), activityController.getAllActivities);

// Create activity log
router.post('/', activityController.createActivity);

// Delete activity (admin only)
router.delete('/:id', restrictTo('admin'), activityController.deleteActivity);

module.exports = router; 