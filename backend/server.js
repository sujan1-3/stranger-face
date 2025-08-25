const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const fetch = require('node-fetch');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://stranger-face.vercel.app']
      : ['http://localhost:3000','http://localhost:3001'],
    methods: ['GET','POST'],
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
    : ['http://localhost:3000','http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Health
app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Xirsys TURN proxy (server-side) — DO NOT expose secret on the client
// Required env:
// XIRSYS_IDENT, XIRSYS_SECRET, XIRSYS_CHANNEL (e.g. "stranger-face")
app.get('/ice', async (req, res) => {
  try {
    const ident = process.env.XIRSYS_IDENT;
    const secret = process.env.XIRSYS_SECRET;
    const channel = process.env.XIRSYS_CHANNEL || 'stranger-face';
    if (!ident || !secret) {
      return res.status(500).json({ error: 'Xirsys credentials missing on server' });
    }

    // Xirsys “list” endpoint per dashboard Quick Example
    const url = `https://global.xirsys.net/_turn/${encodeURIComponent(channel)}`;
    const r = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${ident}:${secret}`).toString('base64')
      },
      body: JSON.stringify({ format: 'urls' })
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: 'Xirsys request failed', details: text });
    }

    const data = await r.json();
    // data.iceServers is already in RTCConfiguration format
    res.json({ iceServers: data.v?.iceServers || data.iceServers || [] });
  } catch (e) {
    console.error('ICE fetch error:', e);
    res.status(500).json({ error: 'Failed to fetch ICE servers' });
  }
});

// In-memory matching
const waitingUsers = new Map();
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  userSockets.set(socket.id, socket);

  socket.userInfo = { id: socket.id, hobby: null };

  socket.on('set-hobby-preference', (hobby) => {
    socket.userInfo.hobby = hobby;
    console.log(`User ${socket.id} set hobby: ${hobby}`);
  });

  socket.on('find-match', () => {
    if (!socket.userInfo.hobby) {
      socket.emit('error', { message: 'Set hobby first' });
      return;
    }

    // Try to find someone waiting with same hobby
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
      return;
    }

    const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
    socket.join(roomId);
    matched.join(roomId);
    socket.roomId = roomId;
    matched.roomId = roomId;
    socket.partnerId = matched.id;
    matched.partnerId = socket.id;

    // Notify both
    const payloadA = { roomId, partner: { hobby: matched.userInfo.hobby } };
    const payloadB = { roomId, partner: { hobby: socket.userInfo.hobby } };
    socket.emit('match-found', payloadA);
    matched.emit('match-found', payloadB);
  });

  // Signaling relay
  socket.on('offer', (d) => {
    if (socket.partnerId) userSockets.get(socket.partnerId)?.emit('offer', d);
  });
  socket.on('answer', (d) => {
    if (socket.partnerId) userSockets.get(socket.partnerId)?.emit('answer', d);
  });
  socket.on('ice-candidate', (d) => {
    if (socket.partnerId) userSockets.get(socket.partnerId)?.emit('ice-candidate', d);
  });

  socket.on('next-stranger', () => {
    cleanupPair(socket);
    socket.emit('find-match');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
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
  console.log(`Server on :${PORT}`);
});
