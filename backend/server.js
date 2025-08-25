// Stranger Face Backend Server - Complete WebRTC Signaling and Matching
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' 
            ? ["https://stranger-face.vercel.app", "https://www.strangerface.com"]
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
    contentSecurityPolicy: false // Allow WebRTC
}));

app.use(compression());
app.use(cors({
    origin: NODE_ENV === 'production' 
        ? ["https://stranger-face.vercel.app", "https://www.strangerface.com"]
        : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint - MUST come before 404 handler
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV,
        activeUsers: waitingUsers.size,
        activeRooms: activeRooms.size
    });
});

// Simple API endpoints
app.get('/api/chat/stats', (req, res) => {
    res.json({
        activeUsers: waitingUsers.size,
        activeRooms: activeRooms.size,
        totalConnections: io.sockets.sockets.size
    });
});

app.get('/api/chat/location', (req, res) => {
    res.json({
        country: 'Demo Country',
        countryCode: 'XX',
        flag: '🌍',
        city: 'Demo City'
    });
});

// 404 handler MUST come last
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// In-memory storage for users and rooms
const waitingUsers = new Map();
const activeRooms = new Map();
const userSockets = new Map();

// Socket.io connection handling WITH complete WebRTC signaling
io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);
    
    // Store user socket
    userSockets.set(socket.id, socket);
    
    // User info
    socket.userInfo = {
        id: socket.id,
        hobby: null,
        country: 'Unknown',
        countryCode: 'XX',
        flag: '🌍',
        connectedAt: new Date()
    };

    // Handle hobby preference setting
    socket.on('set-hobby-preference', (hobbyPreference) => {
        console.log(`🎯 User ${socket.id} set hobby preference: ${hobbyPreference}`);
        socket.userInfo.hobby = hobbyPreference;
    });

    // Handle match finding - COMPLETE IMPLEMENTATION
    socket.on('find-match', () => {
        console.log(`[FIND-MATCH] Event received from user ${socket.id} with hobby: ${socket.userInfo.hobby}`);

        if (!socket.userInfo.hobby) {
            console.log(`[WARNING] User ${socket.id} has not set hobby yet`);
            socket.emit('error', { message: 'Set hobby preference first!' });
            return;
        }

        // Remove from waiting list if present
        if (waitingUsers.has(socket.id)) {
            waitingUsers.delete(socket.id);
            console.log(`[INFO] Removed user ${socket.id} from waiting list for restart`);
        }

        console.log(`[CURRENT WAITING] ${waitingUsers.size} users waiting`);

        // Try to find a match
        let matchFound = false;

        for (const [waitingId, waitingSocket] of waitingUsers) {
            console.log(`[CHECK] Checking waiting user ${waitingId} with hobby: ${waitingSocket.userInfo.hobby}`);

            if (waitingSocket.userInfo.hobby === socket.userInfo.hobby) {
                console.log(`[MATCH FOUND] ${socket.id} <-> ${waitingId}`);

                // Remove matched user from waiting list
                waitingUsers.delete(waitingId);

                // Create room
                const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                // Join both users to room
                socket.join(roomId);
                waitingSocket.join(roomId);

                // Store room info
                activeRooms.set(roomId, {
                    user1: socket.id,
                    user2: waitingId,
                    hobby: socket.userInfo.hobby,
                    startTime: new Date()
                });

                // Set room info on sockets
                socket.roomId = roomId;
                socket.partnerId = waitingId;
                waitingSocket.roomId = roomId;
                waitingSocket.partnerId = socket.id;

                console.log(`[EMIT] Emitting match-found to ${socket.id} and ${waitingId}`);

                // Notify both users
                socket.emit('match-found', {
                    roomId: roomId,
                    partner: {
                        country: waitingSocket.userInfo.country,
                        countryCode: waitingSocket.userInfo.countryCode,
                        flag: waitingSocket.userInfo.flag,
                        hobby: waitingSocket.userInfo.hobby
                    }
                });

                waitingSocket.emit('match-found', {
                    roomId: roomId,
                    partner: {
                        country: socket.userInfo.country,
                        countryCode: socket.userInfo.countryCode,
                        flag: socket.userInfo.flag,
                        hobby: socket.userInfo.hobby
                    }
                });

                matchFound = true;
                break;
            }
        }

        if (!matchFound) {
            // Add to waiting list
            waitingUsers.set(socket.id, socket);
            console.log(`[WAIT] Added user ${socket.id} to waiting list. Total waiting: ${waitingUsers.size}`);
            socket.emit('waiting-for-match');
        }
    });

    // WebRTC Signaling Handlers
    socket.on('offer', (data) => {
        console.log(`📞 Offer from ${socket.id} to partner`);
        if (socket.partnerId) {
            const partnerSocket = userSockets.get(socket.partnerId);
            if (partnerSocket) {
                partnerSocket.emit('offer', {
                    offer: data.offer,
                    from: socket.id
                });
            }
        }
    });

    socket.on('answer', (data) => {
        console.log(`✅ Answer from ${socket.id} to partner`);
        if (socket.partnerId) {
            const partnerSocket = userSockets.get(socket.partnerId);
            if (partnerSocket) {
                partnerSocket.emit('answer', {
                    answer: data.answer,
                    from: socket.id
                });
            }
        }
    });

    socket.on('ice-candidate', (data) => {
        console.log(`🧊 ICE candidate from ${socket.id} to partner`);
        if (socket.partnerId) {
            const partnerSocket = userSockets.get(socket.partnerId);
            if (partnerSocket) {
                partnerSocket.emit('ice-candidate', {
                    candidate: data.candidate,
                    from: socket.id
                });
            }
        }
    });

    // Handle next stranger
    socket.on('next-stranger', () => {
        console.log(`➡️ ${socket.id} wants next stranger`);
        handleDisconnection(socket, false);
        
        // Start new search
        setTimeout(() => {
            socket.emit('find-match');
        }, 1000);
    });

    // Handle report
    socket.on('report-user', (data) => {
        console.log(`⚠️ User ${socket.id} reported partner`);
        // In production, save to database
        handleDisconnection(socket, false);
    });

    // Handle emoji reactions
    socket.on('emoji-reaction', (data) => {
        if (socket.partnerId) {
            const partnerSocket = userSockets.get(socket.partnerId);
            if (partnerSocket) {
                partnerSocket.emit('emoji-reaction', {
                    emoji: data.emoji,
                    from: socket.id
                });
            }
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.id}`);
        handleDisconnection(socket, true);
    });
});

// Handle user disconnection
function handleDisconnection(socket, isDisconnecting = false) {
    // Remove from waiting list
    waitingUsers.delete(socket.id);
    
    // Handle active room
    if (socket.roomId && socket.partnerId) {
        const partnerSocket = userSockets.get(socket.partnerId);
        
        if (partnerSocket) {
            // Notify partner
            partnerSocket.emit('partner-disconnected');
            
            // Clean up partner
            partnerSocket.leave(socket.roomId);
            delete partnerSocket.roomId;
            delete partnerSocket.partnerId;
        }
        
        // Clean up room
        activeRooms.delete(socket.roomId);
        socket.leave(socket.roomId);
        delete socket.roomId;
        delete socket.partnerId;
    }
    
    // Remove from user sockets if disconnecting
    if (isDisconnecting) {
        userSockets.delete(socket.id);
    }
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({
        error: NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message
    });
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
    console.log(`🚀 Stranger Face server running on port ${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`CORS Origins: ${NODE_ENV === 'production' ? 'https://stranger-face.vercel.app' : 'http://localhost:3000'}`);
});

module.exports = { app, server, io };
