const express = require('express');
const router = express.Router();
const { getBookmarks, addBookmark, removeBookmark } = require('../controllers/bookmarkController');
const { authMiddleware, applicantMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, applicantMiddleware, getBookmarks);
router.post('/', authMiddleware, applicantMiddleware, addBookmark);
router.delete('/:job_id', authMiddleware, applicantMiddleware, removeBookmark);

module.exports = router;
