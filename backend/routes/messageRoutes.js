const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/auth');

router.get('/:userId', authMiddleware, getMessages);
router.post('/', authMiddleware, sendMessage);

module.exports = router;
