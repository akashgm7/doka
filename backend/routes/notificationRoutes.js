const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// @desc  Get notifications for customers/all-users (public-facing store)
// @route GET /api/notifications
// @access Public
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find({
            target: 'All Users',
            status: 'Sent'
        })
            .sort({ sentAt: -1 })
            .limit(50)
            .lean();

        res.json(notifications);
    } catch (error) {
        console.error('[Notifications] Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
});

module.exports = router;
