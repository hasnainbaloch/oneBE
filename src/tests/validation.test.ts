import request from 'supertest';
import app from '../app';
import { AUTH_ROUTES } from '../constants/api.constants';
import User from '../modules/users/user.model';
import mongoose from 'mongoose';
import redisClient from '../config/redis';

describe('Validation Tests', () => {
    beforeAll(async () => {
        await User.deleteMany({});
        await redisClient.flushDb();
    });

    afterAll(async () => {
        await User.deleteMany({});
        await redisClient.flushDb();
        await mongoose.connection.close();
        await redisClient.quit();
    });

    describe('Signup Validation', () => {
        it('should validate required fields', async () => {
            const response = await request(app)
                .post(AUTH_ROUTES.SIGNUP)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.code).toBe('VALIDATION_ERROR');
            expect(response.body.errors).toHaveProperty('firstName');
            expect(response.body.errors).toHaveProperty('lastName');
            expect(response.body.errors).toHaveProperty('email');
            expect(response.body.errors).toHaveProperty('password');
        });

        it('should validate email format', async () => {
            const response = await request(app)
                .post(AUTH_ROUTES.SIGNUP)
                .send({
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'invalid-email',
                    password: 'TestPassword123!'
                });

            expect(response.status).toBe(400);
            expect(response.body.errors.email).toBe('Invalid email format');
        });

        it('should validate password complexity', async () => {
            const response = await request(app)
                .post(AUTH_ROUTES.SIGNUP)
                .send({
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    password: 'simple'
                });

            expect(response.status).toBe(400);
            expect(response.body.errors.password).toContain('must contain at least one uppercase letter');
        });

        it('should validate name length', async () => {
            const response = await request(app)
                .post(AUTH_ROUTES.SIGNUP)
                .send({
                    firstName: 'A',
                    lastName: 'B',
                    email: 'test@example.com',
                    password: 'TestPassword123!'
                });

            expect(response.status).toBe(400);
            expect(response.body.errors.firstName).toContain('must be at least 2 characters');
            expect(response.body.errors.lastName).toContain('must be at least 2 characters');
        });
    });

    describe('Signin Validation', () => {
        it('should validate required fields', async () => {
            const response = await request(app)
                .post(AUTH_ROUTES.SIGNIN)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.errors).toHaveProperty('email');
            expect(response.body.errors).toHaveProperty('password');
        });

        it('should validate email format', async () => {
            const response = await request(app)
                .post(AUTH_ROUTES.SIGNIN)
                .send({
                    email: 'invalid-email',
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.errors.email).toBe('Invalid email format');
        });
    });

    describe('Social Auth Validation', () => {
        it('should validate Google consent required fields', async () => {
            const response = await request(app)
                .post(AUTH_ROUTES.GOOGLE_CONSENT)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.errors).toHaveProperty('email');
            expect(response.body.errors).toHaveProperty('firstName');
            expect(response.body.errors).toHaveProperty('lastName');
            expect(response.body.errors).toHaveProperty('googleId');
        });

        it('should validate Facebook consent required fields', async () => {
            const response = await request(app)
                .post(AUTH_ROUTES.FACEBOOK_CONSENT)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.errors).toHaveProperty('email');
            expect(response.body.errors).toHaveProperty('firstName');
            expect(response.body.errors).toHaveProperty('lastName');
            expect(response.body.errors).toHaveProperty('facebookId');
        });
    });
}); 