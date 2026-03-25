// index.ts
import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

console.log('ENV CHECK:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URI: process.env.DATABASE_URI,
  PORT: process.env.PORT,
});

process.on('uncaughtException', (err) => {
  console.error('🔥 UNCAUGHT EXCEPTION:', err.message);
  console.error(err.stack); // ← add stack trace
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('🔥 UNHANDLED REJECTION:', reason);
  process.exit(1);
});

import { bootstrap } from './server';

bootstrap().catch((err) => {
  console.error('❌ Server startup failed:', err.message); // ← add .message
  console.error(err.stack); // ← add stack trace
  process.exit(1);
});
