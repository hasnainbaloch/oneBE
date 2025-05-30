import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import redisClient from '../../config/redis';
import { IUserDocument } from '../../interfaces/user.interface';
import { 
    AccessTokenPayload, 
    RefreshTokenPayload, 
    TokenFamily,
    accessTokenPayloadSchema,
    refreshTokenPayloadSchema,
    tokenFamilySchema 
} from '../../interfaces/auth.interface';


// Generate a new token family
export const createTokenFamily = async (userId: string): Promise<string> => {
    const familyId = uuidv4();
    await redisClient.set(`token:family:${userId}`, familyId);
    return familyId;
};

// Generate access token
export const generateAccessToken = (user: IUserDocument): string => {
    const payload = accessTokenPayloadSchema.parse({
        id: user._id.toString(),
        email: user.email,
        role: user.role
    });

    return jwt.sign(
        payload,
        process.env.JWT_SECRET as string,
        { expiresIn: '15m' }
    );
};

// Generate refresh token with family tracking
export const generateRefreshToken = async (user: IUserDocument): Promise<{ token: string, tokenId: string }> => {
    // Get or create family ID
    let familyId = await redisClient.get(`token:family:${user._id}`);
    if (!familyId) {
        familyId = await createTokenFamily(user._id.toString());
    }

    // Create a unique token ID
    const tokenId = uuidv4();

    // Create and validate the token payload
    const payload = refreshTokenPayloadSchema.parse({
        id: user._id.toString(),
        tokenId,
        familyId
    });

    const token = jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: '7d' }
    );

    // Create and validate the token family data
    const tokenData = tokenFamilySchema.parse({
        userId: user._id.toString(),
        familyId,
        currentTokenId: tokenId
    });

    await redisClient.set(
        `token:refresh:${tokenId}`,
        JSON.stringify(tokenData),
        { EX: 60 * 60 * 24 * 7 } // 7 days expiration
    );

    // Update the current token for this family
    await redisClient.set(`token:current:${familyId}`, tokenId);

    return { token, tokenId };
};

// Verify and rotate refresh token
export const verifyAndRotateRefreshToken = async (refreshToken: string): Promise<{ user: IUserDocument, newRefreshToken: string } | null> => {
    try {
        // Verify the token
        const decodedRaw = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
        const decoded = refreshTokenPayloadSchema.parse(decodedRaw);

        // Get token data from Redis
        const tokenDataStr = await redisClient.get(`token:refresh:${decoded.tokenId}`);
        if (!tokenDataStr) {
            // Token not found in Redis
            return null;
        }

        const parsedTokenData = tokenFamilySchema.parse(JSON.parse(tokenDataStr));

        // Check if this is the current token for the family
        const currentTokenId = await redisClient.get(`token:current:${parsedTokenData.familyId}`);
        if (currentTokenId !== decoded.tokenId) {
            // This token has been superseded - possible token reuse attack
            // Invalidate the entire family
            await invalidateTokenFamily(parsedTokenData.familyId);
            return null;
        }

        // Token is valid, get the user
        const User = require('../../modules/users/user.model').default;
        const user = await User.findById(decoded.id);
        if (!user) {
            return null;
        }

        // Generate a new refresh token (rotation)
        const { token: newRefreshToken } = await generateRefreshToken(user);

        // Invalidate the old token
        await redisClient.del(`token:refresh:${decoded.tokenId}`);

        return { user, newRefreshToken };
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
};

// Invalidate a token family (for security breaches)
export const invalidateTokenFamily = async (familyId: string): Promise<void> => {
    // Get all tokens in this family
    const currentTokenId = await redisClient.get(`token:current:${familyId}`);
    if (currentTokenId) {
        await redisClient.del(`token:refresh:${currentTokenId}`);
    }

    // Delete the family reference
    await redisClient.del(`token:current:${familyId}`);
};

// Invalidate all tokens for a user (on logout or password change)
export const invalidateAllUserTokens = async (userId: string): Promise<void> => {
    const familyId = await redisClient.get(`token:family:${userId}`);
    if (familyId) {
        await invalidateTokenFamily(familyId);
        await redisClient.del(`token:family:${userId}`);
    }
};

// Check if a refresh token is valid without rotating it
export const isRefreshTokenValid = async (refreshToken: string): Promise<boolean> => {
    try {
        // Verify the token
        const decodedRaw = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
        const decoded = refreshTokenPayloadSchema.parse(decodedRaw);
        
        // Get token data from Redis
        const tokenDataStr = await redisClient.get(`token:refresh:${decoded.tokenId}`);
        if (!tokenDataStr) {
            // Token not found in Redis
            return false;
        }

        const parsedTokenData = tokenFamilySchema.parse(JSON.parse(tokenDataStr));

        // Check if this is the current token for the family
        const currentTokenId = await redisClient.get(`token:current:${parsedTokenData.familyId}`);
        if (currentTokenId !== decoded.tokenId) {
            // This token has been superseded - possible token reuse attack
            // Invalidate the entire family
            await invalidateTokenFamily(parsedTokenData.familyId);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
};