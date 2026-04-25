const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { getIo } = require('../services/socketService');

const getMessages = async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const currentUserId = req.user.id;

        const messages = await Message.find({
            $or: [
                { sender_id: currentUserId, receiver_id: otherUserId },
                { sender_id: otherUserId, receiver_id: currentUserId }
            ]
        }).sort('timestamp');

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { receiver_id, message } = req.body;
        const sender_id = req.user.id;

        const newMessage = new Message({
            sender_id,
            receiver_id,
            message
        });
        await newMessage.save();

        // Notification
        const notification = new Notification({
            user_id: receiver_id,
            message: `You have a new message from a user.` // In a real app, populate user name
        });
        await notification.save();

        // Real-time update
        getIo().to(receiver_id).emit('new_message', newMessage);

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getMessages, sendMessage };
