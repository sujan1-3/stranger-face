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
      ? ['https://stranger-face.vercel.app']
      : ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://stranger-face.vercel.app']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Xirsys ICE servers endpoint (server-side for security)
app.get('/ice', async (req, res) => {
  try {
    // Use your Xirsys credentials from environment variables
    const ident = process.env.XIRSYS_IDENT || 'gazxsw12345'; // From your screenshot
    const secret = process.env.XIRSYS_SECRET || 'faba1ca0-819c-11f0-942e-0242ac140002'; // From your screenshot  
    const channel = process.env.XIRSYS_CHANNEL || 'stranger-face'; // From your screenshot

    const url = `https://global.xirsys.net/_turn/${encodeURIComponent(channel)}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${ident}:${secret}`).toString('base64')
      },
      body: JSON.stringify({ format: 'urls' })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Xirsys error:', text);
      return res.status(500).json({ 
        error: 'TURN server unavailable',
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302'] } // Fallback STUN only
        ]
      });
    }

    const data = await response.json();
    console.log('✅ Xirsys TURN servers fetched');
    res.json({ iceServers: data.v?.iceServers || data.iceServers || [] });
    
  } catch (error) {
    console.error('❌ ICE fetch failed:', error);
    res.status(500).json({ 
      error: 'Failed to fetch ICE servers',
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302'] } // Fallback STUN only
      ]
    });
  }
});

// WebRTC signaling and matching
const waitingUsers = new Map();
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);
  userSockets.set(socket.id, socket);
  socket.userInfo = { id: socket.id, hobby: null };

  socket.on('set-hobby-preference', (hobby) => {
    socket.userInfo.hobby = hobby;
    console.log(`🎯 User ${socket.id} set hobby: ${hobby}`);
  });

  socket.on('find-match', () => {
    if (!socket.userInfo.hobby) {
      socket.emit('error', { message: 'Please select a hobby first' });
      return;
    }

    // Find someone waiting with same hobby
    let matched = null;
    for (const [id, s] of waitingUsers) {
      if (s.userInfo?.hobby === socket.userInfo.hobby) {
        matched = s;
        waitingUsers.delete(id);
        break;
      }
    }

    if (!matched) {
      waitingUsers.set(socket.id, socket);
      socket.emit('waiting-for-match');
      console.log(`⏳ User ${socket.id} waiting for ${socket.userInfo.hobby} match`);
      return;
    }

    // Create room and notify both users
    const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    socket.join(roomId);
    matched.join(roomId);
    socket.roomId = roomId;
    matched.roomId = roomId;
    socket.partnerId = matched.id;
    matched.partnerId = socket.id;

    const matchData = {
      roomId,
      partner: { 
        hobby: matched.userInfo.hobby,
        country: 'Unknown',
        flag: '🌍' 
      }
    };
    
    socket.emit('match-found', matchData);
    matched.emit('match-found', {
      ...matchData,
      partner: { 
        hobby: socket.userInfo.hobby,
        country: 'Unknown', 
        flag: '🌍'
      }
    });
    
    console.log(`🎉 Match created: ${socket.id} ↔ ${matched.id} (${socket.userInfo.hobby})`);
  });

  // WebRTC signaling relay
  socket.on('offer', (data) => {
    if (socket.partnerId) {
      console.log(`📞 Relaying offer: ${socket.id} → ${socket.partnerId}`);
      userSockets.get(socket.partnerId)?.emit('offer', data);
    }
  });

  socket.on('answer', (data) => {
    if (socket.partnerId) {
      console.log(`✅ Relaying answer: ${socket.id} → ${socket.partnerId}`);
      userSockets.get(socket.partnerId)?.emit('answer', data);
    }
  });

  socket.on('ice-candidate', (data) => {
    if (socket.partnerId) {
      userSockets.get(socket.partnerId)?.emit('ice-candidate', data);
    }
  });

  socket.on('next-stranger', () => {
    console.log(`➡️ User ${socket.id} requesting next stranger`);
    cleanupPair(socket);
    socket.emit('find-match');
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    waitingUsers.delete(socket.id);
    cleanupPair(socket);
    userSockets.delete(socket.id);
  });
});

function cleanupPair(socket) {
  if (socket.partnerId) {
    const partner = userSockets.get(socket.partnerId);
    if (partner) {
      partner.emit('partner-disconnected');
      partner.leave(socket.roomId);
      partner.partnerId = null;
      partner.roomId = null;
    }
  }
  socket.leave(socket.roomId);
  socket.partnerId = null;
  socket.roomId = null;
}

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
