const express = require('express');
const router = express.Router();
const { getEmployerDashboard, getApplicantDashboard } = require('../controllers/dashboardController');
const { authMiddleware, employerMiddleware, applicantMiddleware } = require('../middleware/auth');

router.get('/employer', authMiddleware, employerMiddleware, getEmployerDashboard);
router.get('/applicant', authMiddleware, applicantMiddleware, getApplicantDashboard);

module.exports = router;
