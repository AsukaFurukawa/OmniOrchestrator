const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  data: Buffer, // Store image binary data
  provider: String,
  prompt: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Image', imageSchema); 