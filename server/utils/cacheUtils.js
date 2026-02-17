// j:\sayalee\innovateyou\SoulSync\server\utils\cacheUtils.js
import redisClient from "../config/redis.js";

const DEFAULT_CACHE_TTL = 3600; // 1 hour in seconds

/**
 * Set cache with key and value
 * @param {string} key - Cache key
 * @param {any} value - Value to cache (will be JSON stringified)
 * @param {number} ttl - Time to live in seconds (default: 1 hour)
 */
export const setCache = async (key, value, ttl = DEFAULT_CACHE_TTL) => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
  }
};

/**
 * Get cache by key
 * @param {string} key - Cache key
 * @returns {any} Parsed cached value or null
 */
export const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting cache for key ${key}:`, error);
    return null;
  }
};

/**
 * Delete cache by key
 * @param {string} key - Cache key
 */
export const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error(`Error deleting cache for key ${key}:`, error);
  }
};

/**
 * Delete multiple cache keys (pattern-based)
 * @param {string} pattern - Redis pattern (e.g., "user:123:*")
 */
export const deleteCachePattern = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error(`Error deleting cache pattern ${pattern}:`, error);
  }
};

/**
 * Cache key generators for common patterns
 */
export const cacheKeys = {
  // User cache
  user: (userId) => `user:${userId}`,
  userProfile: (userId) => `user:${userId}:profile`,
  userAuth: (userId) => `user:${userId}:auth`,
  
  // Quiz cache
  quizScore: (userId, quizType, date) => `quiz:${userId}:${quizType}:${date}`,
  dailyQuiz: (userId, date) => `quiz:${userId}:daily:${date}`,
  quizHistory: (userId) => `quiz:${userId}:history`,
  
  // Journal cache
  journalEntries: (userId, page) => `journal:${userId}:entries:${page}`,
  journalEntry: (userId, entryId) => `journal:${userId}:${entryId}`,
  journalDate: (userId, date) => `journal:${userId}:date:${date}`,
  calendarDates: (userId, month, year) => `journal:${userId}:calendar:${month}:${year}`,
  
  // Risk cache
  riskDaily: (userId, date) => `risk:${userId}:daily:${date}`,
  riskWeekly: (userId) => `risk:${userId}:weekly`,
  riskMonthly: (userId) => `risk:${userId}:monthly`,
  
  // Chat cache
  chatList: (userId) => `chat:${userId}:list`,
  chat: (chatId) => `chat:${chatId}`,
  userChats: (userId) => `chat:${userId}:all`,
};

/**
 * Invalidate user-related caches (call when user data changes)
 */
export const invalidateUserCache = async (userId) => {
  try {
    await deleteCachePattern(`user:${userId}:*`);
  } catch (error) {
    console.error(`Error invalidating user cache for ${userId}:`, error);
  }
};

/**
 * Invalidate quiz-related caches
 */
export const invalidateQuizCache = async (userId) => {
  try {
    await deleteCachePattern(`quiz:${userId}:*`);
  } catch (error) {
    console.error(`Error invalidating quiz cache for ${userId}:`, error);
  }
};

/**
 * Invalidate journal-related caches
 */
export const invalidateJournalCache = async (userId) => {
  try {
    await deleteCachePattern(`journal:${userId}:*`);
  } catch (error) {
    console.error(`Error invalidating journal cache for ${userId}:`, error);
  }
};

/**
 * Invalidate risk-related caches
 */
export const invalidateRiskCache = async (userId) => {
  try {
    await deleteCachePattern(`risk:${userId}:*`);
  } catch (error) {
    console.error(`Error invalidating risk cache for ${userId}:`, error);
  }
};

/**
 * Invalidate chat-related caches
 */
export const invalidateChatCache = async (userId) => {
  try {
    await deleteCachePattern(`chat:${userId}:*`);
  } catch (error) {
    console.error(`Error invalidating chat cache for ${userId}:`, error);
  }
};