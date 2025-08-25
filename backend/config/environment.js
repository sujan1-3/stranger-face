// Environment configuration
require('dotenv').config();

const config = {
    // Server configuration
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // CORS origins
    CORS_ORIGINS: process.env.CORS_ORIGINS 
        ? process.env.CORS_ORIGINS.split(',') 
        : ['http://localhost:3000', 'http://localhost:3001'],

    // Rate limiting
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100,

    // Session configuration
    SESSION_SECRET: process.env.SESSION_SECRET || 'stranger-face-secret-key-change-in-production',
    SESSION_TIMEOUT: parseInt(process.env.SESSION_TIMEOUT) || 1800000, // 30 minutes

    // WebRTC configuration
    TURN_SERVER: process.env.TURN_SERVER || null,
    TURN_USERNAME: process.env.TURN_USERNAME || null,
    TURN_PASSWORD: process.env.TURN_PASSWORD || null,

    // Geolocation APIs
    IPAPI_KEY: process.env.IPAPI_KEY || null,
    IPSTACK_KEY: process.env.IPSTACK_KEY || null,

    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    LOG_FILE: process.env.LOG_FILE || 'stranger-face.log',

    // Security
    HELMET_ENABLED: process.env.HELMET_ENABLED !== 'false',
    COMPRESSION_ENABLED: process.env.COMPRESSION_ENABLED !== 'false',

    // Features
    REPORTS_ENABLED: process.env.REPORTS_ENABLED !== 'false',
    ANALYTICS_ENABLED: process.env.ANALYTICS_ENABLED === 'true',

    // Database (for future use)
    DATABASE_URL: process.env.DATABASE_URL || null,
    REDIS_URL: process.env.REDIS_URL || null
};

module.exports = config;
