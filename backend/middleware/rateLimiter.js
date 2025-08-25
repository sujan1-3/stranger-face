// Rate limiting middleware
const rateLimit = require('express-rate-limit');

// General API rate limiting
const general = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Report endpoint rate limiting (more restrictive)
const report = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 reports per minute
    message: {
        error: 'Too many reports from this IP, please slow down.',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Chat connection rate limiting
const chatConnection = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 chat connections per minute
    message: {
        error: 'Too many chat connection attempts, please wait.',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    general,
    report,
    chatConnection
};
