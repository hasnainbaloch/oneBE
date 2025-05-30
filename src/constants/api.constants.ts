export const API_VERSION_V1 = 'v1';
export const BASE_PATH = `/api/${API_VERSION_V1}`;

export const AUTH_ROUTES = {
    BASE: `/api/${API_VERSION_V1}/auth`,
    SIGNUP: `/api/${API_VERSION_V1}/auth/signup`,
    SIGNIN: `/api/${API_VERSION_V1}/auth/signin`,
    REFRESH: `/api/${API_VERSION_V1}/auth/refresh`,
    LOGOUT: `/api/${API_VERSION_V1}/auth/logout`,
    GOOGLE: `/api/${API_VERSION_V1}/auth/google`,
    GOOGLE_CALLBACK: `/api/${API_VERSION_V1}/auth/google/callback`,
    GOOGLE_CONSENT: `/api/${API_VERSION_V1}/auth/google/consent`,
    FACEBOOK: `/api/${API_VERSION_V1}/auth/facebook`,
    FACEBOOK_CALLBACK: `/api/${API_VERSION_V1}/auth/facebook/callback`,
    FACEBOOK_CONSENT: `/api/${API_VERSION_V1}/auth/facebook/consent`
} as const;

export const USER_ROUTES = {
    BASE: `${BASE_PATH}/users`,
    PROFILE: `${BASE_PATH}/users/profile`,
    UPDATE_PROFILE: `${BASE_PATH}/users/profile`,
    CHANGE_PASSWORD: `${BASE_PATH}/users/change-password`,
} as const;

// Add more route constants as needed for other modules 