const redisClient = require('../config/redis');

const CACHE_EXPIRATION = 3600; // Cache for 1 hour
const CACHE_KEY = 'all_categories';

async function getAllCategories(pool) {
  try {
    // Try to get data from cache first
    const cachedCategories = await redisClient.get(CACHE_KEY);
    if (cachedCategories) {
      console.log('Returning categories from cache');
      return JSON.parse(cachedCategories);
    }

    // If not in cache, get from database
    console.log('Fetching categories from database');
    const result = await pool.query('SELECT * FROM categories');
    const categories = result.rows;

    // Store in cache for next time
    await redisClient.setEx(CACHE_KEY, CACHE_EXPIRATION, JSON.stringify(categories));

    return categories;
  } catch (error) {
    throw new Error(`Error fetching categories: ${error.message}`);
  }
}

module.exports = {
  getAllCategories,
};