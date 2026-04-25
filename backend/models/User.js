const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Applicant', 'Employer'], required: true },
    
    // Applicant fields
    skills: [String],
    resume: String,
    experience: String,
    
    // Employer fields
    companyName: String,
    logo: String,
    description: String,
    verified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
