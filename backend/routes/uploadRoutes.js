const express = require('express');
const router = express.Router();
const { uploadResume } = require('../config/cloudinary');
const { authMiddleware, applicantMiddleware } = require('../middleware/auth');
const supabase = require('../config/supabase');

router.post('/resume', authMiddleware, applicantMiddleware, uploadResume.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const resumeUrl = req.file.path;

        // Update user profile with resume URL
        const { data, error } = await supabase
            .from('users')
            .update({ resume_url: resumeUrl })
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Resume uploaded successfully', resume_url: resumeUrl, user: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
