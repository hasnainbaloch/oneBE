export const API_VERSION = 'v1';
export const BASE_PATH = `/api/${API_VERSION}`;

export const AUTH_ROUTES = {
    BASE: `${BASE_PATH}/auth`,
    SIGNUP: `${BASE_PATH}/auth/signup`,
    SIGNIN: `${BASE_PATH}/auth/signin`,
    REFRESH: `${BASE_PATH}/auth/refresh`,
    LOGOUT: `${BASE_PATH}/auth/logout`,
    GOOGLE: `${BASE_PATH}/auth/google`,
    GOOGLE_CALLBACK: `${BASE_PATH}/auth/google/callback`,
    GOOGLE_CONSENT: `${BASE_PATH}/auth/google/consent`,
    FACEBOOK: `${BASE_PATH}/auth/facebook`,
    FACEBOOK_CALLBACK: `${BASE_PATH}/auth/facebook/callback`,
    FACEBOOK_CONSENT: `${BASE_PATH}/auth/facebook/consent`,
} as const;

export const USER_ROUTES = {
    BASE: `${BASE_PATH}/users`,
    PROFILE: `${BASE_PATH}/users/profile`,
    UPDATE_PROFILE: `${BASE_PATH}/users/profile`,
    CHANGE_PASSWORD: `${BASE_PATH}/users/change-password`,
} as const;

// Add more route constants as needed for other modules 