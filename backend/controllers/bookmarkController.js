const supabase = require('../config/supabase');
const { asyncHandler, AppError } = require('../utils/errorHandler');

// GET ALL BOOKMARKS
const getBookmarks = asyncHandler(async (req, res) => {
    const { data, error } = await supabase
        .from('bookmarks')
        .select('*, job:jobs(*, company:users(companyName, logo))')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });

    if (error) throw new AppError('Failed to fetch bookmarks', 500);

    res.json(data);
});

// ADD BOOKMARK
const addBookmark = asyncHandler(async (req, res) => {
    const { job_id } = req.body;

    const { data: existing, error: checkError } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('job_id', job_id)
        .maybeSingle();

    if (existing) return res.status(400).json({ message: 'Already bookmarked' });

    const { data, error } = await supabase
        .from('bookmarks')
        .insert([{ user_id: req.user.id, job_id }])
        .select()
        .single();

    if (error) throw new AppError('Failed to add bookmark', 500);

    res.status(201).json(data);
});

// REMOVE BOOKMARK
const removeBookmark = asyncHandler(async (req, res) => {
    const { job_id } = req.params;

    const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', req.user.id)
        .eq('job_id', job_id);

    if (error) throw new AppError('Failed to remove bookmark', 500);

    res.json({ message: 'Bookmark removed' });
});

module.exports = { getBookmarks, addBookmark, removeBookmark };
