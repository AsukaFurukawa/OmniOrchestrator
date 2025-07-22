const express = require('express');
const axios = require('axios');
const router = express.Router();
const FormData = require('form-data');

// Add body parsing middleware
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// In-memory job store for demo
const vadooJobs = {};

// Vadoo AI Webhook endpoint
router.post('/webhook', (req, res) => {
  console.log('🎬 Vadoo AI Webhook received:', req.body);
  // Store video info by vid
  if (req.body && req.body.vid) {
    vadooJobs[req.body.vid] = req.body;
  }
  res.status(200).json({ success: true });
});

// Trigger Vadoo AI video generation
router.post('/generate-video', async (req, res) => {
  try {
    const { prompt, style, duration, aspect_ratio } = req.body;
    const apiKey = process.env.VADOO_API_KEY;
    if (!apiKey) return res.status(400).json({ success: false, error: 'VADOO_API_KEY not set' });
    // Compose request body
    const body = {
      topic: 'Custom',
      prompt,
      style: style || 'None',
      duration: duration || '30-60',
      aspect_ratio: aspect_ratio || '16:9',
      use_ai: '1',
      include_voiceover: '1',
    };
    const response = await axios.post('https://viralapi.vadoo.tv/api/generate_video', body, {
      headers: { 'X-API-KEY': apiKey }
    });
    if (response.data && response.data.vid) {
      // Store job as pending
      vadooJobs[response.data.vid] = { status: 'pending' };
      res.json({ success: true, jobId: response.data.vid });
    } else {
      res.status(500).json({ success: false, error: 'No vid returned from Vadoo AI' });
    }
  } catch (error) {
    console.error('Vadoo AI generate-video error:', error.message, error.response?.data);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Poll for video status
router.get('/video-status', (req, res) => {
  const jobId = req.query.jobId;
  if (!jobId) return res.status(400).json({ success: false, error: 'Missing jobId' });
  const job = vadooJobs[jobId];
  if (job && job.video_url) {
    res.json({ success: true, videoUrl: job.video_url, metadata: job });
  } else {
    res.json({ success: false });
  }
});

// Pika Labs (ImagineArt) text-to-video generation endpoint
router.post('/generate-pika-video', async (req, res) => {
  console.log('Pika Labs request body:', req.body);
  console.log('IMAGINE_TOKEN:', process.env.IMAGINE_TOKEN ? 'set' : 'not set');
  try {
    const { prompt, style = 'kling-1.0-pro' } = req.body;
    if (!process.env.IMAGINE_TOKEN) return res.status(400).json({ success: false, error: 'IMAGINE_TOKEN not set' });
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) return res.status(400).json({ success: false, error: 'Prompt is required' });
    const apiKey = process.env.IMAGINE_TOKEN;

    const form = new FormData();
    form.append('prompt', prompt);
    form.append('style', style);

    const response = await axios.post(
      'https://api.vyro.ai/v2/video/text-to-video',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': apiKey
        }
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Pika Labs generate-video error:', error.message, error.response?.data);
    res.status(500).json({ success: false, error: error.message, details: error.response?.data });
  }
});

module.exports = router; 