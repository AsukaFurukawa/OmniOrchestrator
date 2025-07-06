# 🚀 OmniOrchestrator - AI-Powered Marketing Automation Platform

> **Hackathon Project**: Next-Generation Marketing Automation with AI

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/omniorchestrator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

## 🎯 Project Overview

**OmniOrchestrator** is a cutting-edge AI-powered marketing automation platform that revolutionizes how businesses create, manage, and optimize their marketing campaigns. Built for the modern digital landscape, it combines advanced AI technologies with intuitive user experience to deliver unprecedented marketing efficiency.

### 🌟 Key Features

- **🤖 AI-Powered Content Generation** - Create compelling marketing content with advanced AI
- **🎬 Automated Video Creation** - Generate professional marketing videos from text prompts
- **🎨 AI Image Generation** - Create stunning visuals with multiple AI providers
- **📊 Real-Time Analytics** - Comprehensive marketing performance tracking
- **📈 Sentiment Analysis** - Monitor brand sentiment across social media
- **📱 Multi-Platform Integration** - Seamless social media management
- **🎯 Smart Campaign Optimization** - AI-driven campaign recommendations
- **⚡ Real-Time Dashboard** - Live monitoring of all marketing activities

## 🛠️ Tech Stack

### Frontend
- **HTML5/CSS3** - Modern, responsive design with advanced animations
- **JavaScript (ES6+)** - Vanilla JS with modern features and async/await
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Chart.js** - Interactive data visualization and analytics
- **Socket.IO Client** - Real-time communication and live updates
- **Font Awesome** - Professional icon library

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - MongoDB object modeling for Node.js
- **JWT** - JSON Web Tokens for secure authentication
- **bcryptjs** - Password hashing and security
- **Socket.IO** - Real-time bidirectional communication

### AI & External APIs
- **OpenAI GPT-4** - Advanced text generation and content creation
- **Hugging Face** - AI image generation and model inference
- **DeepAI** - Alternative AI image generation
- **News API** - Real-time news aggregation
- **Alpha Vantage** - Stock market data and financial analytics
- **Reddit API** - Social media sentiment analysis
- **Twitter API** - Social media integration

### DevOps & Deployment
- **Vercel** - Serverless deployment platform
- **GitHub** - Version control and collaboration
- **MongoDB Atlas** - Cloud database hosting
- **Environment Variables** - Secure configuration management

### Development Tools
- **Nodemon** - Development server with auto-restart
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **Git** - Version control

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- API keys for external services

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/omniorchestrator.git
   cd omniorchestrator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your API keys:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   OPENAI_API_KEY=your-openai-api-key
   HUGGINGFACE_API_KEY=your-huggingface-api-key
   DEEPAI_API_KEY=your-deepai-api-key
   NEWS_API_KEY=your-news-api-key
   ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🌐 Live Demo

**🚀 Production URL**: [https://omniorchestrator-dhc6papuu-prachi-sinhas-projects-77217335.vercel.app/](https://omniorchestrator-dhc6papuu-prachi-sinhas-projects-77217335.vercel.app/)

**📱 Try it now**: Experience the full AI-powered marketing automation platform live!

---

## 📸 UI Screenshots & Demo

### 🎬 Demo Video
📹 **Full Demo Video**: [Screen Recording 2025-07-06 225418.mp4](ui_images/Screen%20Recording%202025-07-06%20225418.mp4)

*Watch the complete walkthrough of OmniOrchestrator features*

### 🖼️ Application Screenshots

> **📱 View all screenshots in the [ui_images/](ui_images/) folder**

#### Key Features Showcase:

**🎯 Dashboard & Analytics**
- Real-time analytics dashboard with live metrics
- Comprehensive marketing analytics and insights
- Interactive charts and performance tracking

**🤖 AI Content Generation**
- AI-powered video generation interface
- Multi-provider AI image generation
- Smart content creation with AI assistance

**📊 Campaign Management**
- Smart campaign creation with AI assistance
- Content management and optimization
- Multi-platform social media integration

**👤 User Interface**
- Modern authentication interface
- User registration with validation
- Settings and preferences management

**📱 Mobile Responsive**
- Fully responsive mobile interface
- Optimized tablet experience
- Cross-device compatibility

### 🎥 Live Demo Features

**Try these features live:**
1. **AI Video Generation** - Create marketing videos from text
2. **Image Generation** - Generate visuals with multiple AI providers
3. **Sentiment Analysis** - Analyze brand sentiment across platforms
4. **Campaign Creation** - Build AI-powered marketing campaigns
5. **Analytics Dashboard** - Real-time performance tracking
6. **Social Media Integration** - Multi-platform content management

---

## 📱 Features in Detail

### 1. AI-Powered Content Generation
- **Smart Campaign Creation** - AI generates compelling marketing campaigns
- **Content Optimization** - Real-time content improvement suggestions
- **Multi-format Support** - Email, social media, blog posts, and more
- **Brand Voice Consistency** - Maintains brand personality across all content

### 2. Video Generation
- **Text-to-Video** - Create videos from text descriptions
- **Marketing Templates** - Pre-built templates for different use cases
- **Custom Branding** - Add logos, colors, and brand elements
- **Multiple Formats** - Support for various video resolutions and durations

### 3. Image Generation
- **Multi-Provider Support** - Hugging Face, DeepAI, and fallback systems
- **Style Customization** - Photorealistic, artistic, and custom styles
- **Batch Generation** - Create multiple variations simultaneously
- **High-Resolution Output** - Support for various image sizes

### 4. Analytics Dashboard
- **Real-Time Metrics** - Live campaign performance tracking
- **Sentiment Analysis** - Brand sentiment monitoring across platforms
- **ROI Tracking** - Campaign effectiveness measurement
- **Custom Reports** - Generate detailed marketing reports

### 5. Social Media Integration
- **Multi-Platform Posting** - Schedule and post across multiple platforms
- **Content Calendar** - Visual content planning and scheduling
- **Engagement Tracking** - Monitor likes, shares, and comments
- **Hashtag Optimization** - AI-suggested hashtags for better reach

### 6. User Management
- **Secure Authentication** - JWT-based user authentication
- **Role-Based Access** - Different permission levels for team members
- **Tenant Support** - Multi-tenant architecture for agencies
- **User Analytics** - Individual user performance tracking

## 🏗️ Architecture

### Frontend Architecture
```
index.html (Main Application)
├── Dashboard (Real-time analytics)
├── Video Generation (AI video creation)
├── Image Generation (AI image creation)
├── Campaign Management (Content creation)
├── Analytics (Performance tracking)
└── Settings (User preferences)
```

### Backend Architecture
```
server/
├── index.js (Main server entry)
├── routes/ (API endpoints)
│   ├── auth.js (Authentication)
│   ├── video.js (Video generation)
│   ├── image.js (Image generation)
│   ├── analytics.js (Analytics)
│   └── social.js (Social media)
├── services/ (Business logic)
│   ├── videoService.js (Video AI)
│   ├── imageService.js (Image AI)
│   ├── analyticsService.js (Analytics)
│   └── socialMediaService.js (Social)
└── models/ (Database models)
    ├── User.js (User data)
    └── Campaign.js (Campaign data)
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Video Generation
- `POST /api/video/generate` - Generate video from text
- `POST /api/video/create-marketing-video` - Create marketing video
- `GET /api/video/status/:jobId` - Check generation status

### Image Generation
- `POST /api/image/generate` - Generate images from prompt
- `GET /api/image/generated` - Get generated images
- `GET /api/image/status/:jobId` - Check generation status

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard data
- `POST /api/analytics/sentiment` - Analyze brand sentiment
- `GET /api/analytics/campaigns` - Get campaign analytics

### Social Media
- `POST /api/social/post` - Create social media post
- `GET /api/social/mentions` - Get brand mentions
- `POST /api/social/schedule` - Schedule social media posts

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Manual Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

## 🔐 Security Features

- **JWT Authentication** - Secure user sessions
- **Password Hashing** - bcryptjs for password security
- **CORS Protection** - Cross-origin request security
- **Rate Limiting** - API abuse prevention
- **Input Validation** - XSS and injection protection
- **Environment Variables** - Secure configuration management

## 📊 Performance Features

- **Real-Time Updates** - Socket.IO for live data
- **Caching** - Redis for performance optimization
- **CDN Integration** - Vercel Edge Network
- **Lazy Loading** - Optimized resource loading
- **Compression** - Gzip compression for faster loading

## 🧪 Testing

### Manual Testing
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test video generation
curl -X POST http://localhost:3000/api/video/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A professional marketing video"}'

# Test image generation
curl -X POST http://localhost:3000/api/image/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Professional marketing image"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** - For GPT-4 integration
- **Hugging Face** - For AI model hosting
- **Vercel** - For deployment platform
- **MongoDB** - For database hosting
- **Tailwind CSS** - For UI framework

## 📞 Support

- **Email**: support@omniorchestrator.com
- **Documentation**: [docs.omniorchestrator.com](https://docs.omniorchestrator.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/omniorchestrator/issues)

## 🏆 Hackathon Submission

**Project Name**: OmniOrchestrator  
**Category**: AI/ML, Marketing, Automation  
**Team**: [Your Team Name]  
**Duration**: [Development Time]  

### Innovation Highlights
- **AI-First Approach** - Leverages multiple AI providers for robust content generation
- **Real-Time Analytics** - Live monitoring and optimization capabilities
- **Multi-Platform Integration** - Seamless social media management
- **Fallback Systems** - Ensures reliability even when external APIs fail
- **Modern Architecture** - Built with latest technologies for scalability

### Technical Achievements
- **Serverless Deployment** - Optimized for Vercel's serverless architecture
- **Real-Time Communication** - Socket.IO for live updates
- **Multi-Provider AI** - Integration with multiple AI services
- **Responsive Design** - Works perfectly on all devices
- **Security Best Practices** - JWT authentication and data protection

---

**Built with ❤️ for the hackathon community** 