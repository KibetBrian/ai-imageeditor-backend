import { createClient } from 'redis';

export const redisClient = createClient({
  url: process.env.REDIS_URL
});

const stableDiffusionRateLimit = 150; // 150 requests per 10 seconds
const key = 'sdRemainingRequests';
const tenSecondsInMilliseconds = 10000;
const tenSeconds = 10;

export const getSdRemainingRequests= async ():Promise<number> => {
  const res = await redisClient.get(key);

  if (!res) return 0;

  return Number(res);
};

export const incrementSARemainingRequests = async (number: number): Promise<void> => {
  const requests = await redisClient.incrBy(key, number);

  if (requests >=stableDiffusionRateLimit){
    await new Promise((resolve) => setTimeout(resolve, tenSecondsInMilliseconds));
    await redisClient.set(key, 0);
    await redisClient.expire(key, tenSeconds);
  }
};

