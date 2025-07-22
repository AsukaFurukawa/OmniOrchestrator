const express = require('express');
const router = express.Router();
const Audio = require('../models/Audio');

// GET /api/audio - return latest audio
router.get('/', async (req, res) => {
  try {
    const audios = await Audio.find().sort({ createdAt: -1 }).limit(20);
    res.json(audios);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audio' });
  }
});

module.exports = router; 