// Token family tracking
export interface TokenFamily {
    userId: string;
    familyId: string;
    currentTokenId: string;
}

// JWT payload types
export interface AccessTokenPayload {
    id: string;
    email: string;
    role: string;
}

export interface RefreshTokenPayload {
    id: string;
    tokenId: string;
    familyId: string;
}