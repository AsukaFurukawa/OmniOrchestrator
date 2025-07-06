const express = require('express');
const router = express.Router();
const ImageService = require('../services/imageService');

const imageService = new ImageService();

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