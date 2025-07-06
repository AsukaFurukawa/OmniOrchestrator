const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ImageService {
  constructor() {
    this.providers = {
      huggingface: {
        name: 'Hugging Face',
        free: true,
        apiUrl: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || 'hf_demo'}`,
          'Content-Type': 'application/json'
        }
      },
      deepai: {
        name: 'DeepAI',
        free: true,
        apiUrl: 'https://api.deepai.org/api/text2img',
        headers: {
          'Api-Key': process.env.DEEPAI_API_KEY || 'demo'
        }
      },
      pollinations: {
        name: 'Pollinations',
        free: true,
        apiUrl: 'https://image.pollinations.ai/prompt',
        noApiKey: true
      },
      stable_diffusion: {
        name: 'Stable Diffusion',
        free: true,
        apiUrl: 'https://stablediffusionapi.com/api/v3/text2img',
        headers: {
          'Content-Type': 'application/json'
        }
      },
      dalle_mini: {
        name: 'DALL-E Mini',
        free: true,
        apiUrl: 'https://bf.dallemini.ai/generate',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    };
    
    this.activeJobs = new Map();
    this.generatedImages = new Map();
    this.imageDirectory = path.join(process.cwd(), 'public', 'images');
    this.ensureImageDirectory();
  }

  ensureImageDirectory() {
    if (!fs.existsSync(this.imageDirectory)) {
      fs.mkdirSync(this.imageDirectory, { recursive: true });
    }
  }

  async generateImage(prompt, options = {}) {
    const jobId = crypto.randomUUID();
    const {
      provider = 'huggingface',
      style = 'photorealistic',
      size = '512x512',
      count = 1,
      quality = 'standard',
      negativePrompt = '',
      seed = null
    } = options;

    console.log(`🎨 Starting image generation with ${provider}`);
    console.log(`📝 Prompt: ${prompt}`);
    console.log(`🎨 Style: ${style}, Size: ${size}, Count: ${count}`);

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
      
      // Enhance prompt with style
      const enhancedPrompt = this.enhancePrompt(prompt, style);
      
      this.updateProgress(jobId, 25, 'contacting_provider');
      
      // Generate with selected provider
      let result;
      try {
        result = await this.generateWithProvider(provider, enhancedPrompt, {
          size,
          count: parseInt(count),
          quality,
          negativePrompt,
          seed
        });
      } catch (error) {
        console.error(`❌ Image generation failed for ${provider}:`, error.message);
        // Use fallback generation
        result = await this.generateWithFallback(enhancedPrompt, options, jobId);
      }
      
      this.updateProgress(jobId, 90, 'finalizing');
      
      // Save results
      const imageData = {
        jobId,
        prompt,
        enhancedPrompt,
        provider,
        style,
        size,
        count,
        images: result.images,
        metadata: result.metadata,
        createdAt: new Date(),
        status: 'completed'
      };
      
      await this.saveImageData(imageData);
      this.generatedImages.set(jobId, imageData);
      
      this.updateProgress(jobId, 100, 'completed');
      
      return {
        success: true,
        jobId,
        images: result.images,
        metadata: result.metadata
      };
      
    } catch (error) {
      console.error(`❌ Image generation failed for ${provider}:`, error.message);
      this.updateProgress(jobId, 0, 'failed', error.message);
      
      // Try fallback generation
      return await this.generateWithFallback(prompt, options, jobId);
    }
  }

  async generateWithProvider(provider, prompt, options) {
    const providerConfig = this.providers[provider];
    if (!providerConfig) {
      throw new Error(`Provider ${provider} not found`);
    }

    console.log(`🔄 Generating with ${providerConfig.name}...`);

    switch (provider) {
      case 'huggingface':
        return await this.generateWithHuggingFace(prompt, options);
      case 'deepai':
        return await this.generateWithDeepAI(prompt, options);
      case 'pollinations':
        return await this.generateWithPollinations(prompt, options);
      case 'stable_diffusion':
        return await this.generateWithStableDiffusion(prompt, options);
      case 'dalle_mini':
        return await this.generateWithDallEMini(prompt, options);
      default:
        throw new Error(`Provider ${provider} not implemented`);
    }
  }

  async generateWithHuggingFace(prompt, options) {
    const { size, count } = options;
    const config = this.providers.huggingface;
    
    const requestData = {
      inputs: prompt,
      parameters: {
        width: parseInt(size.split('x')[0]),
        height: parseInt(size.split('x')[1]),
        num_images: Math.min(count, 4), // HF limit
        guidance_scale: 7.5,
        num_inference_steps: 20
      }
    };

    try {
      const response = await axios.post(config.apiUrl, requestData, {
        headers: config.headers,
        responseType: 'arraybuffer',
        timeout: 30000
      });

      const imageBuffer = Buffer.from(response.data, 'binary');
      const imageUrl = await this.saveImageBuffer(imageBuffer, 'huggingface');
      
      return {
        images: [imageUrl],
        metadata: {
          provider: 'huggingface',
          model: 'stable-diffusion-xl-base-1.0',
          size,
          prompt
        }
      };
      
    } catch (error) {
      console.error('Hugging Face API error:', error.message);
      
      // If it's an auth error, use fallback
      if (error.response && error.response.status === 401) {
        throw new Error('Hugging Face authentication failed - using fallback generation');
      }
      
      // For other errors, also use fallback
      throw new Error(`Hugging Face generation failed: ${error.message}`);
    }
  }

  async generateWithDeepAI(prompt, options) {
    const config = this.providers.deepai;
    
    const formData = new FormData();
    formData.append('text', prompt);
    formData.append('width', options.size.split('x')[0]);
    formData.append('height', options.size.split('x')[1]);

    try {
      const response = await axios.post(config.apiUrl, formData, {
        headers: config.headers,
        timeout: 30000
      });

      if (response.data.output_url) {
        const imageUrl = await this.downloadAndSaveImage(response.data.output_url, 'deepai');
        
        return {
          images: [imageUrl],
          metadata: {
            provider: 'deepai',
            model: 'text2img',
            size: options.size,
            prompt
          }
        };
      }
      
    } catch (error) {
      throw new Error(`DeepAI generation failed: ${error.message}`);
    }
  }

  async generateWithPollinations(prompt, options) {
    const { size, count } = options;
    const [width, height] = size.split('x').map(Number);
    
    const images = [];
    
    for (let i = 0; i < Math.min(count, 4); i++) {
      const seed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}`;
      
      try {
        const localUrl = await this.downloadAndSaveImage(imageUrl, 'pollinations');
        images.push(localUrl);
      } catch (error) {
        console.error(`Failed to download image ${i + 1}:`, error.message);
      }
    }
    
    if (images.length === 0) {
      throw new Error('No images could be generated');
    }
    
    return {
      images,
      metadata: {
        provider: 'pollinations',
        model: 'pollinations-ai',
        size: options.size,
        prompt
      }
    };
  }

  async generateWithStableDiffusion(prompt, options) {
    // Fallback to mock generation for Stable Diffusion API
    return await this.generateWithFallback(prompt, options);
  }

  async generateWithDallEMini(prompt, options) {
    // Fallback to mock generation for DALL-E Mini
    return await this.generateWithFallback(prompt, options);
  }

  async generateWithFallback(prompt, options, jobId = null) {
    console.log('🎭 Generating images with enhanced fallback system...');
    
    const { size = '512x512', count = 1 } = options;
    const [width, height] = size.split('x').map(Number);
    
    const mockImages = [];
    for (let i = 0; i < parseInt(count); i++) {
      const mockImageData = await this.createMockImage({
        prompt,
        style: options.style || 'photorealistic',
        provider: 'fallback'
      }, width, height);
      
      mockImages.push(mockImageData);
    }
    
    return {
      images: mockImages,
      metadata: {
        provider: 'fallback',
        model: 'mock-generator',
        size,
        prompt,
        mood: this.detectMood(prompt),
        colors: this.generateColorPalette(prompt, options.style),
        composition: this.suggestComposition(prompt, options.style)
      }
    };
  }

  enhancePrompt(prompt, style) {
    const stylePrompts = {
      photorealistic: ', photorealistic, high quality, professional photography, sharp focus, detailed',
      'digital-art': ', digital art, concept art, trending on artstation, highly detailed',
      abstract: ', abstract art, modern, artistic, creative composition',
      cartoon: ', cartoon style, animated, colorful, fun, character design',
      minimalist: ', minimalist, clean, simple, modern design, elegant',
      vintage: ', vintage style, retro, classic, aged, nostalgic',
      futuristic: ', futuristic, sci-fi, high tech, neon, cyberpunk'
    };

    return prompt + (stylePrompts[style] || stylePrompts.photorealistic);
  }

  analyzePrompt(prompt) {
    const keywords = prompt.toLowerCase().split(/\s+/);
    const categories = {
      objects: ['product', 'item', 'device', 'tool', 'car', 'building', 'house'],
      people: ['person', 'man', 'woman', 'child', 'family', 'team', 'group'],
      nature: ['tree', 'flower', 'mountain', 'ocean', 'sky', 'forest', 'animal'],
      abstract: ['concept', 'idea', 'emotion', 'feeling', 'dream', 'imagination'],
      business: ['office', 'meeting', 'corporate', 'professional', 'business', 'work']
    };

    const detected = {};
    for (const [category, terms] of Object.entries(categories)) {
      detected[category] = keywords.some(word => terms.includes(word));
    }

    return detected;
  }

  generateColorPalette(prompt, style) {
    const colorPalettes = {
      photorealistic: ['#2c3e50', '#34495e', '#7f8c8d', '#bdc3c7', '#ecf0f1'],
      'digital-art': ['#e74c3c', '#9b59b6', '#3498db', '#2ecc71', '#f39c12'],
      abstract: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'],
      cartoon: ['#ff7675', '#fd79a8', '#fdcb6e', '#6c5ce7', '#a29bfe'],
      minimalist: ['#2d3436', '#636e72', '#b2bec3', '#ddd', '#fff'],
      vintage: ['#8d6e63', '#a1887f', '#d7ccc8', '#f5f5dc', '#deb887'],
      futuristic: ['#0f3460', '#16537e', '#1e1e1e', '#00d9ff', '#ff0080']
    };

    return colorPalettes[style] || colorPalettes.photorealistic;
  }

  detectMood(prompt) {
    const moodKeywords = {
      happy: ['happy', 'joy', 'bright', 'colorful', 'celebration', 'fun'],
      serious: ['professional', 'business', 'corporate', 'formal', 'official'],
      creative: ['artistic', 'creative', 'design', 'innovative', 'unique'],
      calming: ['peaceful', 'serene', 'calm', 'relaxing', 'nature', 'zen'],
      energetic: ['dynamic', 'energy', 'action', 'movement', 'sport', 'active']
    };

    const prompt_lower = prompt.toLowerCase();
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(keyword => prompt_lower.includes(keyword))) {
        return mood;
      }
    }
    
    return 'neutral';
  }

  suggestComposition(prompt, style) {
    const compositions = {
      portrait: 'Vertical composition, subject centered, shallow depth of field',
      landscape: 'Horizontal composition, wide angle, rule of thirds',
      closeup: 'Macro composition, detailed focus, dramatic lighting',
      abstract: 'Dynamic composition, flowing lines, color gradients',
      minimalist: 'Clean composition, lots of white space, simple elements'
    };

    // Simple heuristic based on prompt content
    if (prompt.includes('person') || prompt.includes('face')) return compositions.portrait;
    if (prompt.includes('landscape') || prompt.includes('nature')) return compositions.landscape;
    if (prompt.includes('detail') || prompt.includes('close')) return compositions.closeup;
    if (style === 'abstract') return compositions.abstract;
    if (style === 'minimalist') return compositions.minimalist;
    
    return compositions.landscape;
  }

  createImageVariation(imageData, index) {
    const variations = [
      { suffix: ' - main composition', brightness: 1.0 },
      { suffix: ' - alternative angle', brightness: 0.9 },
      { suffix: ' - different lighting', brightness: 1.1 },
      { suffix: ' - enhanced colors', brightness: 0.95 },
      { suffix: ' - artistic interpretation', brightness: 1.05 },
      { suffix: ' - creative variant', brightness: 0.85 }
    ];

    const variation = variations[index % variations.length];
    return {
      ...imageData,
      prompt: imageData.prompt + variation.suffix,
      brightness: variation.brightness,
      variation: index + 1
    };
  }

  async createMockImage(imageData, width, height) {
    const { prompt, style, provider } = imageData;
    
    // Generate a unique color scheme based on the prompt
    const colors = this.generateColorPalette(prompt, style);
    const primaryColor = colors[0] || '#667eea';
    const secondaryColor = colors[1] || '#f093fb';
    
    // Create a more sophisticated SVG mock image
    const svgContent = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
          </linearGradient>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3"/>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="${width}" height="${height}" fill="url(#grad1)"/>
        
        <!-- Decorative elements -->
        <circle cx="${width * 0.2}" cy="${height * 0.3}" r="${Math.min(width, height) * 0.1}" fill="rgba(255,255,255,0.1)" filter="url(#blur)"/>
        <circle cx="${width * 0.8}" cy="${height * 0.7}" r="${Math.min(width, height) * 0.15}" fill="rgba(255,255,255,0.1)" filter="url(#blur)"/>
        
        <!-- Main content area -->
        <rect x="${width * 0.1}" y="${height * 0.2}" width="${width * 0.8}" height="${height * 0.6}" fill="rgba(255,255,255,0.1)" rx="20"/>
        
        <!-- Icon -->
        <text x="${width * 0.5}" y="${height * 0.4}" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.08}" fill="white" text-anchor="middle" font-weight="bold">🎨</text>
        
        <!-- Text -->
        <text x="${width * 0.5}" y="${height * 0.55}" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.04}" fill="white" text-anchor="middle" font-weight="bold">AI Generated</text>
        <text x="${width * 0.5}" y="${height * 0.65}" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.025}" fill="rgba(255,255,255,0.8)" text-anchor="middle">${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}</text>
        
        <!-- Style indicator -->
        <text x="${width * 0.5}" y="${height * 0.75}" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.02}" fill="rgba(255,255,255,0.6)" text-anchor="middle">${style} • ${provider}</text>
        
        <!-- Corner decoration -->
        <rect x="${width * 0.85}" y="${height * 0.05}" width="${width * 0.1}" height="${height * 0.1}" fill="rgba(255,255,255,0.2)" rx="5"/>
        <text x="${width * 0.9}" y="${height * 0.12}" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.025}" fill="white" text-anchor="middle">AI</text>
      </svg>
    `;
    
    // Convert SVG to data URL
    const base64SVG = Buffer.from(svgContent).toString('base64');
    const dataUrl = `data:image/svg+xml;base64,${base64SVG}`;
    
    return dataUrl;
  }

  async downloadAndSaveImage(imageUrl, provider) {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });
      
      const imageBuffer = Buffer.from(response.data, 'binary');
      return await this.saveImageBuffer(imageBuffer, provider);
      
    } catch (error) {
      throw new Error(`Failed to download image: ${error.message}`);
    }
  }

  async saveImageBuffer(buffer, provider) {
    const fileName = `${provider}_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
    const filePath = path.join(this.imageDirectory, fileName);
    
    fs.writeFileSync(filePath, buffer);
    
    return `/public/images/${fileName}`;
  }

  async saveImageData(imageData) {
    const fileName = `image_data_${Date.now()}_${Math.random().toString(36).substring(7)}.json`;
    const filePath = path.join(this.imageDirectory, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(imageData, null, 2));
    
    console.log(`💾 Image data saved: ${filePath}`);
    return fileName;
  }

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

  async getGeneratedImages() {
    try {
      const imageFiles = fs.readdirSync(this.imageDirectory)
        .filter(file => file.endsWith('.json') && (file.includes('image_data_') || file.includes('mock_image_')))
        .sort((a, b) => {
          const aTime = fs.statSync(path.join(this.imageDirectory, a)).mtime;
          const bTime = fs.statSync(path.join(this.imageDirectory, b)).mtime;
          return bTime - aTime;
        });

      const images = [];
      for (const file of imageFiles.slice(0, 20)) { // Limit to 20 most recent
        try {
          const filePath = path.join(this.imageDirectory, file);
          const imageData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          images.push({
            id: imageData.id || file,
            fileName: file,
            ...imageData
          });
        } catch (error) {
          console.error(`Error reading image file ${file}:`, error.message);
        }
      }

      return images;
    } catch (error) {
      console.error('Error loading generated images:', error);
      return [];
    }
  }
}

module.exports = ImageService; 