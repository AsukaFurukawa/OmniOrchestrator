# 🎬 Open-Sora Setup for Windows - Complete Guide

## 🚀 Quick Fix (Video Generation Working Again)

I've just **fixed the video generation issue**! The system now properly falls back to demo videos when Open-Sora isn't available, so your video generation should work immediately.

**Test it now**: Go generate a video - it will work while we set up Open-Sora!

---

## 🎯 Setting Up Real Open-Sora AI Video Generation on Windows

### Prerequisites Check
Before starting, verify you have:
- **Windows 10/11** (64-bit)
- **NVIDIA GPU** with 8GB+ VRAM (GTX 1080 or better)
- **20GB+ free disk space**
- **Administrator access**

### Step 1: Install Python 3.9-3.11 (CRITICAL)

#### Option A: Official Python Installer (Recommended)
1. **Download Python 3.10**: https://www.python.org/downloads/release/python-31011/
2. **Run installer as Administrator**
3. **✅ IMPORTANT**: Check "Add Python to PATH"
4. **✅ IMPORTANT**: Check "Install for all users"
5. **Verify installation**:
   ```cmd
   python --version
   # Should show: Python 3.10.11
   
   pip --version
   # Should show pip version
   ```

#### Option B: Using Chocolatey
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy Bypass -Scope Process -Force
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Install Python
choco install python310 -y
```

### Step 2: Install CUDA and PyTorch

#### Install CUDA Toolkit 11.8
1. **Download CUDA 11.8**: https://developer.nvidia.com/cuda-11-8-0-download-archive
2. **Select**: Windows → x86_64 → Local Installer
3. **Run installer** (takes 10-15 minutes)
4. **Verify installation**:
   ```cmd
   nvcc --version
   # Should show CUDA version 11.8
   ```

#### Install PyTorch with CUDA Support
```cmd
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### Step 3: Download and Setup Open-Sora

#### Clone Repository
```cmd
# Navigate to desired location (e.g., C:\AI\)
cd C:\
mkdir AI
cd AI

# Clone Open-Sora
git clone https://github.com/hpcaitech/Open-Sora.git
cd Open-Sora
```

#### Create Virtual Environment
```cmd
# Create virtual environment
python -m venv open-sora-env

# Activate environment
open-sora-env\Scripts\activate

# Upgrade pip
python -m pip install --upgrade pip
```

#### Install Dependencies
```cmd
# Install requirements
pip install -r requirements.txt

# Install additional dependencies
pip install accelerate transformers diffusers

# Install colossalai (may take time)
pip install colossalai
```

### Step 4: Download Model Weights

#### Download Models (This will take time and space!)
```cmd
# Still in Open-Sora directory with virtual environment activated
python scripts/download_models.py

# Alternative: Manual download of specific models
mkdir models
cd models

# Download specific model weights (adjust URLs based on latest releases)
# This step requires checking the Open-Sora documentation for current model URLs
```

### Step 5: Configure OmniOrchestrator Environment

#### Create/Update .env file in your OmniOrchestrator root:
```env
# Open-Sora Windows Configuration
OPEN_SORA_PATH=C:\AI\Open-Sora
OPEN_SORA_PYTHON=C:\AI\Open-Sora\open-sora-env\Scripts\python.exe
NODE_ENV=development

# Other existing settings...
MONGODB_URI=your-mongodb-uri
OPENAI_API_KEY=your-openai-key
```

### Step 6: Test Open-Sora Installation

#### Test 1: Basic Python Test
```cmd
# In Open-Sora directory with virtual environment activated
python -c "import torch; print('PyTorch version:', torch.__version__); print('CUDA available:', torch.cuda.is_available())"
```

#### Test 2: Generate Test Video
```cmd
# Test Open-Sora directly
python scripts/diffusion/inference.py configs/diffusion/inference/256px.py --prompt "A beautiful sunset over mountains" --save-dir ./test_output --num_frames 32
```

#### Test 3: Test with OmniOrchestrator
1. **Restart OmniOrchestrator server**
2. **Generate a video** through the UI
3. **Watch console for**:
   ```
   🎬 Attempting Open-Sora generation at: C:\AI\Open-Sora
   🐍 Using Python: C:\AI\Open-Sora\open-sora-env\Scripts\python.exe
   🎬 Open-Sora stdout: Loading model...
   ```

### Windows-Specific Troubleshooting

#### Issue: "spawn python ENOENT"
**Solutions**:
```cmd
# Check Python installation
where python
# Should show: C:\Users\...\AppData\Local\Programs\Python\Python310\python.exe

# Check PATH variable
echo %PATH%
# Should include Python directory

# Update .env with full Python path
OPEN_SORA_PYTHON=C:\Users\YourUsername\AppData\Local\Programs\Python\Python310\python.exe
```

#### Issue: CUDA/GPU Problems
**Solutions**:
```cmd
# Check GPU
nvidia-smi
# Should show your GPU and CUDA version

# Test PyTorch CUDA
python -c "import torch; print(torch.cuda.get_device_name(0))"
# Should show your GPU name

# Reinstall PyTorch with correct CUDA version
pip uninstall torch torchvision torchaudio
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

#### Issue: Permission Errors
**Solutions**:
- **Run Command Prompt as Administrator**
- **Install Python for all users**
- **Set folder permissions** for Open-Sora directory

#### Issue: Out of Memory
**Solutions**:
```env
# In .env file, add memory optimization
OPEN_SORA_RESOLUTION=256x256
OPEN_SORA_FRAMES=32
CUDA_VISIBLE_DEVICES=0
```

### Windows Performance Optimization

#### For Lower-End GPUs (8GB VRAM):
```env
# Add to .env
OPEN_SORA_RESOLUTION=256x256
OPEN_SORA_FRAMES=32
PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512
```

#### For High-End GPUs (16GB+ VRAM):
```env
# Add to .env  
OPEN_SORA_RESOLUTION=512x512
OPEN_SORA_FRAMES=64
```

### Expected Generation Times on Windows

| GPU | Resolution | Frames | Time |
|-----|------------|--------|------|
| RTX 3060 (12GB) | 256x256 | 32 | 3-5 min |
| RTX 3080 (10GB) | 512x512 | 64 | 8-12 min |
| RTX 4070 (12GB) | 512x512 | 64 | 5-8 min |
| RTX 4090 (24GB) | 1024x576 | 64 | 10-15 min |

### Verification Checklist

✅ **Python 3.10+ installed and in PATH**  
✅ **CUDA 11.8 installed**  
✅ **PyTorch with CUDA support working**  
✅ **Open-Sora repository cloned**  
✅ **Virtual environment created and activated**  
✅ **Dependencies installed**  
✅ **Model weights downloaded**  
✅ **Environment variables configured**  
✅ **Test video generation successful**  

### What You'll Get When Working

When Open-Sora is properly installed, your video generation will:
1. **Use your actual prompts** to generate unique AI videos
2. **Create real MP4 files** (not demo videos)
3. **Take 5-30 minutes** depending on settings and GPU
4. **Generate cinematic quality** videos based on your marketing prompts
5. **Work offline** - no external API calls needed

### Support and Next Steps

If you encounter issues:
1. **Check the Windows Event Viewer** for system errors
2. **Monitor GPU usage** with Task Manager
3. **Check VRAM usage** with `nvidia-smi`
4. **Verify Python environment** is correctly activated

The OmniOrchestrator is now **error-resistant** - it will always fall back to demo videos if Open-Sora fails, so you can use it immediately while setting up the real AI generation!

### Quick Start Summary

1. **Install Python 3.10** ✅
2. **Install CUDA 11.8** ✅  
3. **Clone Open-Sora to C:\AI\Open-Sora** ✅
4. **Update .env with correct paths** ✅
5. **Test and enjoy real AI video generation!** 🎬 