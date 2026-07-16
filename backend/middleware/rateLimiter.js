/**
 * Rate Limiter Middleware
 *
 * Separate limiters for different endpoint sensitivity levels.
 * All limits are per IP address.
 */
const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Login endpoint — strictest limit.
 * 10 attempts per 15 minutes per IP.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts from this IP. Try again in 15 minutes.' },
  skipSuccessfulRequests: true, // only count failed attempts toward the limit
});

/**
 * Document re-auth endpoint — same sensitivity as login.
 * 10 attempts per 15 minutes per IP.
 */
const docAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Try again in 15 minutes.' },
  skipSuccessfulRequests: true,
});

/**
 * Document view endpoint — limits per-token abuse.
 * 30 requests per 5 minutes per IP (covers normal usage, blocks bulk scraping).
 */
const docViewLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: isDev ? 500 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many document requests. Try again shortly.' },
});

/**
 * General API limiter — broad protection.
 * 300 requests per minute per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 2000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down.' },
});

module.exports = { loginLimiter, docAuthLimiter, docViewLimiter, apiLimiter };
