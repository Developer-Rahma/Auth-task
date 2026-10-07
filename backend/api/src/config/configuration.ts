export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
    corsOrigins: [
      process.env.CORS_ORIGIN ?? 'http://localhost:5173',
      process.env.CORS_ORIGIN_DEPLOY ??
        'https://auth-task-eight-beige.vercel.app',
    ],
  },

  database: {
    mongoUri: process.env.MONGODB_URI,
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,

    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',

    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  cookies: {
    secure: process.env.COOKIE_SECURE === 'true',

    sameSite: process.env.COOKIE_SAME_SITE ?? 'lax',
  },

  throttle: {
    ttl: Number(process.env.THROTTLE_TTL ?? 60000),

    limit: Number(process.env.THROTTLE_LIMIT ?? 100),
  },
});
