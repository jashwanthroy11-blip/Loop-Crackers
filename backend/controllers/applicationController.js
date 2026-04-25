const supabase = require('../config/supabase');
const { getIo } = require('../services/socketService');
const { calculateMatchScore } = require('../services/matchingService');
const { asyncHandler, AppError } = require('../utils/errorHandler');

// APPLY TO JOB
const applyToJob = asyncHandler(async (req, res) => {
    const { job_id, resume_url } = req.body;
    const applicant_id = req.user.id;

    // Check if already applied
    const { data: existingApp, error: checkError } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', job_id)
        .eq('applicant_id', applicant_id)
        .single();

    if (existingApp) throw new AppError('Already applied to this job', 400);

    // Get job details
    const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('*, company:users(id, companyName)')
        .eq('id', job_id)
        .single();

    if (jobError || !job) throw new AppError('Job not found', 404);

    // Get applicant details
    const { data: applicant, error: appError } = await supabase
        .from('users')
        .select('*')
        .eq('id', applicant_id)
        .single();

    if (appError) throw new AppError('Applicant not found', 404);

    // Calculate match score
    const matchResult = calculateMatchScore(
        applicant.skills ? applicant.skills.split(',') : [],
        job.skills_required ? job.skills_required.split(',') : []
    );

    // Create application
    const { data: application, error: createError } = await supabase
        .from('applications')
        .insert([{
            job_id,
            applicant_id,
            company_id: job.company_id,
            resume_url,
            status: 'Applied',
            match_score: matchResult.score,
            status_history: [{ status: 'Applied', timestamp: new Date().toISOString(), comment: 'Application submitted' }]
        }])
        .select()
        .single();

    if (createError) throw new AppError('Failed to apply', 500);

    // Notify employer
    getIo().to(job.company_id).emit('new_application', {
        jobId: job_id,
        applicantName: applicant.name,
        applicationId: application.id,
        matchScore: matchResult.score
    });

    // Create notification
    await supabase
        .from('notifications')
        .insert([{
            user_id: job.company_id,
            type: 'new_application',
            message: `${applicant.name} applied for ${job.title}`,
            related_id: application.id
        }]);

    res.status(201).json(application);
});

// GET APPLICATIONS FOR A JOB (EMPLOYER)
const getJobApplications = asyncHandler(async (req, res) => {
    const { job_id } = req.params;
    const page = req.query.page || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    // Verify job belongs to employer
    const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('company_id')
        .eq('id', job_id)
        .single();

    if (jobError || job.company_id !== req.user.id) {
        throw new AppError('Unauthorized', 403);
    }

    // Get applications with pagination
    const { data: applications, count } = await supabase
        .from('applications')
        .select('*, applicant:users(id, name, email, skills, resume_url)', { count: 'exact' })
        .eq('job_id', job_id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (!applications) throw new AppError('Failed to fetch applications', 500);

    res.json({
        applications,
        totalCount: count,
        page,
        totalPages: Math.ceil(count / limit)
    });
});

// UPDATE APPLICATION STATUS
const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { application_id } = req.params;
    const { status, comment } = req.body;

    // Valid statuses
    const validStatuses = ['Applied', 'Shortlisted', 'Interview', 'Hired', 'Rejected'];
    if (!validStatuses.includes(status)) {
        throw new AppError('Invalid status', 400);
    }

    // Get application
    const { data: application, error: fetchError } = await supabase
        .from('applications')
        .select('*')
        .eq('id', application_id)
        .single();

    if (fetchError || !application) throw new AppError('Application not found', 404);

    // Verify employer owns this job
    const { data: job } = await supabase
        .from('jobs')
        .select('company_id')
        .eq('id', application.job_id)
        .single();

    if (job.company_id !== req.user.id) {
        throw new AppError('Unauthorized', 403);
    }

    // Update status history
    const statusHistory = application.status_history || [];
    statusHistory.push({
        status,
        timestamp: new Date().toISOString(),
        comment: comment || ''
    });

    // Update application
    const { data: updated, error: updateError } = await supabase
        .from('applications')
        .update({
            status,
            status_history: statusHistory,
            updated_at: new Date().toISOString()
        })
        .eq('id', application_id)
        .select()
        .single();

    if (updateError) throw new AppError('Failed to update status', 500);

    // Notify applicant
    getIo().to(application.applicant_id).emit('status_update', {
        applicationId: application_id,
        status,
        message: comment
    });

    // Create notification
    await supabase
        .from('notifications')
        .insert([{
            user_id: application.applicant_id,
            type: 'status_update',
            message: `Your application status changed to ${status}`,
            related_id: application_id
        }]);

    res.json(updated);
});

// GET APPLICANT APPLICATIONS
const getMyApplications = asyncHandler(async (req, res) => {
    const applicant_id = req.user.id;
    const page = req.query.page || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const { data: applications, count, error } = await supabase
        .from('applications')
        .select('*, job:jobs(id, title, location, company_id, company:users(companyName, logo))', { count: 'exact' })
        .eq('applicant_id', applicant_id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw new AppError('Failed to fetch applications', 500);

    res.json({
        applications,
        totalCount: count,
        page,
        totalPages: Math.ceil(count / limit)
    });
});

// GET APPLICATION DETAILS
const getApplicationDetails = asyncHandler(async (req, res) => {
    const { application_id } = req.params;

    const { data: application, error } = await supabase
        .from('applications')
        .select('*, job:jobs(*, company:users(companyName)), applicant:users(name, email, phone, skills)')
        .eq('id', application_id)
        .single();

    if (error || !application) throw new AppError('Application not found', 404);

    // Verify access
    if (application.applicant_id !== req.user.id && application.company_id !== req.user.id) {
        throw new AppError('Unauthorized', 403);
    }

    res.json(application);
});

module.exports = {
    applyToJob,
    getJobApplications,
    updateApplicationStatus,
    getMyApplications,
    getApplicationDetails
};
