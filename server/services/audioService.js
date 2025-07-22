const axios = require('axios');
const Audio = require('../models/Audio');
const crypto = require('crypto');

class AudioService {
  constructor() {
    this.providers = {
      elevenlabs: {
        name: 'ElevenLabs',
        free: false,
        apiUrl: 'https://api.elevenlabs.io/v1/text-to-speech',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
          'Content-Type': 'application/json'
        }
      }
      // Add other providers as needed
    };
    this.activeJobs = new Map();
  }

  async generateAudio(prompt, options = {}) {
    const jobId = crypto.randomUUID();
    const {
      provider = 'elevenlabs',
      voice = 'default',
      model = 'default',
      // ...other options
    } = options;

    this.activeJobs.set(jobId, {
      jobId,
      prompt,
      provider,
      status: 'initializing',
      progress: 0,
      createdAt: new Date()
    });

    try {
      this.updateProgress(jobId, 10, 'processing_prompt');
      let result;
      try {
        result = await this.generateWithProvider(provider, prompt, { voice, model });
      } catch (err) {
        throw new Error('Audio provider error: ' + err.message);
      }
      this.updateProgress(jobId, 80, 'saving_audio');
      // Save audio to MongoDB
      const buffer = Buffer.isBuffer(result.audio) ? result.audio : Buffer.from(result.audio, 'base64');
      const audioDoc = new Audio({
        data: buffer,
        provider,
        prompt,
        createdAt: new Date()
      });
      await audioDoc.save();
      this.updateProgress(jobId, 100, 'completed');
      return audioDoc;
    } catch (error) {
      this.updateProgress(jobId, 100, 'error', error.message);
      throw error;
    }
  }

  // ... keep your provider methods, but remove all fs/path usage ...

  updateProgress(jobId, progress, status, message = '') {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.progress = progress;
      job.status = status;
      job.message = message;
      job.updatedAt = new Date();
    }
  }

  getJobStatus(jobId) {
    return this.activeJobs.get(jobId) || null;
  }

  async getGeneratedAudios() {
    // Get the 20 most recent audios from MongoDB
    return await Audio.find().sort({ createdAt: -1 }).limit(20);
  }
}

module.exports = AudioService; 