const supabase = require('../config/supabase');
const { asyncHandler, AppError } = require('../utils/errorHandler');

// EMPLOYER DASHBOARD
const getEmployerDashboard = asyncHandler(async (req, res) => {
    const employerId = req.user.id;

    // Total jobs posted
    const { data: jobs, error: jobError } = await supabase
        .from('jobs')
        .select('id')
        .eq('company_id', employerId);

    if (jobError) throw new AppError('Failed to fetch jobs', 500);

    // Total applicants
    const { data: applicants, error: appError } = await supabase
        .from('applications')
        .select('id', { count: 'exact' })
        .in('job_id', jobs.map(j => j.id));

    if (appError) throw new AppError('Failed to fetch applicants', 500);

    // Status breakdown
    const { data: statusBreakdown } = await supabase
        .from('applications')
        .select('status')
        .in('job_id', jobs.map(j => j.id));

    const statusCounts = {
        applied: 0,
        shortlisted: 0,
        interview: 0,
        hired: 0,
        rejected: 0
    };

    statusBreakdown?.forEach(app => {
        const status = app.status.toLowerCase().replace(' ', '');
        if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status]++;
        }
    });

    res.json({
        totalJobs: jobs.length,
        totalApplicants: applicants.length,
        statusBreakdown: statusCounts,
        recentApplications: applicants.slice(0, 5)
    });
});

// APPLICANT DASHBOARD
const getApplicantDashboard = asyncHandler(async (req, res) => {
    const applicantId = req.user.id;

    // Total applications
    const { data: applications, error: appError } = await supabase
        .from('applications')
        .select('id, status')
        .eq('applicant_id', applicantId);

    if (appError) throw new AppError('Failed to fetch applications', 500);

    const statusCounts = {
        applied: 0,
        shortlisted: 0,
        interview: 0,
        hired: 0,
        rejected: 0
    };

    applications?.forEach(app => {
        const status = app.status.toLowerCase().replace(' ', '');
        if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status]++;
        }
    });

    res.json({
        totalApplications: applications.length,
        statusBreakdown: statusCounts,
        recentApplications: applications.slice(0, 5)
    });
});

module.exports = { getEmployerDashboard, getApplicantDashboard };
