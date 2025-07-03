const axios = require('axios');
const FormData = require('form-data');
const crypto = require('crypto');

class VideoService {
  constructor() {
    this.openSoraAPI = {
      url: process.env.OPEN_SORA_API_URL || 'https://api.open-sora.com',
      key: process.env.OPEN_SORA_API_KEY
    };
    
    // Alternative video generation services
    this.alternatives = {
      runway: {
        url: 'https://api.runwayml.com',
        key: process.env.RUNWAY_API_KEY
      },
      stability: {
        url: 'https://api.stability.ai',
        key: process.env.STABILITY_API_KEY
      },
      replicate: {
        url: 'https://api.replicate.com',
        key: process.env.REPLICATE_API_TOKEN
      }
    };
    
    // Job tracking
    this.videoJobs = new Map();
    this.progressCallbacks = new Map();
    
    // Video templates for different marketing purposes
    this.templates = {
      product_showcase: {
        duration: 15,
        style: 'professional',
        shots: ['product close-up', 'lifestyle usage', 'features highlight'],
        pacing: 'dynamic'
      },
      brand_story: {
        duration: 30,
        style: 'cinematic',
        shots: ['brand elements', 'customer testimonials', 'behind-the-scenes'],
        pacing: 'emotional'
      },
      social_media: {
        duration: 8,
        style: 'trendy',
        shots: ['hook', 'value proposition', 'call-to-action'],
        pacing: 'fast'
      },
      explainer: {
        duration: 60,
        style: 'educational',
        shots: ['problem', 'solution', 'benefits', 'demonstration'],
        pacing: 'steady'
      }
    };
  }

  // Generate video from text prompt with enhanced features
  async generateVideoFromText(prompt, options = {}, progressCallback = null) {
    const jobId = crypto.randomUUID();
    const defaultOptions = {
      duration: 4,
      fps: 24,
      resolution: '1024x576',
      style: 'cinematic',
      motion_strength: 5,
      quality: 'high',
      aspect_ratio: '16:9',
      model: 'open-sora',
      enhance_prompt: true,
      ...options
    };

    try {
      // Register progress callback
      if (progressCallback) {
        this.progressCallbacks.set(jobId, progressCallback);
      }

      // Initialize job tracking
      this.videoJobs.set(jobId, {
        id: jobId,
        type: 'text-to-video',
        prompt: prompt,
        options: defaultOptions,
        status: 'initializing',
        progress: 0,
        createdAt: new Date(),
        estimatedDuration: this.estimateGenerationTime(defaultOptions)
      });

      // Enhance prompt with AI if requested
      let enhancedPrompt = prompt;
      if (options.enhance_prompt) {
        enhancedPrompt = await this.enhancePrompt(prompt, defaultOptions.style);
      }

      // Update progress
      this.updateProgress(jobId, 10, 'prompt_enhanced');

      // Choose best available model
      const model = this.selectBestModel(defaultOptions.model);
      
      let result;
      switch (model) {
        case 'open-sora':
          result = await this.generateWithOpenSora(enhancedPrompt, defaultOptions, jobId);
          break;
        case 'runway':
          result = await this.generateWithRunway(enhancedPrompt, defaultOptions, jobId);
          break;
        case 'replicate':
          result = await this.generateWithReplicate(enhancedPrompt, defaultOptions, jobId);
          break;
        default:
          result = await this.generateWithMockAPI(enhancedPrompt, defaultOptions, jobId);
      }

      // Final update
      this.updateProgress(jobId, 100, 'completed');

      return {
        success: true,
        jobId,
        videoUrl: result.videoUrl,
        prompt: enhancedPrompt,
        originalPrompt: prompt,
        options: defaultOptions,
        model: model,
        status: 'completed',
        generatedAt: new Date().toISOString(),
        metadata: result.metadata || {}
      };
    } catch (error) {
      console.error('Video generation error:', error);
      this.updateProgress(jobId, -1, 'error', error.message);
      return {
        success: false,
        error: error.message,
        prompt: prompt,
        jobId
      };
    }
  }

  // Generate video from image (Image-to-Video)
  async generateVideoFromImage(imageUrl, prompt, options = {}) {
    const defaultOptions = {
      duration: 4,
      fps: 24,
      motion_strength: 5,
      ...options
    };

    try {
      return {
        success: true,
        videoUrl: await this.mockVideoGeneration(`Image: ${imageUrl}, Prompt: ${prompt}`, defaultOptions),
        sourceImage: imageUrl,
        prompt: prompt,
        options: defaultOptions,
        status: 'completed',
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Image-to-video generation error:', error);
      return {
        success: false,
        error: error.message,
        sourceImage: imageUrl,
        prompt: prompt
      };
    }
  }

  // Create marketing video campaign with templates
  async createMarketingVideo(campaignData, progressCallback = null) {
    const { 
      productName, 
      targetAudience, 
      keyMessage, 
      callToAction,
      style = 'professional',
      template = 'product_showcase',
      duration,
      industry,
      brandColors = [],
      brandPersonality = 'professional'
    } = campaignData;

    // Get template configuration
    const templateConfig = this.templates[template] || this.templates.product_showcase;
    const videoDuration = duration || templateConfig.duration;

    // Build sophisticated prompt
    const videoPrompt = this.buildMarketingPrompt({
      productName,
      targetAudience,
      keyMessage,
      callToAction,
      style,
      template,
      industry,
      brandPersonality,
      duration: videoDuration,
      shots: templateConfig.shots,
      pacing: templateConfig.pacing
    });

    const options = {
      duration: videoDuration,
      fps: 30,
      resolution: '1920x1080',
      style: templateConfig.style,
      motion_strength: 6,
      quality: 'high',
      aspect_ratio: '16:9',
      enhance_prompt: true,
      template: template,
      brandColors: brandColors
    };

    return await this.generateVideoFromText(videoPrompt, options, progressCallback);
  }

  // Build sophisticated marketing prompt
  buildMarketingPrompt(data) {
    const { 
      productName, 
      targetAudience, 
      keyMessage, 
      callToAction,
      style,
      template,
      industry,
      brandPersonality,
      duration,
      shots,
      pacing
    } = data;

    let prompt = `Create a ${duration}-second ${style} marketing video for ${productName}. `;
    
    // Add audience context
    prompt += `Target audience: ${targetAudience}. `;
    
    // Add industry context if provided
    if (industry) {
      prompt += `Industry: ${industry}. `;
    }
    
    // Add brand personality
    prompt += `Brand personality: ${brandPersonality}. `;
    
    // Add key message
    prompt += `Key message: ${keyMessage}. `;
    
    // Add shot structure based on template
    if (shots && shots.length > 0) {
      prompt += `Shot structure: ${shots.join(', ')}. `;
    }
    
    // Add pacing
    prompt += `Pacing: ${pacing}. `;
    
    // Add call to action
    prompt += `Call to action: ${callToAction}. `;
    
    // Add style details
    prompt += `Style: High-quality commercial footage, professional lighting, engaging visuals, `;
    prompt += `${style} aesthetic, modern cinematography, compelling storytelling.`;
    
    return prompt;
  }

  // Enhanced progress tracking
  updateProgress(jobId, progress, status, message = '') {
    const job = this.videoJobs.get(jobId);
    if (job) {
      job.progress = progress;
      job.status = status;
      job.lastUpdate = new Date();
      if (message) job.message = message;
      
      // Call progress callback if registered
      const callback = this.progressCallbacks.get(jobId);
      if (callback) {
        callback({
          jobId,
          progress,
          status,
          message,
          estimatedTimeRemaining: this.estimateTimeRemaining(job)
        });
      }
    }
  }

  // Estimate generation time based on options
  estimateGenerationTime(options) {
    let baseTime = 30; // Base 30 seconds
    baseTime += options.duration * 5; // 5 seconds per video second
    baseTime += options.resolution === '1920x1080' ? 20 : 10; // HD penalty
    baseTime += options.quality === 'high' ? 15 : 0; // Quality penalty
    return baseTime;
  }

  // Estimate time remaining
  estimateTimeRemaining(job) {
    if (job.progress <= 0) return job.estimatedDuration;
    const elapsed = (new Date() - job.createdAt) / 1000;
    const remaining = (elapsed / job.progress) * (100 - job.progress);
    return Math.max(0, remaining);
  }

  // Select best available model
  selectBestModel(preferredModel) {
    const models = this.getAvailableModels();
    
    if (preferredModel && models[preferredModel]?.available) {
      return preferredModel;
    }
    
    // Fallback hierarchy
    if (models.runway?.available) return 'runway';
    if (models.replicate?.available) return 'replicate';
    return 'mock'; // Always available fallback
  }

  // Generate with OpenSora (when available)
  async generateWithOpenSora(prompt, options, jobId) {
    this.updateProgress(jobId, 20, 'preparing_generation');
    
    try {
      // Use local Open-Sora installation via Python subprocess
      const { spawn } = require('child_process');
      const path = require('path');
      const fs = require('fs').promises;
      
      // Create output directory
      const outputDir = path.join(process.cwd(), 'generated_videos');
      await fs.mkdir(outputDir, { recursive: true });
      
      const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const outputPath = path.join(outputDir, `${videoId}.mp4`);
      
      this.updateProgress(jobId, 30, 'initializing_open_sora');
      
      // Enhanced prompt with marketing context
      const enhancedPrompt = this.buildOpenSoraPrompt(prompt, options);
      
      // Open-Sora command arguments
      const openSoraArgs = [
        'scripts/diffusion/inference.py',
        options.resolution === '768x768' ? 'configs/diffusion/inference/768px.py' : 'configs/diffusion/inference/256px.py',
        '--prompt', enhancedPrompt,
        '--save-dir', outputDir,
        '--output-name', videoId,
        '--num_frames', Math.min(options.duration * options.fps, 129).toString(),
        '--aspect_ratio', options.aspect_ratio || '16:9',
        '--motion-score', (options.motion_strength || 5).toString(),
        '--seed', Math.floor(Math.random() * 1000000).toString()
      ];
      
      // Add image-to-video support if source image provided
      if (options.sourceImage) {
        openSoraArgs.push('--cond_type', 'i2v_head', '--ref', options.sourceImage);
      }
      
      this.updateProgress(jobId, 40, 'generating_with_open_sora');
      
      return new Promise((resolve, reject) => {
        const openSoraPath = process.env.OPEN_SORA_PATH || '/path/to/Open-Sora';
        const pythonEnv = process.env.OPEN_SORA_PYTHON || 'python';
        
        const openSoraProcess = spawn(pythonEnv, ['-m', 'torchrun', '--nproc_per_node', '1', '--standalone', ...openSoraArgs], {
          cwd: openSoraPath,
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let output = '';
        let progress = 40;
        
        openSoraProcess.stdout.on('data', (data) => {
          output += data.toString();
          
          // Parse progress from Open-Sora output
          if (data.toString().includes('Step')) {
            progress = Math.min(90, progress + 2);
            this.updateProgress(jobId, progress, 'processing_frames');
          }
        });
        
        openSoraProcess.stderr.on('data', (data) => {
          console.log('Open-Sora stderr:', data.toString());
        });
        
        openSoraProcess.on('close', async (code) => {
          if (code === 0) {
            this.updateProgress(jobId, 95, 'finalizing_video');
            
            // Find generated video file
            try {
              const files = await fs.readdir(outputDir);
              const videoFile = files.find(f => f.startsWith(videoId) && f.endsWith('.mp4'));
              
              if (videoFile) {
                const finalPath = path.join(outputDir, videoFile);
                
                resolve({
                  videoUrl: `/api/video/files/${videoFile}`,
                  localPath: finalPath,
                  metadata: {
                    model: 'open-sora',
                    prompt: enhancedPrompt,
                    resolution: options.resolution,
                    duration: options.duration,
                    motionScore: options.motion_strength,
                    generatedAt: new Date().toISOString()
                  }
                });
              } else {
                reject(new Error('Video file not found after generation'));
              }
            } catch (error) {
              reject(new Error(`Error accessing generated video: ${error.message}`));
            }
          } else {
            reject(new Error(`Open-Sora process failed with code ${code}`));
          }
        });
        
        openSoraProcess.on('error', (error) => {
          reject(new Error(`Failed to start Open-Sora: ${error.message}`));
        });
      });
      
    } catch (error) {
      console.error('Open-Sora generation error:', error);
      
      // Fallback to mock for development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Development mode: Using mock video generation');
        return await this.generateWithMockAPI(prompt, options, jobId);
      }
      
      throw error;
    }
  }
  
  // Build Open-Sora specific prompt
  buildOpenSoraPrompt(basePrompt, options) {
    const style = options.style || 'professional';
    const template = options.template || 'product_showcase';
    
    const stylePrompts = {
      professional: 'professional commercial quality, clean composition, corporate aesthetic, high production value',
      cinematic: 'cinematic quality, dramatic lighting, film grain, movie-like visuals, professional cinematography',
      trendy: 'modern trendy style, vibrant colors, social media aesthetic, contemporary design',
      educational: 'educational video style, clear instructional visuals, easy to understand presentation'
    };
    
    const templatePrompts = {
      product_showcase: 'product demonstration, close-up shots, feature highlights, marketing presentation',
      brand_story: 'brand narrative, storytelling visuals, emotional connection, brand identity',
      social_media: 'social media optimized, attention-grabbing, short-form content, engaging visuals',
      explainer: 'explanatory content, step-by-step visuals, informational presentation, tutorial style'
    };
    
    const qualityPrompts = 'high quality, 4K resolution, professional lighting, smooth motion, detailed visuals';
    
    return [
      basePrompt,
      stylePrompts[style] || stylePrompts.professional,
      templatePrompts[template] || templatePrompts.product_showcase,
      qualityPrompts
    ].join(', ');
  }

  // Generate with Replicate (actual working API)
  async generateWithReplicate(prompt, options, jobId) {
    this.updateProgress(jobId, 20, 'preparing_generation');
    
    if (!this.alternatives.replicate.key) {
      throw new Error('Replicate API key not configured');
    }

    try {
      const response = await axios.post(
        `${this.alternatives.replicate.url}/v1/predictions`,
        {
          version: "9ca635f7fdaa47c5b292c1b677a39f2a4e7ce0b69d2cd47b4e0a3b8b12e4e5c3", // Video generation model
          input: {
            prompt: prompt,
            width: parseInt(options.resolution.split('x')[0]),
            height: parseInt(options.resolution.split('x')[1]),
            num_frames: options.duration * options.fps,
            num_inference_steps: options.quality === 'high' ? 50 : 25
          }
        },
        {
          headers: {
            'Authorization': `Token ${this.alternatives.replicate.key}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.updateProgress(jobId, 40, 'processing');

      // Poll for completion
      const predictionId = response.data.id;
      const result = await this.pollReplicateResult(predictionId, jobId);

      return {
        videoUrl: result.output?.[0] || result.output,
        metadata: {
          predictionId,
          model: 'replicate',
          processingTime: result.processing_time
        }
      };
    } catch (error) {
      console.error('Replicate generation error:', error);
      throw error;
    }
  }

  // Poll Replicate result
  async pollReplicateResult(predictionId, jobId) {
    const maxAttempts = 30;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(
          `${this.alternatives.replicate.url}/v1/predictions/${predictionId}`,
          {
            headers: {
              'Authorization': `Token ${this.alternatives.replicate.key}`
            }
          }
        );

        const status = response.data.status;
        const progress = 40 + (attempts / maxAttempts) * 50; // 40-90% during processing
        
        this.updateProgress(jobId, progress, `processing_${status}`);

        if (status === 'succeeded') {
          return response.data;
        } else if (status === 'failed') {
          throw new Error(`Generation failed: ${response.data.error}`);
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      } catch (error) {
        console.error('Polling error:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      }
    }
    
    throw new Error('Generation timeout');
  }

  // Enhanced mock API with realistic simulation
  async generateWithMockAPI(prompt, options, jobId) {
    this.updateProgress(jobId, 20, 'preparing_generation');
    
    // Simulate various stages of generation
    const stages = [
      { progress: 30, status: 'analyzing_prompt', delay: 1000 },
      { progress: 50, status: 'generating_frames', delay: 2000 },
      { progress: 70, status: 'processing_video', delay: 1500 },
      { progress: 90, status: 'finalizing', delay: 1000 }
    ];

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, stage.delay));
      this.updateProgress(jobId, stage.progress, stage.status);
    }

    return {
      videoUrl: `https://example.com/generated-video-${Date.now()}.mp4`,
      metadata: {
        model: 'mock',
        prompt: prompt,
        processingTime: 5.5
      }
    };
  }

  // Enhance prompt with AI
  async enhancePrompt(originalPrompt, style) {
    try {
      // This would use OpenAI to enhance the prompt
      // For now, return enhanced version with style-specific additions
      const styleEnhancements = {
        cinematic: 'cinematic lighting, dramatic camera angles, film grain',
        professional: 'professional quality, clean composition, corporate style',
        trendy: 'modern aesthetic, vibrant colors, social media ready',
        educational: 'clear visual communication, instructional style, easy to follow'
      };

      const enhancement = styleEnhancements[style] || styleEnhancements.professional;
      return `${originalPrompt} ${enhancement}`;
    } catch (error) {
      console.error('Prompt enhancement error:', error);
      return originalPrompt;
    }
  }

  // Get video generation status
  async getVideoStatus(videoId) {
    return {
      id: videoId,
      status: 'completed',
      progress: 100,
      url: `https://example.com/video-${videoId}.mp4`,
      createdAt: new Date().toISOString()
    };
  }

  // Alternative: Use Runway ML for actual video generation
  async generateWithRunway(prompt, options = {}) {
    if (!this.alternatives.runway.key) {
      throw new Error('Runway API key not configured');
    }

    try {
      const response = await axios.post(
        `${this.alternatives.runway.url}/v1/generate`,
        {
          prompt: prompt,
          model: 'gen-2',
          ...options
        },
        {
          headers: {
            'Authorization': `Bearer ${this.alternatives.runway.key}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        taskId: response.data.id,
        status: 'processing',
        prompt: prompt
      };
    } catch (error) {
      console.error('Runway API error:', error);
      throw error;
    }
  }

  // Get available video models and capabilities
  getAvailableModels() {
    return {
      'open-sora': {
        name: 'Open-Sora',
        available: !!this.openSoraAPI.key,
        capabilities: ['text-to-video', 'image-to-video', 'video-editing'],
        maxDuration: 60,
        resolutions: ['256x256', '512x512', '1024x576', '1920x1080'],
        quality: 'high',
        cost: 'low'
      },
      runway: {
        name: 'Runway Gen-2',
        available: !!this.alternatives.runway.key,
        capabilities: ['text-to-video', 'image-to-video'],
        maxDuration: 18,
        resolutions: ['1280x768', '1920x1080'],
        quality: 'high',
        cost: 'high'
      },
      replicate: {
        name: 'Replicate Video Models',
        available: !!this.alternatives.replicate.key,
        capabilities: ['text-to-video', 'image-to-video'],
        maxDuration: 30,
        resolutions: ['512x512', '1024x576', '1920x1080'],
        quality: 'medium',
        cost: 'medium'
      },
      stability: {
        name: 'Stability AI Video',
        available: !!this.alternatives.stability.key,
        capabilities: ['text-to-video'],
        maxDuration: 25,
        resolutions: ['1024x576', '1280x720'],
        quality: 'medium',
        cost: 'medium'
      },
      mock: {
        name: 'Mock Generator (Demo)',
        available: true,
        capabilities: ['text-to-video', 'image-to-video', 'video-editing'],
        maxDuration: 120,
        resolutions: ['256x256', '512x512', '1024x576', '1920x1080'],
        quality: 'demo',
        cost: 'free'
      }
    };
  }

  // Get job status
  getJobStatus(jobId) {
    const job = this.videoJobs.get(jobId);
    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    return {
      success: true,
      job: {
        id: job.id,
        type: job.type,
        status: job.status,
        progress: job.progress,
        message: job.message,
        createdAt: job.createdAt,
        lastUpdate: job.lastUpdate,
        estimatedTimeRemaining: this.estimateTimeRemaining(job)
      }
    };
  }

  // Get all jobs for a user (if we add user tracking)
  getUserJobs(userId) {
    const userJobs = [];
    for (const [jobId, job] of this.videoJobs.entries()) {
      if (job.userId === userId) {
        userJobs.push({
          id: jobId,
          type: job.type,
          status: job.status,
          progress: job.progress,
          createdAt: job.createdAt,
          lastUpdate: job.lastUpdate
        });
      }
    }
    return userJobs;
  }

  // Cancel a job
  cancelJob(jobId) {
    const job = this.videoJobs.get(jobId);
    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    job.status = 'cancelled';
    job.progress = -1;
    job.lastUpdate = new Date();

    // Clean up callbacks
    this.progressCallbacks.delete(jobId);

    return { success: true, message: 'Job cancelled' };
  }

  // Get video templates
  getVideoTemplates() {
    return {
      templates: this.templates,
      categories: {
        marketing: ['product_showcase', 'brand_story'],
        social: ['social_media'],
        educational: ['explainer']
      }
    };
  }

  // Batch video generation
  async generateVideoBatch(prompts, options = {}, progressCallback = null) {
    const batchId = crypto.randomUUID();
    const jobs = [];

    try {
      for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        const batchOptions = {
          ...options,
          batchId,
          batchIndex: i,
          batchTotal: prompts.length
        };

        const job = await this.generateVideoFromText(prompt, batchOptions, progressCallback);
        jobs.push(job);
      }

      return {
        success: true,
        batchId,
        jobs: jobs,
        total: prompts.length
      };
    } catch (error) {
      console.error('Batch generation error:', error);
      return {
        success: false,
        error: error.message,
        batchId,
        jobs: jobs // Return partial results
      };
    }
  }

  // Clean up old jobs (call this periodically)
  cleanupOldJobs(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    const now = new Date();
    const toDelete = [];

    for (const [jobId, job] of this.videoJobs.entries()) {
      if (now - job.createdAt > maxAge) {
        toDelete.push(jobId);
      }
    }

    toDelete.forEach(jobId => {
      this.videoJobs.delete(jobId);
      this.progressCallbacks.delete(jobId);
    });

    return { cleaned: toDelete.length };
  }
}

module.exports = VideoService; 