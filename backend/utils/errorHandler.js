// Global error handler utility
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Wrong JWT token
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        err = new AppError(message, 400);
    }

    // JWT expired
    if (err.name === 'TokenExpiredError') {
        const message = 'Token has expired';
        err = new AppError(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = { AppError, asyncHandler, errorMiddleware };
