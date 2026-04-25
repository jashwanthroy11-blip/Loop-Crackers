const express = require('express');
const router = express.Router();
const { applyToJob, getApplicantApplications, getJobApplications, updateApplicationStatus } = require('../controllers/applicationController');
const { authMiddleware, applicantMiddleware, employerMiddleware } = require('../middleware/auth');

router.post('/apply', authMiddleware, applicantMiddleware, applyToJob);
router.get('/user', authMiddleware, applicantMiddleware, getApplicantApplications);
router.get('/job/:jobId', authMiddleware, employerMiddleware, getJobApplications);
router.put('/status/:id', authMiddleware, employerMiddleware, updateApplicationStatus);

module.exports = router;
