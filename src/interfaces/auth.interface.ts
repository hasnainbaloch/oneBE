import { z } from 'zod';

// Token family tracking schema
export const tokenFamilySchema = z.object({
    userId: z.string(),
    familyId: z.string(),
    currentTokenId: z.string()
});

// JWT payload schemas
export const accessTokenPayloadSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    role: z.string()
});

export const refreshTokenPayloadSchema = z.object({
    id: z.string(),
    tokenId: z.string(),
    familyId: z.string()
});

// Inferred types
export type TokenFamily = z.infer<typeof tokenFamilySchema>;
export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;
export type RefreshTokenPayload = z.infer<typeof refreshTokenPayloadSchema>;