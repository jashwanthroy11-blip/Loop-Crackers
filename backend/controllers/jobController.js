const Job = require('../models/Job');

const createJob = async (req, res) => {
    try {
        const { title, description, skills_required, salary, location } = req.body;
        const job = new Job({
            title,
            description,
            skills_required,
            salary,
            location,
            company_id: req.user.id
        });
        await job.save();
        res.status(201).json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate('company_id', 'companyName logo');
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('company_id', 'companyName logo description');
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        
        if (job.company_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedJob);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.company_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await job.deleteOne();
        res.json({ message: 'Job removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob };
