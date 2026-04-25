const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user_id: req.user.id }).sort('-createdAt');
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ user_id: req.user.id, read: false }, { read: true });
        res.json({ message: 'Notifications marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getNotifications, markAsRead };
