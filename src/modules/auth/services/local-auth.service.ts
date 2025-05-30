import { hashPassword, comparePasswords, generateToken, generateRefreshToken } from "../auth.utils";
import User from "../../users/user.model";
import createError from 'http-errors';
import { SignupInput, SigninInput } from '../../../middleware/validation/auth.schema';
import { IUserDocument } from "../../../interfaces/user.interface";

export const signup = async (data: SignupInput): Promise<{ 
    user: IUserDocument; 
    token: string 
}> => {
    const { firstName, lastName, email, password } = data;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw createError(409, 'User already exists');
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({ 
        firstName, 
        lastName, 
        email, 
        password: hashedPassword 
    });

    const token = generateToken(user);

    return { user, token };
};

export const signin = async (data: SigninInput): Promise<{ 
    user: IUserDocument; 
    accessToken: string;
    refreshToken: string;
}> => {
    const { email, password } = data;

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

    return { user, accessToken, refreshToken };
}; 