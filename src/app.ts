import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './modules/auth/auth.routes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import cookieParser from 'cookie-parser';
import { AUTH_ROUTES } from './constants/api.constants';
import { rateLimiterMiddleware } from './middleware/rateLimiter';
import { errorHandler } from './middleware/error/error.middleware';
import logger from './config/logger';
import createError from 'http-errors';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
app.use(rateLimiterMiddleware);

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount routes using constants
app.use(AUTH_ROUTES.BASE, authRoutes);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
    res.send('API is running!!');
});

// 404 handler
app.use((_req: Request, _res: Response, next: NextFunction) => {
    next(createError(404, 'Route not found'));
});

// Global error handler
app.use(errorHandler);

export default app;