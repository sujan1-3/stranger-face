# 5. Rate limiter middleware - Exact content
rate_limiter_js = '''// Rate limiting middleware
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
'''

# 6. Report routes - Exact content
report_routes_js = '''// Report handling routes
const express = require('express');
const router = express.Router();
const Joi = require('joi');

// Validation schema for reports
const reportSchema = Joi.object({
    reportedUserId: Joi.string().required(),
    reason: Joi.string().valid(
        'inappropriate_behavior',
        'harassment',
        'nudity',
        'spam',
        'underage',
        'violence',
        'other'
    ).required(),
    description: Joi.string().max(500).optional(),
    timestamp: Joi.date().iso().optional()
});

// Submit a report
router.post('/', async (req, res) => {
    try {
        // Validate request body
        const { error, value } = reportSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid report data',
                details: error.details.map(d => d.message)
            });
        }

        const { reportedUserId, reason, description } = value;
        const reporterIP = req.ip || req.connection.remoteAddress;

        // In production, save to database
        const report = {
            id: Date.now().toString(),
            reportedUserId,
            reporterIP,
            reason,
            description: description || '',
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        // Log the report (in production, save to database)
        console.log('Report submitted:', report);

        // In production, you might want to:
        // 1. Save report to database
        // 2. Increment violation count for reported user
        // 3. Temporarily ban user if violations exceed threshold
        // 4. Send notification to moderators
        // 5. Log for analytics

        res.status(201).json({
            message: 'Report submitted successfully',
            reportId: report.id
        });

    } catch (error) {
        console.error('Error submitting report:', error);
        res.status(500).json({
            error: 'Failed to submit report'
        });
    }
});

// Get report statistics (admin endpoint - would need authentication in production)
router.get('/stats', async (req, res) => {
    try {
        // In production, fetch from database
        const stats = {
            totalReports: 0,
            pendingReports: 0,
            resolvedReports: 0,
            topReasons: {
                inappropriate_behavior: 0,
                harassment: 0,
                nudity: 0,
                spam: 0,
                underage: 0,
                violence: 0,
                other: 0
            }
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching report stats:', error);
        res.status(500).json({
            error: 'Failed to fetch statistics'
        });
    }
});

module.exports = router;
'''

save_file('backend-rateLimiter.js', rate_limiter_js)
save_file('backend-report-routes.js', report_routes_js)