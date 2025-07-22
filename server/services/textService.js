const axios = require('axios');
const Text = require('../models/Text');
const crypto = require('crypto');

class TextService {
  constructor() {
    this.providers = {
      openai: {
        name: 'OpenAI',
        free: false,
        apiUrl: 'https://api.openai.com/v1/completions',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY || ''}`,
          'Content-Type': 'application/json'
        }
      }
      // Add other providers as needed
    };
    this.activeJobs = new Map();
  }

  async generateText(prompt, options = {}) {
    const jobId = crypto.randomUUID();
    const {
      provider = 'openai',
      model = 'gpt-4o',
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
        result = await this.generateWithProvider(provider, prompt, { model });
      } catch (err) {
        throw new Error('Text provider error: ' + err.message);
      }
      this.updateProgress(jobId, 80, 'saving_text');
      // Save text to MongoDB
      const textDoc = new Text({
        content: result.text,
        provider,
        prompt,
        createdAt: new Date()
      });
      await textDoc.save();
      this.updateProgress(jobId, 100, 'completed');
      return textDoc;
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

  async getGeneratedTexts() {
    // Get the 20 most recent texts from MongoDB
    return await Text.find().sort({ createdAt: -1 }).limit(20);
  }
}

module.exports = TextService; 