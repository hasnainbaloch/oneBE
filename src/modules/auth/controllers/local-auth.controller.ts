import { Response } from "express";
import * as localAuthService from "../services/local-auth.service";
import { SignupInput, SigninInput } from '../../../middleware/validation/auth.schema';
import { refreshTokenCookieOptions } from "../../../constants";
import { TypedRequestBody, AsyncRequestHandler } from '../types';

export const signup: AsyncRequestHandler<SignupInput> = async (req, res) => {
    const { user, token } = await localAuthService.signup(req.body);

    res.status(201).json({ 
        user: { 
            firstName: user.firstName, 
            lastName: user.lastName, 
            email: user.email 
        }, 
        token 
    });
};

export const signin: AsyncRequestHandler<SigninInput> = async (req, res) => {
    const { user, accessToken, refreshToken } = await localAuthService.signin(req.body);

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