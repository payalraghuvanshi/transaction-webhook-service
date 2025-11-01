// Environment variables with default values
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 5000;

// Database configuration
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = process.env.DB_PORT || '5432';
export const DB_USERNAME = process.env.DB_USERNAME || 'postgres';
export const DB_PASSWORD = process.env.DB_PASSWORD || '1234';
export const DB_DATABASE = process.env.DB_DATABASE || 'webhook_transactions';

// Redis configuration
export const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
export const REDIS_PORT = process.env.REDIS_PORT || '6379';
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
