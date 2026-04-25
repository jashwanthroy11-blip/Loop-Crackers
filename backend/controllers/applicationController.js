const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getIo } = require('../services/socketService');
const { calculateMatchScore } = require('../services/matchingService');

const applyToJob = async (req, res) => {
    try {
        const { job_id, resume_url } = req.body;
        const applicant_id = req.user.id;

        const existingApp = await Application.findOne({ job_id, applicant_id });
        if (existingApp) return res.status(400).json({ message: 'Already applied' });

        const job = await Job.findById(job_id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const applicant = await User.findById(applicant_id);
        
        // AI Matching
        const matchResult = calculateMatchScore(applicant.skills, job.skills_required);

        const application = new Application({
            job_id,
            applicant_id,
            resume_url,
            status_history: [{ status: 'Applied' }]
        });
        
        await application.save();

        // Notify Employer
        const notification = new Notification({
            user_id: job.company_id,
            message: `New application received for ${job.title} with a ${matchResult.score}% skill match.`
        });
        await notification.save();

        // Emit Socket Event
        getIo().to(job.company_id.toString()).emit('new_application', { job_id, applicant_id, match: matchResult });

        res.status(201).json({ application, matchResult });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getApplicantApplications = async (req, res) => {
    try {
        const apps = await Application.find({ applicant_id: req.user.id }).populate('job_id', 'title company_id');
        res.json(apps);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getJobApplications = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (job.company_id.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        const apps = await Application.find({ job_id: req.params.jobId }).populate('applicant_id', 'name email skills');
        
        // Calculate match scores for all applicants dynamically
        const populatedApps = apps.map(app => {
            const match = calculateMatchScore(app.applicant_id.skills, job.skills_required);
            return { ...app.toObject(), matchScore: match.score, missingSkills: match.missing };
        });

        res.json(populatedApps);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const application = await Application.findById(req.params.id).populate('job_id');
        
        if (!application) return res.status(404).json({ message: 'Application not found' });
        
        if (application.job_id.company_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        application.status = status;
        application.status_history.push({ status });
        await application.save();

        // Notify Applicant
        const notification = new Notification({
            user_id: application.applicant_id,
            message: `Your application for ${application.job_id.title} is now: ${status}`
        });
        await notification.save();

        // Real-time update
        getIo().to(application.applicant_id.toString()).emit('status_updated', { 
            application_id: application._id, 
            status 
        });

        res.json(application);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { applyToJob, getApplicantApplications, getJobApplications, updateApplicationStatus };
