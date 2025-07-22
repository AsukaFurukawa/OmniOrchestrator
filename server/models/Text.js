const mongoose = require('mongoose');

const textSchema = new mongoose.Schema({
  content: String, // The generated text
  provider: String,
  prompt: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Text', textSchema); 