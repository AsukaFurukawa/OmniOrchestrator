const express = require('express');
const router = express.Router();
const ImageService = require('../services/imageService');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const imageService = new ImageService();

// Shivani's working image generation implementation
const ensureImagesDir = async () => {
  const imagesDir = path.join(__dirname, '..', '..', 'public', 'images');
  try {
    await fs.access(imagesDir);
  } catch {
    await fs.mkdir(imagesDir, { recursive: true });
  }
};

const cleanupOldImages = async () => {
  const imagesDir = path.join(__dirname, '..', '..', 'public', 'images');
  try {
    const files = await fs.readdir(imagesDir);
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000); // Keep images for 7 days instead of 1 day
    
    for (const file of files) {
      const filePath = path.join(imagesDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime.getTime() < sevenDaysAgo) {
        await fs.unlink(filePath);
        console.log(`🗑️ Cleaned up old image: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old images:', error);
  }
};

// Initialize cleanup
ensureImagesDir();
cleanupOldImages();
setInterval(cleanupOldImages, 24 * 60 * 60 * 1000); // Run cleanup once per day instead of every hour

// Shivani's working image generation endpoint
router.post("/generate/shivani", [
  body('prompt').notEmpty().withMessage('Prompt is required').trim().escape()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: "Validation failed", details: errors.array() });
  }

  const { prompt, width, height } = req.body;

  try {
    const payload = {
        inputs: prompt,
        parameters: {
            ...(width && { width: parseInt(width) }),
            ...(height && { height: parseInt(height) }),
        }
    };

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
          "Accept": "image/png",
        },
        responseType: "arraybuffer",
        timeout: 120000,
        maxContentLength: 50 * 1024 * 1024,
      }
    );

    const filename = `generated-${uuidv4()}.png`;
    const imagesDir = path.join(__dirname, '..', '..', 'public', 'images');
    const filepath = path.join(imagesDir, filename);
    
    await fs.writeFile(filepath, response.data);
    
    const base64Image = Buffer.from(response.data).toString('base64');
    
    res.json({
      success: true,
      image: `data:image/png;base64,${base64Image}`,
      imageUrl: `/images/${filename}`,
      message: "Image generated and saved successfully"
    });

  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: "Image generation failed" });
  }
});

// Generate image from text
router.post('/generate', async (req, res) => {
  try {
    const {
      prompt,
      provider = 'huggingface',
      style = 'photorealistic',
      size = '512x512',
      count = 1,
      quality = 'standard',
      negativePrompt = '',
      seed = null
    } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    console.log(`🎨 Image generation request received: ${prompt}`);
    console.log(`📊 Provider: ${provider}, Style: ${style}, Size: ${size}`);

    const result = await imageService.generateImage(prompt, {
      provider,
      style,
      size,
      count: parseInt(count),
      quality,
      negativePrompt,
      seed
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get image generation status
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const status = imageService.getJobStatus(jobId);

    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get generated images
router.get('/generated', async (req, res) => {
  try {
    const images = await imageService.getGeneratedImages();
    
    res.json({
      success: true,
      data: {
        images,
        total: images.length
      }
    });

  } catch (error) {
    console.error('Error loading generated images:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get image providers
router.get('/providers', (req, res) => {
  try {
    const providers = Object.entries(imageService.providers).map(([key, config]) => ({
      id: key,
      name: config.name,
      free: config.free,
      noApiKey: config.noApiKey || false
    }));

    res.json({
      success: true,
      data: {
        providers,
        recommended: 'huggingface'
      }
    });

  } catch (error) {
    console.error('Error getting providers:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get image styles
router.get('/styles', (req, res) => {
  try {
    const styles = [
      { id: 'photorealistic', name: 'Photorealistic', description: 'High-quality realistic images' },
      { id: 'digital-art', name: 'Digital Art', description: 'Artistic digital illustrations' },
      { id: 'abstract', name: 'Abstract', description: 'Abstract and conceptual art' },
      { id: 'cartoon', name: 'Cartoon', description: 'Fun cartoon-style images' },
      { id: 'minimalist', name: 'Minimalist', description: 'Clean and simple designs' },
      { id: 'vintage', name: 'Vintage', description: 'Retro and classic style' },
      { id: 'futuristic', name: 'Futuristic', description: 'Sci-fi and high-tech aesthetics' }
    ];

    res.json({
      success: true,
      data: { styles }
    });

  } catch (error) {
    console.error('Error getting styles:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Enhanced image generation with AI analysis
router.post('/generate-enhanced', async (req, res) => {
  try {
    const {
      prompt,
      businessContext = {},
      targetAudience = '',
      purpose = 'general',
      brandColors = [],
      brandStyle = 'professional'
    } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    // Enhance prompt with business context
    let enhancedPrompt = prompt;
    if (businessContext.industry) {
      enhancedPrompt += `, ${businessContext.industry} industry`;
    }
    if (targetAudience) {
      enhancedPrompt += `, targeting ${targetAudience}`;
    }
    if (brandStyle) {
      enhancedPrompt += `, ${brandStyle} style`;
    }

    console.log(`🎨 Enhanced image generation: ${enhancedPrompt}`);

    const result = await imageService.generateImage(enhancedPrompt, {
      provider: 'huggingface',
      style: brandStyle === 'professional' ? 'photorealistic' : brandStyle,
      size: purpose === 'social' ? '1200x630' : '1024x1024',
      count: 2,
      quality: 'high'
    });

    // Add business analysis to result
    result.businessAnalysis = {
      targetAudience,
      purpose,
      brandAlignment: 'high',
      usageRecommendations: [
        'Social media campaigns',
        'Website headers',
        'Marketing materials',
        'Advertising content'
      ]
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Enhanced image generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 