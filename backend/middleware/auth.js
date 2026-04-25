const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const employerMiddleware = (req, res, next) => {
    if (req.user.role !== 'Employer') {
        return res.status(403).json({ message: 'Access denied: Employer only' });
    }
    next();
};

const verifiedEmployerMiddleware = (req, res, next) => {
    if (req.user.role !== 'Employer' || !req.user.verified) {
        return res.status(403).json({ message: 'Access denied: Verified Employer only' });
    }
    next();
};

const applicantMiddleware = (req, res, next) => {
    if (req.user.role !== 'Applicant') {
        return res.status(403).json({ message: 'Access denied: Applicant only' });
    }
    next();
};

module.exports = { authMiddleware, employerMiddleware, verifiedEmployerMiddleware, applicantMiddleware };
