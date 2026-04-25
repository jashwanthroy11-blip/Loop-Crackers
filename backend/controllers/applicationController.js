const supabase = require('../config/supabase');
const { getIo } = require('../services/socketService');
const { calculateMatchScore } = require('../services/matchingService');

const applyToJob = async (req, res) => {
    try {
        const { job_id, resume_url } = req.body;
        const applicant_id = req.user.id;

        // check if already applied
        const { data: existingApp } = await supabase
            .from('applications')
            .select('*')
            .eq('job_id', job_id)
            .eq('applicant_id', applicant_id)
            .single();

        if (existingApp) return res.status(400).json({ message: 'Already applied' });

        // get job details
        const { data: job } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', job_id)
            .single();

        if (!job) return res.status(404).json({ message: 'Job not found' });

        // get applicant details
        const { data: applicant } = await supabase
            .from('users')
            .select('*')
            .eq('id', applicant_id)
            .single();
        
        // AI Matching
        const matchResult = calculateMatchScore(applicant.skills || [], job.skills_required || []);

        // insert application
        const { data: application, error } = await supabase
            .from('applications')
            .insert([{
                job_id,
                applicant_id,
                resume_url,
                status: 'Applied',
                status_history: [{ status: 'Applied', date: new Date().toISOString() }]
            }])
            .select()
            .single();
        
        if (error) throw error;

        // Notify Employer
        await supabase
            .from('notifications')
            .insert([{
                user_id: job.company_id,
                message: `New application received for ${job.title} with a ${matchResult.score}% skill match.`
            }]);

        // Emit Socket Event
        getIo().to(job.company_id.toString()).emit('new_application', { job_id, applicant_id, match: matchResult });

        res.status(201).json({ application, matchResult });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getApplicantApplications = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('applications')
            .select('*, job:jobs(title, company_id)')
            .eq('applicant_id', req.user.id);

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getJobApplications = async (req, res) => {
    try {
        const { data: job } = await supabase
            .from('jobs')
            .select('company_id, skills_required')
            .eq('id', req.params.jobId)
            .single();

        if (job.company_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        const { data: apps, error } = await supabase
            .from('applications')
            .select('*, applicant:users(name, email, skills)')
            .eq('job_id', req.params.jobId);
        
        if (error) throw error;

        // Calculate match scores
        const populatedApps = apps.map(app => {
            const match = calculateMatchScore(app.applicant?.skills || [], job.skills_required || []);
            return { ...app, matchScore: match.score, missingSkills: match.missing };
        });

        res.json(populatedApps);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const { data: application } = await supabase
            .from('applications')
            .select('*, job:jobs(title, company_id)')
            .eq('id', req.params.id)
            .single();
        
        if (!application) return res.status(404).json({ message: 'Application not found' });
        
        if (application.job.company_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const newHistory = [...(application.status_history || []), { status, date: new Date().toISOString() }];

        const { data: updatedApp, error } = await supabase
            .from('applications')
            .update({ 
                status,
                status_history: newHistory
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        // Notify Applicant
        await supabase
            .from('notifications')
            .insert([{
                user_id: application.applicant_id,
                message: `Your application for ${application.job.title} is now: ${status}`
            }]);

        // Real-time update
        getIo().to(application.applicant_id.toString()).emit('status_updated', { 
            application_id: application.id, 
            status 
        });

        res.json(updatedApp);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { applyToJob, getApplicantApplications, getJobApplications, updateApplicationStatus };
