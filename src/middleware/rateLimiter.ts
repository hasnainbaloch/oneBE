import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';
import logger from '../config/logger';

// Create rate limiter only after Redis is connected
const createRateLimiter = () => {
    return new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: 'middleware',
        points: process.env.NODE_ENV === 'production' ? 10 : 1000, // 10 requests in prod, 1000 in dev
        duration: process.env.NODE_ENV === 'production' ? 1 : 60, // per 1 second in prod, per 60 seconds in dev
        blockDuration: 60 * 5, // Block for 5 minutes if exceeded
    });
};

let rateLimiter: RateLimiterRedis | null = null;

export const rateLimiterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting in development mode if NODE_ENV is explicitly set to development
    if (process.env.NODE_ENV === 'development') {
        return next();
    }

    // Skip rate limiting for health check endpoint
    if (req.path === '/health') {
        return next();
    }

    try {
        // Initialize rate limiter if not already initialized
        if (!rateLimiter && redisClient.isOpen) {
            rateLimiter = createRateLimiter();
        }

        // If Redis is not connected or rate limiter isn't ready, skip rate limiting
        if (!rateLimiter || !redisClient.isOpen) {
            logger.warn('Rate limiter or Redis not ready, skipping rate limit check');
            return next();
        }

        const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
        await rateLimiter.consume(clientIp);
        next();
    } catch (error) {
        // Only send rate limit exceeded response if it's a rate limit error
        if (error instanceof Error && error.name === 'Error') {
            logger.warn(`Rate limit exceeded for IP ${req.ip || 'unknown'}`);
            res.status(429).json({
                status: 'error',
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests, please try again later.'
            });
        } else {
            // For other errors, log and continue
            logger.error('Rate limiter error:', error);
            next();
        }
    }
}; 