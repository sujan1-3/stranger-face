// Authentication routes (minimal - no login required)
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Generate anonymous session ID
router.post('/anonymous-session', (req, res) => {
    try {
        const sessionId = uuidv4();
        const userIP = req.ip || req.connection.remoteAddress;

        // In production, you might want to store session info
        const session = {
            id: sessionId,
            ip: userIP,
            createdAt: new Date().toISOString(),
            isAnonymous: true
        };

        res.json({
            sessionId: session.id,
            message: 'Anonymous session created'
        });
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({
            error: 'Failed to create session'
        });
    }
});

// Validate session (if needed)
router.get('/validate/:sessionId', (req, res) => {
    const { sessionId } = req.params;

    // In production, validate against database
    if (sessionId && sessionId.length === 36) {
        res.json({
            valid: true,
            sessionId
        });
    } else {
        res.status(400).json({
            valid: false,
            error: 'Invalid session ID'
        });
    }
});

module.exports = router;
