import { createClient, RedisClientType } from 'redis';

const REDIS_CONFIG = {
  KEYS: {
    SD_REMAINING_REQUESTS: 'sdRemainingRequests'
  },
  TIME: {
    TEN_SECONDS_MS: 10000,
    TEN_SECONDS: 10
  },
  LIMITS: {
    STABLE_DIFFUSION_RATE: 150
  }
} as const;

export const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (error) => {
  // eslint-disable-next-line no-console
  console.error('Redis Client Error:', error);
});

export const getSdRemainingRequests = async (): Promise<number> => {
  try {
    const res = await redisClient.get(REDIS_CONFIG.KEYS.SD_REMAINING_REQUESTS);
    
    return res ? Number(res) : 0;
  } catch (error) {

    // eslint-disable-next-line no-console
    console.error('Error getting remaining requests:', error);
    throw new Error('Failed to get remaining requests count');
  }
};

export const incrementSdRemainingRequests = async (number: number): Promise<void> => {
  try {
    const requests = await redisClient.incrBy(REDIS_CONFIG.KEYS.SD_REMAINING_REQUESTS, number);

    if (requests >= REDIS_CONFIG.LIMITS.STABLE_DIFFUSION_RATE) {
      await Promise.all([
        new Promise((resolve) => setTimeout(resolve, REDIS_CONFIG.TIME.TEN_SECONDS_MS)),
        redisClient.set(REDIS_CONFIG.KEYS.SD_REMAINING_REQUESTS, '0'),
        redisClient.expire(
          REDIS_CONFIG.KEYS.SD_REMAINING_REQUESTS,
          REDIS_CONFIG.TIME.TEN_SECONDS
        )
      ]);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error incrementing remaining requests:', error);
    throw new Error('Failed to increment remaining requests');
  }
};

export const initializeRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    // eslint-disable-next-line no-console
    console.log('Redis client connected successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
};