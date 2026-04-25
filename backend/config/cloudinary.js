const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer storage for resumes (PDF)
const resumeStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'alignflow/resumes',
        resource_type: 'raw',
        allowed_formats: ['pdf', 'doc', 'docx'],
        public_id: (req, file) => `resume_${req.user.id}_${Date.now()}`
    }
});

const uploadResume = multer({ 
    storage: resumeStorage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = { uploadResume, cloudinary };
