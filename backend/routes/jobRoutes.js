const express = require('express');
const router = express.Router();
const { createJob, getJobs, getJobById, updateJob, deleteJob } = require('../controllers/jobController');
const { authMiddleware, verifiedEmployerMiddleware } = require('../middleware/auth');

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', authMiddleware, verifiedEmployerMiddleware, createJob);
router.put('/:id', authMiddleware, verifiedEmployerMiddleware, updateJob);
router.delete('/:id', authMiddleware, verifiedEmployerMiddleware, deleteJob);

module.exports = router;
