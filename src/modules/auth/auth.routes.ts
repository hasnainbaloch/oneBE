import { Router, Request, Response, NextFunction } from 'express';
import { refresh, signin, signup, google, googleConsent, facebook, facebookConsent, logout } from './auth.controller';
import passport from 'passport';

const router = Router();

// Helper to wrap async handlers
const asyncHandler = (fn: (req: Request, res: Response) => Promise<any>) => 
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res)).catch(next);
    };

// Use relative paths since base path is handled in app.ts
router.post('/signup', asyncHandler(signup));
router.post('/signin', asyncHandler(signin));
router.post('/refresh', asyncHandler(refresh));
router.post('/logout', asyncHandler(logout));

// Google Auth Routes
router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
}));
// Google callback doesn't need asyncHandler as it already handles next
router.get('/google/callback', google);
router.post('/google/consent', asyncHandler(googleConsent));

// Facebook Auth Routes
router.get('/facebook', passport.authenticate('facebook', {
    scope: ['email', 'public_profile'],
    session: false
}));
router.get('/facebook/callback', facebook);
router.post('/facebook/consent', asyncHandler(facebookConsent));

export default router;