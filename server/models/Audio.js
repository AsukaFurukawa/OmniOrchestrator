const mongoose = require('mongoose');

const audioSchema = new mongoose.Schema({
  data: Buffer, // Store audio binary data
  provider: String,
  prompt: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Audio', audioSchema); 