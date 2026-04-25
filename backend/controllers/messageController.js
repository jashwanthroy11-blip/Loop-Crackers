const supabase = require('../config/supabase');
const { getIo } = require('../services/socketService');

const getMessages = async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const currentUserId = req.user.id;

        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { receiver_id, message } = req.body;
        const sender_id = req.user.id;

        const { data: newMessage, error } = await supabase
            .from('messages')
            .insert([{
                sender_id,
                receiver_id,
                message
            }])
            .select()
            .single();

        if (error) throw error;

        // Notification
        await supabase
            .from('notifications')
            .insert([{
                user_id: receiver_id,
                message: `You have a new message.`
            }]);

        // Real-time update
        getIo().to(receiver_id).emit('new_message', newMessage);

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getMessages, sendMessage };
