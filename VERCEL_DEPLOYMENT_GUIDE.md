# 🚀 Vercel Deployment Guide for OmniOrchestrator

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project directory**
   ```bash
   cd OmniOrchestrator
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy: `Y`
   - Which scope: Select your account
   - Link to existing project: `N`
   - Project name: `omniorchestrator` (or your preferred name)
   - Directory: `./` (current directory)
   - Override settings: `N`

### Option 2: Deploy via GitHub Integration

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure settings:
     - Framework Preset: `Node.js`
     - Root Directory: `./`
     - Build Command: `npm install`
     - Output Directory: `./`
   - Click "Deploy"

## Environment Variables

Set these in your Vercel project settings:

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
MONGODB_URI=your-mongodb-connection-string
OPENAI_API_KEY=your-openai-api-key
HUGGINGFACE_API_KEY=your-huggingface-api-key
DEEPAI_API_KEY=your-deepai-api-key
```

## Project Structure

```
OmniOrchestrator/
├── index.html              # Main frontend
├── server/                 # Backend API
│   ├── index.js           # Server entry point
│   ├── routes/            # API routes
│   └── services/          # Business logic
├── public/                # Static assets
├── vercel.json           # Vercel configuration
└── package.json          # Dependencies
```

## Features Working After Deployment

✅ **User Authentication**
- Login/Registration system
- JWT token management
- User session handling

✅ **AI Image Generation**
- Multiple provider support (Hugging Face, DeepAI, etc.)
- Fallback generation system
- Real-time progress tracking

✅ **AI Video Generation**
- Marketing video templates
- Open-Sora integration (with fallback)
- Progress monitoring

✅ **Marketing Dashboard**
- Real-time analytics
- Campaign management
- Performance metrics

✅ **Social Media Integration**
- Multi-platform posting
- Sentiment analysis
- Trend monitoring

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (use 18.x or higher)
   - Ensure all dependencies are in package.json
   - Verify vercel.json configuration

2. **API Routes Not Working**
   - Check environment variables
   - Verify route paths in vercel.json
   - Test locally first

3. **Static Files Not Loading**
   - Ensure public/ directory is properly configured
   - Check file paths in HTML

### Local Testing

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Test health endpoint
curl http://localhost:3000/api/health
```

## Post-Deployment

1. **Test all features:**
   - User registration/login
   - Image generation
   - Video generation
   - Dashboard functionality

2. **Monitor logs:**
   - Check Vercel function logs
   - Monitor API performance
   - Watch for errors

3. **Set up monitoring:**
   - Enable Vercel Analytics
   - Set up error tracking
   - Monitor uptime

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Test locally first
3. Verify environment variables
4. Check API endpoint responses

## Quick Commands

```bash
# Deploy to production
vercel --prod

# View deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove
```

---

**🎉 Your OmniOrchestrator is now ready for production!** 