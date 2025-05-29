import { createClient } from 'redis';

// Create Redis client
const redisClient = createClient({
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD || 'pORaBFu2gqM80IGMFeLoCxQPsLl1XdKT',
  socket: {
    host: process.env.REDIS_HOST || 'redis-18985.c283.us-east-1-4.ec2.redns.redis-cloud.com',
    port: parseInt(process.env.REDIS_PORT || '18985')
  }
});

// Connect to Redis with retry logic
const connectRedis = async (retryAttempt = 0, maxRetries = 5) => {
  try {
    await redisClient.connect();
    console.log('Redis connected successfully');
  } catch (err) {
    console.error(`Redis connection error (attempt ${retryAttempt + 1}/${maxRetries}):`, err);
    
    if (retryAttempt < maxRetries) {
      // Exponential backoff with jitter
      const delay = Math.min(1000 * Math.pow(2, retryAttempt), 30000) + Math.random() * 1000;
      console.log(`Retrying connection in ${Math.round(delay / 1000)} seconds...`);
      
      setTimeout(() => {
        connectRedis(retryAttempt + 1, maxRetries);
      }, delay);
    } else {
      console.error('Max retry attempts reached. Could not connect to Redis.');
      // In production, you might want to implement a fallback mechanism or exit the process
    }
  }
};

// Handle Redis errors
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// Handle reconnection events
redisClient.on('reconnecting', () => {
  console.log('Redis client reconnecting...');
});

redisClient.on('connect', () => {
  console.log('Redis client connected');
});

// Initialize connection
connectRedis();

export default redisClient;