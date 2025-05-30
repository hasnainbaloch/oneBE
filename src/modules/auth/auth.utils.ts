import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserDocument } from '../../interfaces/user.interface';
import { generateAccessToken, generateRefreshToken as genRefreshToken } from './token.service';
import { refreshTokenPayloadSchema } from '../../interfaces/auth.interface';

export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

export const comparePasswords = async (plain: string, hash: string) => {
    return bcrypt.compare(plain, hash);
};

export const generateToken = (user: IUserDocument): string => {
    return generateAccessToken(user);
};

export const generateRefreshToken = async (user: IUserDocument): Promise<string> => {
    const { token } = await genRefreshToken(user);
    return token;
};

export const decodeToken = (token: string) => {
    const decodedRaw = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);
    return refreshTokenPayloadSchema.parse(decodedRaw);
};
