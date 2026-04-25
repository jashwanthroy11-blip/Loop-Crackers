const express = require('express');
const router = express.Router();
const { applyToJob, getJobApplications, updateApplicationStatus, getMyApplications, getApplicationDetails } = require('../controllers/applicationController');
const { authMiddleware, applicantMiddleware, employerMiddleware } = require('../middleware/auth');

router.post('/apply', authMiddleware, applicantMiddleware, applyToJob);
router.get('/job/:job_id', authMiddleware, employerMiddleware, getJobApplications);
router.put('/:application_id/status', authMiddleware, employerMiddleware, updateApplicationStatus);
router.get('/me', authMiddleware, applicantMiddleware, getMyApplications);
router.get('/:application_id', authMiddleware, (req, res, next) => next(), getApplicationDetails);

module.exports = router;
