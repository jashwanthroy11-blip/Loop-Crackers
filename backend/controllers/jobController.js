const supabase = require('../config/supabase');

const createJob = async (req, res) => {
    try {
        const { title, description, skills_required, location } = req.body;
        const { data, error } = await supabase
            .from('jobs')
            .insert([{
                title,
                description,
                skills_required,
                location,
                company_id: req.user.id
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getJobs = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('jobs')
            .select('*, company:users(companyName, logo)');
        
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getJobById = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('jobs')
            .select('*, company:users(companyName, logo, description)')
            .eq('id', req.params.id)
            .single();

        if (error || !data) return res.status(404).json({ message: 'Job not found' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateJob = async (req, res) => {
    try {
        const { data: job } = await supabase
            .from('jobs')
            .select('company_id')
            .eq('id', req.params.id)
            .single();

        if (!job) return res.status(404).json({ message: 'Job not found' });
        
        if (job.company_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { data: updatedJob, error } = await supabase
            .from('jobs')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(updatedJob);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteJob = async (req, res) => {
    try {
        const { data: job } = await supabase
            .from('jobs')
            .select('company_id')
            .eq('id', req.params.id)
            .single();

        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.company_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Job removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob };
