// index.ts
import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import { logger } from './infrastructure/config/logger.config';

logger.info('ENV CHECK:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URI: process.env.DATABASE_URI,
  PORT: process.env.PORT,
});

process.on('uncaughtException', (err) => {
  logger.error('🔥 UNCAUGHT EXCEPTION:', { message: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('🔥 UNHANDLED REJECTION:', { reason });
  process.exit(1);
});

import { bootstrap } from './server';

bootstrap().catch((err) => {
  logger.error('❌ Server startup failed:', { message: err.message, stack: err.stack });
  process.exit(1);
});
