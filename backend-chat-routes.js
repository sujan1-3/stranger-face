// Chat-related routes
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
