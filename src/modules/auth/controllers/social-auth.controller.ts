import { NextFunction, Request, Response } from "express";
import * as socialAuthService from "../services/social-auth.service";
import { GoogleConsentInput, FacebookConsentInput } from '../../../middleware/validation/auth.schema';
import { refreshTokenCookieOptions } from "../../../constants";
import passport from "passport";
import { TypedRequestBody, AsyncRequestHandler, RequestHandler } from '../types';

type PassportHandler = (req: Request, res: Response, next: NextFunction) => void;

export const google: PassportHandler = (req, res, next) => {
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
            const { accessToken, refreshToken } = await socialAuthService.generateTokens(user);

            res
                .cookie('refreshToken', refreshToken, refreshTokenCookieOptions)
                .json({ accessToken });
        } catch (saveErr) {
            return next(saveErr);
        }
    })(req, res, next);
};

export const googleConsent: AsyncRequestHandler<GoogleConsentInput> = async (req, res) => {
    const { accessToken, refreshToken } = await socialAuthService.handleGoogleConsent(req.body);

    res
        .cookie('refreshToken', refreshToken, refreshTokenCookieOptions)
        .json({ accessToken });
};

export const facebook: PassportHandler = (req, res, next) => {
    passport.authenticate('facebook', { session: false }, async (err: Error | null, user: any, info: any) => {
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
            const { accessToken, refreshToken } = await socialAuthService.generateTokens(user);

            res
                .cookie('refreshToken', refreshToken, refreshTokenCookieOptions)
                .json({ accessToken });
        } catch (saveErr) {
            return next(saveErr);
        }
    })(req, res, next);
};

export const facebookConsent: AsyncRequestHandler<FacebookConsentInput> = async (req, res) => {
    const { accessToken, refreshToken } = await socialAuthService.handleFacebookConsent(req.body);

    res
        .cookie('refreshToken', refreshToken, refreshTokenCookieOptions)
        .json({ accessToken });
}; 