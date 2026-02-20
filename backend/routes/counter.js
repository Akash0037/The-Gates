const express = require('express');
const router = express.Router();
const Counter = require('../models/Counter');

// GET /api/counter — fetch current count
router.get('/', async (req, res) => {
  try {
    let counter = await Counter.findOne({ name: 'global' });
    if (!counter) {
      counter = await Counter.create({ name: 'global', count: 0 });
    }
    res.json({ count: counter.count, goal: 100000 });
  } catch (err) {
    console.error('GET /api/counter error:', err.message);
    res.status(500).json({ error: 'Failed to fetch counter' });
  }
});

// POST /api/counter/click — increment count
router.post('/click', async (req, res) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: 'global' },
      { $inc: { count: 1 }, lastClickedAt: new Date() },
      { new: true, upsert: true }
    );

    // Emit to all connected Socket.io clients
    const io = req.app.get('io');
    if (io) {
      io.emit('counter:update', { count: counter.count });

      // Check if 100K milestone reached
      if (counter.count >= 100000) {
        io.emit('counter:unlocked', {
          message: 'You opened what should never have been opened.',
          count: counter.count,
        });
      }
    }

    res.json({ count: counter.count });
  } catch (err) {
    console.error('POST /api/counter/click error:', err.message);
    res.status(500).json({ error: 'Failed to increment counter' });
  }
});

// GET /api/counter/status — detailed status
router.get('/status', async (req, res) => {
  try {
    const counter = await Counter.findOne({ name: 'global' });
    const count = counter ? counter.count : 0;
    res.json({
      count,
      goal: 100000,
      progress: ((count / 100000) * 100).toFixed(2) + '%',
      unlocked: count >= 100000,
      lastClickedAt: counter ? counter.lastClickedAt : null,
    });
  } catch (err) {
    console.error('GET /api/counter/status error:', err.message);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

module.exports = router;
