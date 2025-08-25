// Report handling routes
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
