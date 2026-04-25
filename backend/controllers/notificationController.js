const supabase = require('../config/supabase');

const getNotifications = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', req.user.id)
            .eq('read', false);

        if (error) throw error;
        res.json({ message: 'Notifications marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getNotifications, markAsRead };
