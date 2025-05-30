import request from 'supertest';
import app from '../app';
import User from '../modules/users/user.model';
import mongoose from 'mongoose';
import redisClient from '../config/redis';
import { AUTH_ROUTES } from '../constants/api.constants';

describe('Authentication Flow', () => {
    const testUser = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'testPassword123'
    };

    let accessToken: string;
    let refreshTokenCookie: string;

    beforeAll(async () => {
        // Clean up test data
        await User.deleteMany({});
        await redisClient.flushDb();
    });

    afterAll(async () => {
        await User.deleteMany({});
        await redisClient.flushDb();
        await mongoose.connection.close();
        await redisClient.quit();
    });

    describe('Sign Up', () => {
        it('should create a new user', async () => {
            const response = await request(app)
                .post(AUTH_ROUTES.SIGNUP)
                .send(testUser);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('email', testUser.email);
            expect(response.body).toHaveProperty('token');
        });

        it('should not allow duplicate email', async () => {
            const response = await request(app)
                .post(AUTH_ROUTES.SIGNUP)
                .send(testUser);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'User already exists');
        });
    });

    describe('Login', () => {
        it('should login successfully and return tokens', async () => {
            const response = await request(app)
                .post(AUTH_ROUTES.SIGNIN)
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('accessToken');
            expect(response.headers['set-cookie']).toBeDefined();
            
            // Store tokens for subsequent tests
            accessToken = response.body.accessToken;
            refreshTokenCookie = response.headers['set-cookie'][0];
        });

        it('should fail with wrong password', async () => {
            const response = await request(app)
                .post(AUTH_ROUTES.SIGNIN)
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
        });
    });

    describe('Token Refresh', () => {
        it('should refresh tokens successfully', async () => {
            // Wait a bit to ensure tokens are different
            await new Promise(resolve => setTimeout(resolve, 1000));

            const response = await request(app)
                .post(AUTH_ROUTES.REFRESH)
                .set('Cookie', refreshTokenCookie);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('accessToken');
            expect(response.headers['set-cookie']).toBeDefined();

            // Store new tokens
            const oldAccessToken = accessToken;
            accessToken = response.body.accessToken;
            refreshTokenCookie = response.headers['set-cookie'][0];

            // Verify new token is different
            expect(accessToken).not.toBe(oldAccessToken);
        });

        it('should fail with invalid refresh token', async () => {
            const response = await request(app)
                .post(AUTH_ROUTES.REFRESH)
                .set('Cookie', 'refreshToken=invalid');

            expect(response.status).toBe(403);
        });
    });

    describe('Logout', () => {
        it('should logout successfully', async () => {
            const response = await request(app)
                .post(AUTH_ROUTES.LOGOUT)
                .set('Authorization', `Bearer ${accessToken}`)
                .set('Cookie', refreshTokenCookie);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Logged out successfully');

            // Verify refresh token is cleared
            expect(response.headers['set-cookie'][0]).toMatch(/refreshToken=;/);
        });

        it('should fail to use refresh token after logout', async () => {
            const response = await request(app)
                .post(AUTH_ROUTES.REFRESH)
                .set('Cookie', refreshTokenCookie);

            expect(response.status).toBe(403);
        });
    });
}); 