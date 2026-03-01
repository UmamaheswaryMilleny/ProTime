
/**
 * Helpers
 */
const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required env variable: ${key}`);
  }
  return value;
};

const number = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`❌ Missing number env variable: ${key}`);
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`❌ Invalid number env variable: ${key}`);
  }
  return parsed;
};

const boolean = (key: string, defaultValue = false): boolean => {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value === "true";
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: number("PORT", 5000),

  // Database
  DATABASE_URI: required("DATABASE_URI"),

  // JWT
  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET"),
  JWT_RESET_SECRET: required("JWT_RESET_SECRET"),

  JWT_ACCESS_EXPIRES_IN: required("JWT_ACCESS_EXPIRES_IN"),
  JWT_REFRESH_EXPIRES_IN: required("JWT_REFRESH_EXPIRES_IN"),
  JWT_RESET_EXPIRES_IN: required("JWT_RESET_EXPIRES_IN"),

  // Email

  EMAIL_HOST: required("EMAIL_HOST"),
  EMAIL_PORT: number("EMAIL_PORT"),
  EMAIL_SECURE: boolean("EMAIL_SECURE"),
  EMAIL_USER: required("EMAIL_USER"),
  EMAIL_PASSWORD: required("EMAIL_PASSWORD"),
  EMAIL_FROM: required("EMAIL_FROM"),

  // Google OAuth
  GOOGLE_CLIENT_ID: required("GOOGLE_CLIENT_ID"),

  // Redis
  REDIS_URL: required("REDIS_URL"),

  // Client
  CLIENT_URI: required("CLIENT_URI"),

SALTROUNDS:required("SALTROUNDS"),
  // Logger
  LOG_LEVEL: process.env.LOG_LEVEL ?? "info",

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: required("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: required("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: required("CLOUDINARY_API_SECRET"),

};