import { Router } from 'express';
import { validate } from '../../middleware/validation/validate.middleware';
import { 
    signupSchema,
    signinSchema,
    googleConsentSchema,
    facebookConsentSchema
} from '../../middleware/validation/auth.schema';
import * as localAuth from './controllers/local-auth.controller';
import * as socialAuth from './controllers/social-auth.controller';
import * as tokenAuth from './controllers/token.controller';

const router = Router();

// Helper to wrap async handlers
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Local auth routes
router.post('/signup', validate(signupSchema), asyncHandler(localAuth.signup));
router.post('/signin', validate(signinSchema), asyncHandler(localAuth.signin));

// Social auth routes
router.get('/google', asyncHandler(socialAuth.google));
router.post('/google/consent', validate(googleConsentSchema), asyncHandler(socialAuth.googleConsent));
router.get('/facebook', asyncHandler(socialAuth.facebook));
router.post('/facebook/consent', validate(facebookConsentSchema), asyncHandler(socialAuth.facebookConsent));

// Token routes
router.post('/refresh', asyncHandler(tokenAuth.refresh));
router.post('/logout', asyncHandler(tokenAuth.logout));

export default router;