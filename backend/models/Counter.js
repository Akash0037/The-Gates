const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    default: 'global',
  },
  count: {
    type: Number,
    required: true,
    default: 0,
  },
  lastClickedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Counter', counterSchema);
