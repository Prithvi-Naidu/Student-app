import { Pool } from 'pg';
import { logger } from '../utils/logger';

// Create connection pool with better error handling
// Use 127.0.0.1 instead of localhost to avoid local PostgreSQL conflicts
const getPoolConfig = () => {
  const config = {
    host: process.env.POSTGRES_HOST || '127.0.0.1', // Use 127.0.0.1 to connect to Docker container
    // Default 5433 for local Docker (compose maps 5433->5432). CI overrides via POSTGRES_PORT=5432.
    port: parseInt(process.env.POSTGRES_PORT || '5433'),
    database: process.env.POSTGRES_DB || 'onestop_db',
    user: process.env.POSTGRES_USER || 'onestop',
    password: process.env.POSTGRES_PASSWORD || 'onestop_dev_password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };

  // Log connection attempt (without password)
  logger.info('Connecting to PostgreSQL', {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
  });

  return config;
};

const pool = new Pool(getPoolConfig());

pool.on('connect', () => {
  logger.info('Database connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected database error', err);
});

export default pool;

