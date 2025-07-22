const express = require('express');
const router = express.Router();
const Text = require('../models/Text');

// GET /api/text - return latest text
router.get('/', async (req, res) => {
  try {
    const texts = await Text.find().sort({ createdAt: -1 }).limit(20);
    res.json(texts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch text' });
  }
});

module.exports = router; 