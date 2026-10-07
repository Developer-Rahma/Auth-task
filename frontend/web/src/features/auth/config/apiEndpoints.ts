export const API_ENDPOINTS = {
  auth: {
    signup: '/api/auth/signup',
    signin: '/api/auth/signin',
    currentUser: '/api/auth/me',
    refreshSession: '/api/auth/refresh',
    logout: '/api/auth/logout',
  },
} as const
