import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';
import logger from '../../config/logger';

interface ExtendedError extends HttpError {
    code?: string;
    errors?: Record<string, string>;
}

export const errorHandler = (err: ExtendedError, req: Request, res: Response, next: NextFunction) => {
    // Log the error
    logger.error('Error:', {
        message: err.message,
        code: err.code,
        status: err.status,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        errors: err.errors
    });

    // Default error
    const error = {
        status: 'error',
        code: err.code || 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'production' && err.status === 500
            ? 'An unexpected error occurred'
            : err.message,
    };

    // Add validation errors if present
    if (err.code === 'VALIDATION_ERROR' && err.errors) {
        Object.assign(error, { errors: err.errors });
    }

    // Send error response
    res.status(err.status || 500).json(error);
}; 