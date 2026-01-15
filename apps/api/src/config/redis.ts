import { createClient } from 'redis';
import { logger } from '../utils/logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error', err);
});

redisClient.on('connect', () => {
  logger.info('Redis connection established');
});

// Connect to Redis
export const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info('Connected to Redis');
    return true;
  } catch (error) {
    logger.error('Failed to connect to Redis', error);
    // Redis is optional in Phase 1; allow server to start
    return false;
  }
};

