import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser } from '../../types/user.types';
import { generateAccessToken, generateRefreshToken as genRefreshToken } from './token.service';

export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

export const comparePasswords = async (plain: string, hash: string) => {
    return bcrypt.compare(plain, hash);
};

export const generateToken = (user: IUser): string => {
    return generateAccessToken(user);
};

export const generateRefreshToken = async (user: IUser): Promise<string> => {
    const { token } = await genRefreshToken(user);
    return token;
};


export const decodeToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { id: string, tokenId?: string, familyId?: string };
};
