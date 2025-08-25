# 7. Chat routes - Exact content
chat_routes_js = '''// Chat-related routes
const express = require('express');
const router = express.Router();
const { getCachedLocationFromIP } = require('../utils/geolocation');

// Get user's location info
router.get('/location', async (req, res) => {
    try {
        const userIP = req.ip || req.connection.remoteAddress;
        const location = await getCachedLocationFromIP(userIP);
        
        res.json({
            country: location.country,
            countryCode: location.countryCode,
            flag: location.flag,
            city: location.city,
            region: location.region
        });
    } catch (error) {
        console.error('Error getting location:', error);
        res.status(500).json({
            error: 'Failed to get location'
        });
    }
});

// Get chat statistics
router.get('/stats', async (req, res) => {
    try {
        // In production, get real stats from Socket.io instance or database
        const stats = {
            activeUsers: Math.floor(Math.random() * 1000) + 500,
            totalChats: Math.floor(Math.random() * 10000) + 5000,
            countriesOnline: Math.floor(Math.random() * 50) + 30,
            averageWaitTime: '< 10 seconds'
        };

        res.json(stats);
    } catch (error) {
        console.error('Error getting chat stats:', error);
        res.status(500).json({
            error: 'Failed to get statistics'
        });
    }
});

// Test endpoint for WebRTC connectivity
router.get('/test-connection', (req, res) => {
    res.json({
        status: 'OK',
        webRTCSupported: true,
        serverTime: new Date().toISOString()
    });
});

module.exports = router;
'''

# 8. Auth routes - Exact content
auth_routes_js = '''// Authentication routes (minimal - no login required)
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
'''

save_file('backend-chat-routes.js', chat_routes_js)
save_file('backend-auth-routes.js', auth_routes_js)