import { decodeToken } from "../auth.utils";
import { isRefreshTokenValid } from "../token.service";
import User from "../../users/user.model";
import createError from 'http-errors';
import { generateToken, generateRefreshToken } from "../auth.utils";
import { IUserDocument } from "../../../interfaces/user.interface";
import logger from '../../../config/logger';

export const refreshTokens = async (refreshToken: string): Promise<{
    user: IUserDocument;
    accessToken: string;
    refreshToken: string;
}> => {
    if (!refreshToken) {
        throw createError(401, 'Missing refresh token');
    }

    try {
        const isValid = await isRefreshTokenValid(refreshToken);
        if (!isValid) {
            throw createError(403, 'Invalid or expired refresh token');
        }
        
        const decoded = decodeToken(refreshToken);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            throw createError(403, 'User not found');
        }

        const accessToken = generateToken(user);
        const newRefreshToken = await generateRefreshToken(user);

        return { 
            user,
            accessToken,
            refreshToken: newRefreshToken
        };
    } catch (err) {
        logger.error('[TokenService::refreshTokens]', err);
        throw createError(403, 'Invalid or expired refresh token');
    }
}; 