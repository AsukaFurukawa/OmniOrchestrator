# 🚀 OmniOrchestrator - Multi-Tenant AI Marketing Platform

> **Revolutionary AI-powered marketing automation platform with multi-tenant architecture and futuristic cyberpunk UI**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/cloud/atlas)
[![AI](https://img.shields.io/badge/AI-Powered-blue.svg)](https://openai.com/)

## 📋 **Table of Contents**

- [🎯 Project Overview](#-project-overview)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Environment Setup](#️-environment-setup)
- [🔧 Installation](#-installation)
- [📱 Usage](#-usage)
- [🎨 Multi-Tenant Features](#-multi-tenant-features)
- [🤖 AI Integration](#-ai-integration)
- [📊 API Documentation](#-api-documentation)
- [🎬 Video Generation](#-video-generation)
- [📈 Analytics & Insights](#-analytics--insights)
- [🔒 Security](#-security)
- [🚀 Deployment](#-deployment)
- [🐛 Troubleshooting](#-troubleshooting)
- [🛣️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)

## 🎯 **Project Overview**

OmniOrchestrator is a cutting-edge **multi-tenant AI marketing platform** that revolutionizes how businesses create, manage, and optimize their marketing campaigns. Built with a futuristic cyberpunk-inspired UI and powered by advanced AI models including GPT-4, Open-Sora, and more.

### **🎪 Live Demo**
- **Frontend:** http://localhost:3000
- **Multi-Tenant Demo:** [tenant-demo.html](./tenant-demo.html)

### **🌟 What Makes It Special?**
- **Multi-Tenant Architecture** - Each company gets their own branded experience
- **AI-Powered Everything** - From content generation to video creation
- **Futuristic UI** - Cyberpunk-inspired design with neon effects and animations
- **Real-Time Analytics** - Live performance tracking and insights
- **Video Generation** - Integrated AI video creation (Open-Sora, Runway ML, Stability AI)

## ✨ **Key Features**

### 🏢 **Multi-Tenant System**
- **Dynamic Branding** - Each tenant gets custom colors, logos, and styling
- **Data Isolation** - Complete separation of tenant data
- **Custom Domains** - Support for white-label deployments
- **Scalable Architecture** - Handle thousands of tenants

### 🤖 **AI-Powered Marketing**
- **Campaign Generation** - GPT-4 powered content creation
- **Video Creation** - Text-to-video and image-to-video generation
- **Smart Insights** - AI-driven performance recommendations
- **Predictive Analytics** - Forecast campaign performance
- **Sentiment Analysis** - Real-time audience sentiment tracking

### 🎨 **Futuristic Interface**
- **Cyberpunk Design** - Neon effects, holographic cards, animations
- **Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- **Interactive Charts** - Real-time data visualization
- **Smooth Animations** - 60fps transitions and effects

### 📊 **Analytics & Reporting**
- **Real-Time Metrics** - Live campaign performance tracking
- **Advanced Filtering** - Segment data by date, campaign, channel
- **AI Insights** - Automated recommendations and optimizations
- **Export Capabilities** - PDF reports and data exports

## 🏗️ **Architecture**

### **Frontend Stack**
- **HTML5** - Semantic markup with accessibility features
- **TailwindCSS** - Utility-first CSS framework
- **Vanilla JavaScript** - No framework dependencies for maximum performance
- **Chart.js** - Interactive data visualizations
- **Font Awesome** - Icon library

### **Backend Stack**
- **Node.js 18+** - Modern JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB Atlas** - Cloud database with multi-tenant support
- **Redis** - Caching and session management
- **Socket.IO** - Real-time communication

### **AI & External Services**
- **OpenAI GPT-4** - Text generation and analysis
- **Open-Sora** - Video generation (coming soon)
- **Runway ML** - Professional video generation
- **Stability AI** - Fast video generation
- **News API** - Market trend analysis
- **Alpha Vantage** - Financial data
- **YouTube API** - Video analytics

### **Security & Infrastructure**
- **Helmet.js** - Security headers and CSP
- **Rate Limiting** - API protection
- **CORS** - Cross-origin resource sharing
- **Environment Variables** - Secure configuration management

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18 or higher
- MongoDB Atlas account (free tier available)
- OpenAI API key
- Git

### **1. Clone Repository**
```bash
git clone https://github.com/AsukaFurukawa/OmniOrchestrator.git
cd OmniOrchestrator
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Setup**
```bash
# Copy environment template
cp env.example .env

# Edit .env with your API keys (see Environment Setup section)
```

### **4. Start Development Server**
```bash
npm start
```

### **5. Open Browser**
Navigate to http://localhost:3000

## ⚙️ **Environment Setup**

Create a `.env` file in the root directory:

```env
# 🗄️ Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/omniorchestrator

# 🤖 AI API Keys
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# 📰 External Data APIs
NEWS_API_KEY=your-news-api-key-from-newsapi-org
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key
POLYGON_API_KEY=your-polygon-io-api-key
YOUTUBE_API_KEY=your-youtube-data-api-key

# 🎬 Video Generation APIs (Optional)
RUNWAY_API_KEY=your-runway-ml-api-key
STABILITY_API_KEY=your-stability-ai-api-key

# 📱 Social Media APIs (Optional)
TWITTER_BEARER_TOKEN=your-twitter-api-bearer-token
LINKEDIN_ACCESS_TOKEN=your-linkedin-api-token
FACEBOOK_ACCESS_TOKEN=your-facebook-api-token
INSTAGRAM_ACCESS_TOKEN=your-instagram-api-token

# 🔧 Server Configuration
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
REDIS_URL=redis://localhost:6379

# 🌐 Client Configuration
CLIENT_URL=http://localhost:3000
```

### **🔑 Getting API Keys**

#### **Required APIs:**
1. **OpenAI API** - [Get Key](https://platform.openai.com/api-keys)
2. **MongoDB Atlas** - [Get Started](https://www.mongodb.com/cloud/atlas)

#### **Optional APIs:**
1. **News API** - [Get Key](https://newsapi.org/)
2. **Alpha Vantage** - [Get Key](https://www.alphavantage.co/support/#api-key)
3. **YouTube API** - [Get Key](https://developers.google.com/youtube/v3/getting-started)

## 🔧 **Installation**

### **Development Setup**
```bash
# Install dependencies
npm install

# Start development server with auto-restart
npm run dev

# Run tests
npm test

# Check code quality
npm run lint
```

### **Production Setup**
```bash
# Install production dependencies only
npm ci --only=production

# Build for production
npm run build

# Start production server
npm start
```

## 📱 **Usage**

### **🏠 Main Dashboard**
- **Real-time metrics** - Open rates, CTR, conversions, engagement
- **AI recommendations** - Smart suggestions for campaign optimization
- **Quick actions** - Create campaigns, generate videos, view analytics

### **✨ Campaign Creator**
1. Select **channel type** (Email, SMS, Social, Video)
2. Choose **target persona** (Tech Enthusiasts, Marketing Managers, etc.)
3. Set **campaign goal** (Feature promotion, webinars, conversions)
4. Pick **tone & style** (Professional, casual, urgent, creative)
5. Click **"Generate"** for AI-powered content

### **🎬 Video Creator**
1. Choose generation mode (Text-to-Video, Image-to-Video, Marketing Video)
2. Enter creative prompt
3. Set duration, resolution, style, and motion level
4. Click **"Generate Video"** for AI creation
5. Download or share generated content

### **📊 Analytics Dashboard**
- **Filter by date range, campaign, or channel**
- **View real-time charts** for all key metrics
- **Get AI insights** and optimization recommendations
- **Export reports** for stakeholders

## 🎨 **Multi-Tenant Features**

### **Tenant Configuration**
Each tenant can customize:
- **Brand colors and themes**
- **Company logo and name**
- **Custom CSS styling**
- **Domain and subdomain**

### **Demo Tenants**
- **TechCorp** - Blue/silver theme for technology companies
- **CreativeStudio** - Purple/pink theme for creative agencies  
- **GrowthCo** - Green/gold theme for growth-focused businesses

### **Adding New Tenants**
```javascript
// Example tenant configuration
const newTenant = {
  tenantId: 'your-company',
  companyName: 'Your Company Name',
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  logo: 'https://your-domain.com/logo.png',
  domain: 'marketing.your-company.com'
};
```

## 🤖 **AI Integration**

### **OpenAI GPT-4 Integration**
- **Campaign Generation** - Smart content creation based on parameters
- **Content Optimization** - Improve existing campaigns
- **Sentiment Analysis** - Analyze audience responses
- **Performance Prediction** - Forecast campaign success

### **Video Generation Models**
1. **Open-Sora** (Coming Soon) - Open-source, high-quality video generation
2. **Runway Gen-2** - Professional-grade video synthesis
3. **Stability AI** - Fast, cost-effective video creation

### **AI Features**
- **Smart Recommendations** - AI-powered campaign suggestions
- **Optimal Timing** - Best send times based on audience analysis
- **Content Personalization** - Tailored messages for different segments
- **Performance Insights** - AI-driven analytics and predictions

## 📊 **API Documentation**

### **Authentication**
```javascript
// All API requests require authentication header
headers: {
  'Authorization': 'Bearer your-jwt-token',
  'Content-Type': 'application/json'
}
```

### **Core Endpoints**

#### **Campaign Management**
```javascript
// Generate new campaign
POST /api/ai/generate-campaign
{
  "channelType": "email",
  "targetPersona": "tech",
  "campaignGoal": "feature",
  "style": "professional"
}

// Send campaign
POST /api/campaigns/send
{
  "content": "campaign content",
  "type": "immediate"
}
```

#### **Video Generation**
```javascript
// Generate text-to-video
POST /api/video/generate-text-to-video
{
  "prompt": "A futuristic city at sunset",
  "options": {
    "duration": 15,
    "resolution": "1920x1080",
    "style": "cinematic"
  }
}
```

#### **Analytics**
```javascript
// Get detailed metrics
GET /api/analytics/detailed-metrics
?startDate=2024-01-01&endDate=2024-01-31&campaign=all

// Get AI insights
GET /api/ai/comprehensive-insights
```

#### **Multi-Tenant**
```javascript
// Get tenant configuration
GET /api/tenants/current?tenantId=demo-company

// Get custom CSS
GET /api/tenants/branding/css?tenantId=demo-company
```

## 🎬 **Video Generation**

### **Supported Models**
1. **Open-Sora** - Revolutionary open-source model (coming soon)
2. **Runway Gen-2** - Industry-leading professional quality
3. **Stability AI** - Fast generation with good quality

### **Generation Options**
- **Duration:** 4s, 8s, 15s, 30s, 60s
- **Resolution:** 1024x576, 1280x720, 1920x1080
- **Style:** Cinematic, Professional, Creative, Minimalist
- **Motion Level:** Low, Medium, High

### **Example Usage**
```javascript
const videoRequest = {
  prompt: "A sleek product demonstration in a modern office",
  duration: 15,
  resolution: "1920x1080",
  style: "professional",
  motionStrength: 5
};
```

## 📈 **Analytics & Insights**

### **Key Metrics**
- **Impressions** - Total campaign views
- **Open Rate** - Email/message open percentage
- **Click-Through Rate** - Link click percentage
- **Conversions** - Goal completion count
- **Engagement Score** - Overall audience activity rating

### **AI-Powered Insights**
- **Optimal Send Times** - Best timing for maximum engagement
- **Audience Segmentation** - Automatic user categorization
- **Performance Predictions** - Forecast campaign success
- **Content Recommendations** - Suggest improvements

### **Real-Time Charts**
- **Mini Charts** - Quick metric visualization
- **Interactive Dashboards** - Detailed performance analysis
- **Comparative Views** - Period-over-period comparisons
- **Export Options** - PDF and CSV downloads

## 🔒 **Security**

### **Content Security Policy (CSP)**
- Strict CSP headers prevent XSS attacks
- Whitelisted domains for external resources
- Inline script and style protection

### **Rate Limiting**
- API endpoint protection (100 requests per 15 minutes)
- IP-based limiting
- Graceful degradation

### **Data Protection**
- Environment variable encryption
- Secure JWT token handling
- Multi-tenant data isolation
- MongoDB security best practices

### **Security Headers**
```javascript
// Helmet.js configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      // ... more directives
    }
  }
}));
```

## 🚀 **Deployment**

### **🌐 Production Deployment**

#### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### **Heroku**
```bash
# Install Heroku CLI
# Create Heroku app
heroku create omniorchestrator

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set OPENAI_API_KEY=your-openai-key

# Deploy
git push heroku main
```

#### **Docker**
```dockerfile
# Dockerfile included for containerized deployment
docker build -t omniorchestrator .
docker run -p 3000:3000 omniorchestrator
```

#### **DigitalOcean/AWS/GCP**
- Use included PM2 configuration for process management
- Nginx reverse proxy configuration available
- SSL certificate setup instructions included

### **🗄️ Database Setup**

#### **MongoDB Atlas (Recommended)**
1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist your IP address (0.0.0.0/0 for development)
3. Create database user
4. Get connection string
5. Add to `.env` file

#### **Local MongoDB**
```bash
# Install MongoDB locally
brew install mongodb/brew/mongodb-community # macOS
sudo apt install mongodb # Ubuntu

# Start MongoDB
brew services start mongodb/brew/mongodb-community # macOS
sudo systemctl start mongod # Ubuntu
```

### **🚦 Environment Variables**
```bash
# Production environment variables
NODE_ENV=production
PORT=443
MONGODB_URI=mongodb+srv://prod-user:password@cluster.mongodb.net/omniorchestrator
REDIS_URL=redis://prod-redis:6379
CLIENT_URL=https://your-domain.com
```

## 🐛 **Troubleshooting**

### **Common Issues**

#### **❌ MongoDB Connection Error**
```
MongooseServerSelectionError: Could not connect to any servers
```
**Solution:**
- Check MongoDB Atlas IP whitelist
- Verify connection string in `.env`
- Ensure network connectivity

#### **❌ API 401 Unauthorized Errors**
```
Failed to load resource: 401 (Unauthorized)
```
**Solution:**
- These are expected in demo mode (no authentication)
- For production, implement proper JWT authentication
- Check API key configuration

#### **❌ Font Loading Issues**
```
Refused to load font due to Content Security Policy
```
**Solution:**
- Already fixed in latest CSP configuration
- Hard refresh browser (Ctrl+Shift+R)

#### **❌ JavaScript Not Working**
```
onclick handlers not executing
```
**Solution:**
- CSP has been updated to allow inline scripts
- Restart server: `npm start`
- Clear browser cache

#### **❌ Port 3000 Already in Use**
```
EADDRINUSE: address already in use :::3000
```
**Solution:**
```bash
# Kill process using port 3000
taskkill /f /im node.exe  # Windows
sudo lsof -ti:3000 | xargs kill -9  # macOS/Linux

# Or use different port
PORT=3001 npm start
```

### **🔧 Debug Mode**
```bash
# Enable debug logging
DEBUG=* npm start

# Check server health
curl http://localhost:3000/api/health
```

### **📝 Log Files**
- Server logs: `logs/server.log`
- Error logs: `logs/error.log`
- Access logs: `logs/access.log`

## 🛣️ **Roadmap**

### **🚀 Phase 1: Core Features (Completed)**
- ✅ Multi-tenant architecture
- ✅ AI campaign generation
- ✅ Video creation studio
- ✅ Real-time analytics
- ✅ Futuristic UI design

### **⚡ Phase 2: Enhanced AI (In Progress)**
- 🔄 Open-Sora video integration
- 🔄 Advanced personalization
- 🔄 Predictive analytics
- 🔄 Voice generation
- 🔄 Image generation

### **🌟 Phase 3: Enterprise Features (Planned)**
- 📋 Advanced user management
- 📋 Custom integrations
- 📋 White-label solutions
- 📋 Advanced reporting
- 📋 Mobile app

### **🔮 Phase 4: Next-Gen AI (Future)**
- 📋 AGI integration
- 📋 Autonomous campaigns
- 📋 AR/VR experiences
- 📋 Blockchain integration
- 📋 Quantum optimization

## 🤝 **Contributing**

### **Development Guidelines**
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### **Code Style**
- Use ESLint configuration
- Follow JavaScript Standard Style
- Write descriptive commit messages
- Add tests for new features

### **Pull Request Process**
1. Update README.md if needed
2. Add tests for new functionality
3. Ensure all tests pass
4. Request review from maintainers

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **OpenAI** for GPT-4 integration
- **TailwindCSS** for the amazing utility framework
- **Chart.js** for beautiful data visualizations
- **MongoDB** for robust database solutions
- **Vercel** for seamless deployment

## 📞 **Support**

- **Documentation:** [Project Wiki](https://github.com/AsukaFurukawa/OmniOrchestrator/wiki)
- **Issues:** [GitHub Issues](https://github.com/AsukaFurukawa/OmniOrchestrator/issues)
- **Discussions:** [GitHub Discussions](https://github.com/AsukaFurukawa/OmniOrchestrator/discussions)

---

**Built with ❤️ by the OmniOrchestrator team**

*Transforming marketing with AI, one campaign at a time.* 