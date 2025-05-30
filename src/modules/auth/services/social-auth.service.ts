import User from "../../users/user.model";
import createError from 'http-errors';
import { generateToken, generateRefreshToken } from "../auth.utils";
import { GoogleConsentInput, FacebookConsentInput } from '../../../middleware/validation/auth.schema';
import { IUserDocument } from "../../../interfaces/user.interface";

export const handleGoogleConsent = async (data: GoogleConsentInput): Promise<{ 
    user: IUserDocument;
    accessToken: string;
    refreshToken: string;
}> => {
    const { googleId, email, firstName, lastName } = data;

    const existingUser = await User.findOne({ googleId });
    if (existingUser) {
        throw createError(400, 'Account already exists');
    }

    const user = await User.create({ googleId, email, firstName, lastName });
    const accessToken = generateToken(user);
    const refreshToken = await generateRefreshToken(user);

    return { user, accessToken, refreshToken };
};

export const handleFacebookConsent = async (data: FacebookConsentInput): Promise<{
    user: IUserDocument;
    accessToken: string;
    refreshToken: string;
}> => {
    const { facebookId, email, firstName, lastName } = data;

    const existingUser = await User.findOne({ facebookId });
    if (existingUser) {
        throw createError(400, 'Account already exists');
    }

    const user = await User.create({ facebookId, email, firstName, lastName });
    const accessToken = generateToken(user);
    const refreshToken = await generateRefreshToken(user);

    return { user, accessToken, refreshToken };
};

export const generateTokens = async (user: IUserDocument): Promise<{
    accessToken: string;
    refreshToken: string;
}> => {
    const accessToken = generateToken(user);
    const refreshToken = await generateRefreshToken(user);

    return { accessToken, refreshToken };
}; 