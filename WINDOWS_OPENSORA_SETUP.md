# 🎬 Open-Sora Windows Setup Guide

## Complete Installation Guide for OmniOrchestrator Video Generation

### 📋 Prerequisites

1. **Windows 10/11** (64-bit)
2. **NVIDIA GPU** (GTX 1060 or better, RTX series recommended)
3. **16GB+ RAM** (32GB recommended for high-quality videos)
4. **50GB+ free disk space**
5. **Fast internet connection** (for model downloads)

### 🔧 Step 1: Install Python Environment

```powershell
# Install Python 3.10 (recommended version)
# Download from: https://www.python.org/downloads/windows/
# Make sure to check "Add Python to PATH" during installation

# Verify installation
python --version
# Should show: Python 3.10.x

# Create virtual environment
python -m venv opensora-env
opensora-env\Scripts\activate
```

### 🛠️ Step 2: Install CUDA and Dependencies

```powershell
# Install CUDA 12.1 (compatible with PyTorch)
# Download from: https://developer.nvidia.com/cuda-downloads

# Install Git (if not already installed)
# Download from: https://git-scm.com/download/win

# Install Visual Studio Build Tools (for compilation)
# Download from: https://visualstudio.microsoft.com/downloads/
# Install "C++ build tools" workload
```

### 📦 Step 3: Clone and Install Open-Sora

```powershell
# Clone Open-Sora repository
git clone https://github.com/hpcaitech/Open-Sora.git
cd Open-Sora

# Install dependencies
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install -v .
pip install xformers==0.0.27.post2 --index-url https://download.pytorch.org/whl/cu121
pip install flash-attn --no-build-isolation
```

### 🎯 Step 4: Download Models

```powershell
# Option 1: Download from HuggingFace
pip install "huggingface_hub[cli]"
huggingface-cli login  # Enter your HF token
huggingface-cli download hpcai-tech/Open-Sora-v2 --local-dir ./ckpts

# Option 2: Download from ModelScope
pip install modelscope
modelscope download hpcai-tech/Open-Sora-v2 --local_dir ./ckpts
```

### 🔗 Step 5: Configure OmniOrchestrator Integration

1. **Set Environment Variables** (in your `.env` file):
```env
# Add these to your .env file
OPEN_SORA_PATH=C:\path\to\Open-Sora
OPEN_SORA_PYTHON=C:\path\to\opensora-env\Scripts\python.exe
OPEN_SORA_ENABLED=true
```

2. **Alternative: Set Windows Environment Variables**:
```powershell
# Set system environment variables
setx OPEN_SORA_PATH "C:\Open-Sora"
setx OPEN_SORA_PYTHON "C:\opensora-env\Scripts\python.exe"
```

### 🧪 Step 6: Test Installation

```powershell
# Test basic Open-Sora installation
cd Open-Sora
python scripts/inference.py configs/opensora-v1-2/inference/sample.py --prompt "A beautiful sunset over mountains"

# Test with OmniOrchestrator
cd ..\OmniOrchestrator
npm start
# Navigate to Video Studio and generate a test video
```

### 📁 Directory Structure

Your setup should look like this:
```
C:\
├── Open-Sora\
│   ├── opensora\
│   ├── scripts\
│   ├── configs\
│   └── ckpts\
└── OmniOrchestrator\
    ├── server\
    └── public\
```

### 🚀 Quick Start Commands

#### Generate 256px Video (Faster):
```powershell
cd Open-Sora
python scripts/inference.py configs/opensora-v1-2/inference/sample.py --prompt "A professional product showcase video" --save-dir ..\OmniOrchestrator\generated_videos --num-frames 120 --aspect-ratio 16:9
```

#### Generate 768px Video (Higher Quality):
```powershell
cd Open-Sora
python -m torch.distributed.launch --nproc_per_node=1 scripts/inference.py configs/opensora-v1-2/inference/sample.py --prompt "A cinematic brand story video" --save-dir ..\OmniOrchestrator\generated_videos --num-frames 120 --aspect-ratio 16:9
```

### 🎨 Video Templates for Marketing

#### Product Showcase (15s):
```
A professional product showcase featuring [PRODUCT] with clean studio lighting, rotating 360-degree views, and close-up detail shots highlighting key features, professional commercial style
```

#### Brand Story (30s):
```
A cinematic brand story for [COMPANY] showing the journey from concept to creation, featuring behind-the-scenes moments, customer testimonials, and emotional storytelling with warm lighting
```

#### Social Media (8s):
```
A trendy social media video for [PRODUCT] with quick cuts, vibrant colors, dynamic transitions, and a modern aesthetic perfect for Instagram and TikTok
```

### 🛠️ Troubleshooting

#### Common Issues:

1. **CUDA Out of Memory**:
   - Reduce video resolution
   - Lower batch size
   - Close other GPU applications

2. **Python Package Conflicts**:
   ```powershell
   pip install --force-reinstall torch torchvision torchaudio
   ```

3. **Model Download Issues**:
   - Check internet connection
   - Use ModelScope as alternative
   - Download models manually

4. **Visual Studio Build Tools Missing**:
   - Install C++ build tools
   - Restart after installation

### 🎯 Performance Optimization

#### For RTX 4090 (24GB VRAM):
- 768px videos: 4-5 seconds
- 256px videos: 2-3 seconds
- Use `--motion-score 7` for dynamic content

#### For RTX 3080 (10GB VRAM):
- 512px videos: 3-4 seconds
- 256px videos: 2-3 seconds
- Use `--offload True` to save memory

#### For GTX 1060 (6GB VRAM):
- 256px videos only: 6-8 seconds
- Use `--offload True` and lower resolution

### 🔄 Integration with OmniOrchestrator

Once installed, OmniOrchestrator will:

1. **Automatically detect** Open-Sora installation
2. **Generate videos** using real AI instead of mock data
3. **Save videos** to `generated_videos/` folder
4. **Display progress** in real-time
5. **Show videos** in Video Studio

### 📊 Expected Results

- **Text-to-Video**: Generate videos from marketing prompts
- **Image-to-Video**: Animate product images
- **Style Control**: Professional, cinematic, trendy styles
- **Resolution**: Up to 768px (depending on hardware)
- **Duration**: 2-60 seconds per video

### 🆘 Support

If you encounter issues:

1. Check the [Open-Sora GitHub Issues](https://github.com/hpcaitech/Open-Sora/issues)
2. Verify GPU drivers are updated
3. Ensure all dependencies are installed
4. Try the fallback system if needed

### 🎉 Success Indicators

✅ **Installation Complete When**:
- Python command runs without errors
- CUDA is detected by PyTorch
- Models are downloaded successfully
- Test video generation works
- OmniOrchestrator shows "Open-Sora available"

---

**Happy Video Generation! 🎬✨** 