require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const counterRoutes = require('./routes/counter');

// ─── Config ───
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/the100000gate';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ─── Express App ───
const app = express();
const server = http.createServer(app);

// ─── Socket.io ───
const io = new Server(server, {
  cors: {
    origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Store io instance on app for use in routes
app.set('io', io);

// ─── Middleware ───
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());

// ─── Request Logger ───
app.use((req, res, next) => {
  const timestamp = new Date().toISOString().slice(11, 19);
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ───
app.use('/api/counter', counterRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'alive',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    connectedClients: io.engine.clientsCount,
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    name: 'The 100,000 Gate — Backend',
    version: '1.0.0',
    endpoints: {
      'GET /api/counter': 'Get current count',
      'POST /api/counter/click': 'Increment counter',
      'GET /api/counter/status': 'Detailed status',
      'GET /api/health': 'Server health check',
    },
    websocket: 'Connect via Socket.io for real-time updates',
  });
});

// ─── Socket.io Events ───
io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id} (Total: ${io.engine.clientsCount})`);

  // Send current count on connect
  const Counter = require('./models/Counter');
  Counter.findOne({ name: 'global' })
    .then((counter) => {
      socket.emit('counter:update', { count: counter ? counter.count : 0 });
    })
    .catch(() => {
      socket.emit('counter:update', { count: 0 });
    });

  // Handle click from client
  socket.on('counter:click', async () => {
    try {
      const counter = await Counter.findOneAndUpdate(
        { name: 'global' },
        { $inc: { count: 1 }, lastClickedAt: new Date() },
        { new: true, upsert: true }
      );

      // Broadcast to ALL clients
      io.emit('counter:update', { count: counter.count });

      // Check 100K
      if (counter.count >= 100000) {
        io.emit('counter:unlocked', {
          message: 'You opened what should never have been opened.',
          count: counter.count,
        });
      }
    } catch (err) {
      console.error('Socket click error:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`💀 Client disconnected: ${socket.id} (Total: ${io.engine.clientsCount})`);
  });
});

// ─── MongoDB Connection & Server Start ───
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('   🩸 THE 100,000 GATE — Backend Server');
    console.log('═══════════════════════════════════════════');
    console.log(`   🔗 MongoDB: Connected`);
    console.log(`   🌐 Server:  http://localhost:${PORT}`);
    console.log(`   🎮 Frontend: ${FRONTEND_URL}`);
    console.log(`   ⚡ Socket.io: Active`);
    console.log('═══════════════════════════════════════════');
    console.log('');

    server.listen(PORT);
  })
  .catch((err) => {
    console.error('');
    console.error('═══════════════════════════════════════════');
    console.error('   ❌ MongoDB Connection Failed');
    console.error(`   ${err.message}`);
    console.error('');
    console.error('   Make sure MongoDB is running or update');
    console.error('   MONGODB_URI in backend/.env');
    console.error('═══════════════════════════════════════════');
    console.error('');
    process.exit(1);
  });
