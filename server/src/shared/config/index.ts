import { env } from "./env.js";

export const config = {
  env: env.NODE_ENV,

  server: {
    port: env.PORT,
  },

  database: {
    URI: env.DATABASE_URI,
  },

  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    resetSecret: env.JWT_RESET_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    resetExpiresIn: env.JWT_RESET_EXPIRES_IN,
  },

  email: {
    HOST: env.EMAIL_HOST,
    PORT: env.EMAIL_PORT,
    SECURE: env.EMAIL_SECURE,
    USER: env.EMAIL_USER,
    PASSWORD: env.EMAIL_PASSWORD,
    FROM: env.EMAIL_FROM,
    // EMAIL: env.EMAIL,
  },

  google: {
    clientId: env.GOOGLE_CLIENT_ID,
  },

  redis: {
    url: env.REDIS_URL,
  },

  client: {
    URI: env.CLIENT_URI,
  },

  logger: {
    level: env.LOG_LEVEL,
  },
  bcrypt: {
    saltRounds: Number(env.SALTROUNDS),
  },
};
