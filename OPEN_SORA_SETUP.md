# 🎬 Open-Sora Setup Guide for OmniOrchestrator

## Overview
OmniOrchestrator now supports **actual AI video generation** using Open-Sora, an open-source text-to-video model. This guide will help you set up Open-Sora to generate real AI videos from your prompts instead of using demo videos.

## Current Status
✅ **Open-Sora Integration Complete** - The code is ready  
🔧 **Needs Local Installation** - Open-Sora must be installed locally  
🚀 **Automatic Fallback** - Uses demo videos if Open-Sora isn't available  

## Quick Start (Development Mode)
The system will **automatically try Open-Sora first** and fall back to demo videos if it's not available. This means:
- Your enhanced AI prompts are working ✅
- Video generation progress tracking works ✅  
- The system attempts real AI generation first ✅
- Falls back gracefully to demo videos if Open-Sora isn't installed ✅

## Setting Up Open-Sora for Real AI Video Generation

### Prerequisites
- **CUDA-compatible GPU** (NVIDIA GTX 1080 or better)
- **12GB+ VRAM** recommended
- **Python 3.8+** with PyTorch
- **20GB+ free disk space**

### Installation Steps

#### 1. Clone Open-Sora Repository
```bash
cd /opt  # or your preferred directory
git clone https://github.com/hpcaitech/Open-Sora.git
cd Open-Sora
```

#### 2. Install Dependencies
```bash
# Create virtual environment
python -m venv open-sora-env
source open-sora-env/bin/activate  # Linux/Mac
# or
open-sora-env\Scripts\activate     # Windows

# Install requirements
pip install -r requirements.txt
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

#### 3. Download Model Weights
```bash
# Download pretrained models (this will take time and space)
python scripts/download_models.py
```

#### 4. Configure Environment Variables
Create a `.env` file in your OmniOrchestrator root:
```env
# Open-Sora Configuration
OPEN_SORA_PATH=/opt/Open-Sora
OPEN_SORA_PYTHON=/opt/Open-Sora/open-sora-env/bin/python
NODE_ENV=development
```

#### 5. Test Open-Sora Installation
```bash
cd /opt/Open-Sora
python scripts/diffusion/inference.py configs/diffusion/inference/256px.py \
  --prompt "A beautiful sunset over mountains" \
  --save-dir ./test_output \
  --num_frames 64
```

### System Behavior

#### With Open-Sora Installed ✅
1. User submits video prompt (e.g., "Hello Kitty promotional video")
2. AI enhances the prompt with cinematic details
3. **Open-Sora generates actual AI video** based on enhanced prompt
4. Real video file is created and served
5. User downloads actual AI-generated content

#### Without Open-Sora (Current) 🔧
1. User submits video prompt (e.g., "Hello Kitty promotional video")
2. AI enhances the prompt with cinematic details ✅
3. System attempts Open-Sora, fails gracefully
4. Falls back to demo video with enhanced prompt in metadata
5. User sees demo video but with their custom prompt details

## Advanced Configuration

### GPU Memory Optimization
```env
# For GPUs with less VRAM
OPEN_SORA_RESOLUTION=256x256
OPEN_SORA_FRAMES=32
```

### Custom Model Paths
```env
# If you have custom trained models
OPEN_SORA_MODEL_PATH=/path/to/your/custom/model
```

### Production Deployment
```env
NODE_ENV=production
OPEN_SORA_PATH=/opt/Open-Sora
OPEN_SORA_PYTHON=/opt/Open-Sora/venv/bin/python
```

## Verification

### Check if Open-Sora is Working
1. Go to Video tab in OmniOrchestrator
2. Fill in video generation form  
3. Click "Generate AI Video"
4. Watch the console logs for:
   - `🎬 Attempting Open-Sora generation at: /opt/Open-Sora`
   - `🐍 Using Python: python`
   - `🎬 Open-Sora stdout:` messages

### Console Log Messages

#### Success ✅
```
🎬 Attempting Open-Sora generation at: /opt/Open-Sora
🐍 Using Python: python
🎬 Open-Sora stdout: Loading model...
🎬 Open-Sora stdout: Generating frames...
🎬 Open-Sora process finished with code: 0
```

#### Fallback to Demo 🔧
```
🎬 Attempting Open-Sora generation at: /opt/Open-Sora
❌ Open-Sora spawn error: spawn python ENOENT
🔧 Development mode: Using mock video generation
```

## Troubleshooting

### Common Issues

#### "spawn python ENOENT"
- **Solution**: Install Python or set correct `OPEN_SORA_PYTHON` path

#### "Open-Sora process failed with code 1"
- **Solution**: Check CUDA installation and GPU drivers
- **Solution**: Verify model weights are downloaded

#### "Video file not found after generation"
- **Solution**: Check disk space and write permissions
- **Solution**: Verify output directory exists

#### Out of Memory Errors
- **Solution**: Reduce resolution to 256x256
- **Solution**: Reduce frame count to 32
- **Solution**: Use smaller model variant

### Debug Mode
Set environment variable to see detailed logs:
```env
DEBUG=true
OPEN_SORA_VERBOSE=true
```

## Performance Expectations

### Generation Times
- **256x256, 32 frames**: ~2-5 minutes (RTX 3080)
- **512x512, 64 frames**: ~5-15 minutes (RTX 4090)
- **1024x576, 64 frames**: ~15-30 minutes (RTX 4090)

### Hardware Requirements
- **Minimum**: GTX 1080, 8GB VRAM, 16GB RAM
- **Recommended**: RTX 3080+, 12GB+ VRAM, 32GB+ RAM
- **Optimal**: RTX 4090, 24GB VRAM, 64GB RAM

## What Works Right Now (Without Open-Sora)

Even without Open-Sora installed, you get:
- ✅ **AI-Enhanced Prompts** - Your prompts are intelligently enhanced
- ✅ **Professional Templates** - Marketing video templates  
- ✅ **Real-time Progress** - Live generation tracking
- ✅ **Smart Suggestions** - AI video ideas and concepts
- ✅ **Trending Styles** - Current video marketing trends
- ✅ **Download System** - Working video download
- ✅ **Metadata Tracking** - Full generation details

## Future Enhancements

Coming soon:
- **Cloud Open-Sora** - Hosted version for easier setup
- **Multiple Models** - Support for different AI video models
- **Batch Generation** - Generate multiple videos at once
- **Custom Training** - Train on your brand assets

## Support

If you encounter issues:
1. Check the console logs during video generation
2. Verify your GPU meets minimum requirements  
3. Ensure Python and PyTorch are properly installed
4. Test Open-Sora independently before integrating

The system is designed to work gracefully with or without Open-Sora, so you can start using it immediately and add real AI generation when ready! 