import { NextFunction, Request, Response } from "express";
import { hashPassword, comparePasswords, generateToken, generateRefreshToken, decodeToken } from "./auth.utils";
import User from "../users/user.model";
import { refreshTokenCookieOptions } from "../../config/constants";
import passport from "passport";
import { invalidateAllUserTokens, isRefreshTokenValid } from './token.service';
import redisClient from '../../config/redis';
import { RefreshTokenPayload } from '../../types/auth.types';
import createError from 'http-errors';
import logger from '../../config/logger';

export const signup = async (req: Request, res: Response) => {
    const { firstName, lastName, email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw createError(409, 'User already exists');
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({ firstName, lastName, email, password: hashedPassword });
    const token = generateToken(user);

    res.status(201).json({ 
        user: { 
            firstName: user.firstName, 
            lastName: user.lastName, 
            email: user.email 
        }, 
        token 
    });
};

export const signin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        throw createError(404, 'User not found');
    }

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
        throw createError(401, 'Invalid credentials');
    }

    const accessToken = generateToken(user);
    const refreshToken = await generateRefreshToken(user);

    res
        .cookie('refreshToken', refreshToken, refreshTokenCookieOptions)
        .json({
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
            accessToken,
        });
};

export const refresh = async (req: Request, res: Response) => {
    const cookieRefreshToken = req.cookies.refreshToken;

    if (!cookieRefreshToken) {
        throw createError(401, 'Missing refresh token');
    }

    try {
        const isValid = await isRefreshTokenValid(cookieRefreshToken);
        if (!isValid) {
            throw createError(403, 'Invalid or expired refresh token');
        }
        
        const decoded = decodeToken(cookieRefreshToken);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            throw createError(403, 'User not found');
        }

        const newAccessToken = generateToken(user);
        const newRefreshToken = await generateRefreshToken(user);

        res
            .cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions)
            .json({
                accessToken: newAccessToken,
                user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                },
            });
    } catch (err) {
        logger.error('[Auth::refresh]', err);
        throw createError(403, 'Invalid or expired refresh token');
    }
};

export const google = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', { session: false }, async (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            // ⛔ No user — ask for consent on frontend
            return res.status(200).json({
                needsConsent: true,
                suggestedUser: {
                    email: info?.profile?.emails?.[0]?.value,
                    firstName: info?.profile?.name?.givenName,
                    lastName: info?.profile?.name?.familyName,
                    googleId: info?.profile?.id,
                },
            });
        }

        try {
            const accessToken = generateToken(user);
            const refreshToken = await generateRefreshToken(user);

            res
                .cookie('refreshToken', refreshToken, refreshTokenCookieOptions)
                .json({ accessToken });
        } catch (saveErr) {
            return next(saveErr);
        }
    })(req, res, next);
};

export const googleConsent = async (req: Request, res: Response) => {
    const { googleId, email, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ googleId });
    if (existingUser) return res.status(400).json({ message: 'Account already exists' });

    const user = await User.create({ googleId, email, firstName, lastName });
    const accessToken = generateToken(user);
    const refreshToken = await generateRefreshToken(user);

    res
        .cookie('refreshToken', refreshToken, refreshTokenCookieOptions)
        .json({ accessToken });
};

export const facebook = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('facebook', { session: false }, async (err: Error | null, user: any , info: any) => {
        if (err) return next(err);

        if (!user) {
            // ⛔ No user — ask for consent on frontend
            return res.status(200).json({
                needsConsent: true,
                suggestedUser: {
                    email: info?.profile?.emails?.[0]?.value,
                    firstName: info?.profile?.name?.givenName,
                    lastName: info?.profile?.name?.familyName,
                    facebookId: info?.profile?.id,
                },
            });
        }

        try {
            const accessToken = generateToken(user);
            const refreshToken = await generateRefreshToken(user);

            res
                .cookie('refreshToken', refreshToken, refreshTokenCookieOptions)
                .json({ accessToken });
        } catch (saveErr) {
            return next(saveErr);
        }
    })(req, res, next);
};

export const facebookConsent = async (req: Request, res: Response) => {
    const { facebookId, email, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ facebookId });
    if (existingUser) return res.status(400).json({ message: 'Account already exists' });

    const user = await User.create({ facebookId, email, firstName, lastName });
    const accessToken = generateToken(user);
    const refreshToken = await generateRefreshToken(user);

    res
        .cookie('refreshToken', refreshToken, refreshTokenCookieOptions)
        .json({ accessToken });
};

/**
 * Logout user and invalidate all tokens
 */
export const logout = async (req: Request, res: Response) => {
    res.clearCookie('refreshToken', refreshTokenCookieOptions)
        .json({ message: 'Logged out successfully' });
};
