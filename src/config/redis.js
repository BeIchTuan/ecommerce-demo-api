const { createClient } = require('redis');

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

// Connect to redis
(async () => {
    await redisClient.connect();
})();

module.exports = redisClient;
