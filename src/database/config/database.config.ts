import * as dotenv from 'dotenv';
import { IDatabaseConfig } from './dbConfig.interface';

dotenv.config();

// Database configuration for development, test, and production environments
export const databaseConfig: IDatabaseConfig = {
  development: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_DATABASE || 'webhook_transactions',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
    dialect: 'postgres',
    logging: true,
    pool: {
      max: Number(process.env.DB_POOL_MAX) || 5,
      min: Number(process.env.DB_POOL_MIN) || 0,
      acquire: Number(process.env.DB_POOL_ACQUIRE) || 50000,
      idle: Number(process.env.DB_POOL_IDLE) || 10000,
    },
  },
  test: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_DATABASE_TEST || 'webhook_transactions_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
    dialect: 'postgres',
    logging: false,
    pool: {
      max: Number(process.env.DB_POOL_MAX) || 5,
      min: Number(process.env.DB_POOL_MIN) || 0,
      acquire: Number(process.env.DB_POOL_ACQUIRE) || 50000,
      idle: Number(process.env.DB_POOL_IDLE) || 10000,
    },
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: Number(process.env.DB_POOL_MAX) || 10,
      min: Number(process.env.DB_POOL_MIN) || 2,
      acquire: Number(process.env.DB_POOL_ACQUIRE) || 50000,
      idle: Number(process.env.DB_POOL_IDLE) || 10000,
    },
  },
};

