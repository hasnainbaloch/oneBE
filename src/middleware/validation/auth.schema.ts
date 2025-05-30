import { z } from 'zod';

// Base schemas
const nameSchema = z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim();

const emailSchema = z.string()
    .email('Invalid email format')
    .trim()
    .toLowerCase();

const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    );

// Auth schemas
export const signupSchema = z.object({
    body: z.object({
        firstName: nameSchema.describe('First name'),
        lastName: nameSchema.describe('Last name'),
        email: emailSchema,
        password: passwordSchema,
    }),
});

export const signinSchema = z.object({
    body: z.object({
        email: emailSchema,
        password: passwordSchema,
    }),
});

// Base social consent schema
const socialConsentSchema = z.object({
    body: z.object({
        email: emailSchema,
        firstName: nameSchema,
        lastName: nameSchema,
    }),
});

export const googleConsentSchema = socialConsentSchema.extend({
    body: z.object({
        email: emailSchema,
        firstName: nameSchema,
        lastName: nameSchema,
        googleId: z.string().min(1, 'Google ID is required'),
    }),
});

export const facebookConsentSchema = socialConsentSchema.extend({
    body: z.object({
        email: emailSchema,
        firstName: nameSchema,
        lastName: nameSchema,
        facebookId: z.string().min(1, 'Facebook ID is required'),
    }),
});

// Export types
export type SignupInput = z.infer<typeof signupSchema>['body'];
export type SigninInput = z.infer<typeof signinSchema>['body'];
export type GoogleConsentInput = z.infer<typeof googleConsentSchema>['body'];
export type FacebookConsentInput = z.infer<typeof facebookConsentSchema>['body']; 