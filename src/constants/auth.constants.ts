
export const refreshTokenExpiry = 7 * 24 * 60 * 60 * 1000 // 7 days

export const accessTokenExpiry = 15 * 60 * 1000 // 15 minutes


export const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
    maxAge: refreshTokenExpiry,
}
