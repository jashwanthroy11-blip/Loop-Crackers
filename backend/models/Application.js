const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resume_url: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Applied', 'Screening', 'Interview', 'Selected', 'Rejected'], 
        default: 'Applied' 
    },
    status_history: [{
        status: String,
        updated_at: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
