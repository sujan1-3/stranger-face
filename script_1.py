# BACKEND FILES - Exact content from previous generation

# 1. Backend server.js - Main Express server with Socket.io
server_js = '''// Stranger Face Backend Server
// Node.js + Express + Socket.io + WebRTC Signaling Server

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

// Import routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const reportRoutes = require('./routes/report');

// Import middleware
const rateLimiter = require('./middleware/rateLimiter');

// Import utilities
const { getLocationFromIP } = require('./utils/geolocation');
const SocketManager = require('./utils/socketManager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' 
            ? ["https://strangerface.com", "https://www.strangerface.com"]
            : ["http://localhost:3000", "http://localhost:3001"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Environment configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "wss:", "ws:"]
        }
    }
}));

app.use(compression());
app.use(cors({
    origin: NODE_ENV === 'production' 
        ? ["https://strangerface.com", "https://www.strangerface.com"]
        : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', rateLimiter.general);
app.use('/api/report', rateLimiter.report);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/report', reportRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV
    });
});

// Initialize Socket Manager for WebRTC signaling and matching
const socketManager = new SocketManager(io);

// Socket.io connection handling for WebRTC signaling
io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Get user's location from IP
    const userIP = socket.request.connection.remoteAddress || socket.handshake.address;
    const location = await getLocationFromIP(userIP);
    
    // Store user info
    socket.userInfo = {
        id: socket.id,
        ip: userIP,
        country: location.country,
        countryCode: location.countryCode,
        flag: location.flag,
        city: location.city,
        connectedAt: new Date(),
        isMatched: false,
        preferences: { hobby: null }
    };

    // Handle hobby preference setting
    socket.on('set-hobby-preference', (hobbyPreference) => {
        socket.userInfo.preferences.hobby = hobbyPreference;
        console.log(`User ${socket.id} set hobby preference: ${hobbyPreference}`);
    });

    // Handle user wanting to start chat
    socket.on('find-match', async () => {
        try {
            await socketManager.findMatch(socket);
        } catch (error) {
            console.error('Error finding match:', error);
            socket.emit('error', { message: 'Failed to find a match' });
        }
    });

    // WebRTC signaling handlers
    socket.on('offer', (data) => {
        if (socket.matchedWith) {
            socket.to(socket.matchedWith).emit('offer', {
                ...data,
                from: socket.id,
                userInfo: socket.userInfo
            });
        }
    });

    socket.on('answer', (data) => {
        if (socket.matchedWith) {
            socket.to(socket.matchedWith).emit('answer', {
                ...data,
                from: socket.id
            });
        }
    });

    socket.on('ice-candidate', (data) => {
        if (socket.matchedWith) {
            socket.to(socket.matchedWith).emit('ice-candidate', {
                ...data,
                from: socket.id
            });
        }
    });

    // Handle next stranger request
    socket.on('next-stranger', () => {
        socketManager.handleNextStranger(socket);
    });

    // Handle report
    socket.on('report-user', (reportData) => {
        socketManager.handleReport(socket, reportData);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        socketManager.handleDisconnection(socket);
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({
        error: NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

server.listen(PORT, () => {
    console.log(`Stranger Face server running on port ${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
});

module.exports = { app, server, io };
'''

# 2. Backend package.json
backend_package_json = '''{
  "name": "stranger-face-backend",
  "version": "1.0.0",
  "description": "Backend server for Stranger Face video chat platform",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "lint": "eslint .",
    "pm2:start": "pm2 start server.js --name stranger-face-backend",
    "pm2:stop": "pm2 stop stranger-face-backend",
    "pm2:restart": "pm2 restart stranger-face-backend"
  },
  "keywords": [
    "webrtc",
    "video-chat",
    "socket.io",
    "nodejs",
    "express",
    "stranger-chat",
    "hobby-matching"
  ],
  "author": "Stranger Face Team",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.4",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5",
    "axios": "^1.6.2",
    "uuid": "^9.0.1",
    "joi": "^17.11.0",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "eslint": "^8.55.0",
    "supertest": "^6.3.3"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}'''

save_file('backend-server.js', server_js)
save_file('backend-package.json', backend_package_json)