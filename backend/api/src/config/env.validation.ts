import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  PORT: Joi.number().port().default(3000),

  MONGODB_URI: Joi.string().uri().required(),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),

  JWT_REFRESH_SECRET: Joi.string().min(32).required(),

  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),

  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  COOKIE_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),

  COOKIE_SAME_SITE: Joi.string().valid('strict', 'lax', 'none').default('lax'),

  CORS_ORIGIN: Joi.string().uri().required(),

  THROTTLE_TTL: Joi.number().integer().positive().default(60000),

  THROTTLE_LIMIT: Joi.number().integer().positive().default(100),
});
