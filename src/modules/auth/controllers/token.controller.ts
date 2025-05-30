import { Request, Response } from "express";
import * as tokenService from "../services/token.service";
import { refreshTokenCookieOptions } from "../../../constants";
import { RequestHandler } from '../types';

export const refresh: RequestHandler = async (req, res) => {
    const { user, accessToken, refreshToken } = await tokenService.refreshTokens(req.cookies.refreshToken);

    res
        .cookie('refreshToken', refreshToken, refreshTokenCookieOptions)
        .json({
            accessToken,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
        });
};

export const logout: RequestHandler = async (req, res) => {
    res.clearCookie('refreshToken', refreshTokenCookieOptions)
        .json({ message: 'Logged out successfully' });
}; 