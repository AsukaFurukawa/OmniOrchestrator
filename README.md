# �� OmniOrchestrator - AI Marketing Revolution Platform

> **"The AI that changes marketing forever"**

A revolutionary multi-tenant AI marketing platform that transforms how businesses create, analyze, and optimize their marketing campaigns using cutting-edge artificial intelligence.

## 🎯 Project Overview

OmniOrchestrator is a comprehensive AI-powered marketing platform that provides:

- **🤖 AI-Powered Content Generation**: OpenAI integration for marketing campaigns, social media posts, and content creation
- **📊 Advanced Analytics**: Real-time sentiment analysis, market trends, and predictive insights
- **🎬 Video Generation**: AI-powered video creation using Open-Sora technology
- **🏢 Multi-Tenant Architecture**: Industry-specific dashboards and isolated data management
- **💬 Conversational AI**: Intelligent marketing consultation and data analysis
- **📈 Usage Tracking**: Comprehensive token management and rate limiting
- **🌐 Real-time Updates**: Socket.IO integration for live dashboard updates
- **🎨 Cyberpunk UI**: Modern, responsive design with neon aesthetics

## 🏗️ Architecture

```
OmniOrchestrator/
├── 📁 server/
│   ├── index.js                 # Main server entry point
│   ├── 📁 middleware/
│   │   ├── auth.js             # Authentication middleware
│   │   ├── tenantContext.js    # Multi-tenant context
│   │   └── errorHandler.js     # Global error handling
│   ├── 📁 models/
│   │   ├── User.js             # User model with usage tracking
│   │   └── Tenant.js           # Tenant model for multi-tenancy
│   ├── 📁 routes/
│   │   ├── ai.js               # AI content generation
│   │   ├── analytics.js        # Analytics and sentiment analysis
│   │   ├── auth.js             # Authentication routes
│   │   ├── campaigns.js        # Campaign management
│   │   ├── conversational.js   # Conversational AI
│   │   ├── video.js            # Video generation
│   │   └── ...
│   └── 📁 services/
│       ├── aiService.js        # OpenAI integration
│       ├── sentimentAnalysis.js # Sentiment analysis
│       ├── videoService.js     # Video generation service
│       ├── conversationalAI.js # Chat AI service
│       └── ...
├── index.html                   # Main frontend application
├── tenant-demo.html            # Multi-tenant demo page
└── package.json                # Dependencies and scripts
```

## 🚀 Features

### ✅ Currently Working
- **Authentication System**: Complete login/register/logout functionality
- **AI Content Generation**: OpenAI-powered marketing content creation
- **Sentiment Analysis**: Real-time sentiment monitoring with OpenAI
- **Market Trends**: Live market data from News API, Alpha Vantage, Polygon
- **Company Profile Management**: Complete company data management
- **Industry Dashboards**: 6 industry-specific dashboards (Technology, Healthcare, Finance, E-commerce, Education, Real Estate)
- **Real-time Updates**: Socket.IO integration for live notifications
- **Multi-tenant Architecture**: Complete tenant isolation and management
- **Cyberpunk UI**: Fully responsive design with neon aesthetics

### 🔧 In Development
- **Video Generation**: Open-Sora integration (infrastructure ready)
- **Social Media Integration**: APIs configured but not fully integrated
- **Email Campaigns**: Service architecture ready
- **Advanced Analytics**: Predictive modeling and AI insights

### 🎯 Planned Features
- **A/B Testing**: Campaign optimization and testing
- **Automated Workflows**: Marketing automation sequences
- **CRM Integration**: Customer relationship management
- **White-label Solutions**: Custom branding for tenants

## 🛠️ Technology Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Axios** - HTTP client
- **Cron** - Scheduled tasks

### Frontend
- **HTML5** + **CSS3** + **JavaScript** - Core frontend
- **Chart.js** - Data visualization
- **Socket.IO Client** - Real-time updates
- **Local Storage** - Client-side data persistence

### AI & External APIs
- **OpenAI API** - Content generation and analysis
- **News API** - Market news and trends
- **Alpha Vantage** - Financial market data
- **Polygon API** - Stock market data
- **YouTube API** - Video platform integration
- **Open-Sora** - AI video generation (local installation)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- OpenAI API key
- Various API keys (see Configuration section)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/OmniOrchestrator.git
   cd OmniOrchestrator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

4. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

5. **Access the application**
   - Main App: `http://localhost:3000`
   - Multi-tenant Demo: `http://localhost:3000/tenant-demo.html`

## ⚙️ Configuration

### Required API Keys

Create a `.env` file based on `env.example`:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/omni-orchestrator

# OpenAI (Required for core functionality)
OPENAI_API_KEY=sk-your-openai-api-key

# Market Data APIs
NEWS_API_KEY=your-news-api-key
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
POLYGON_API_KEY=your-polygon-api-key
YOUTUBE_API_KEY=your-youtube-api-key

# Video Generation (Optional - for premium features)
RUNWAY_ML_API_KEY=your-runway-ml-api-key

# Social Media APIs (Optional)
TWITTER_API_KEY=your-twitter-api-key
FACEBOOK_API_KEY=your-facebook-api-key
INSTAGRAM_API_KEY=your-instagram-api-key
LINKEDIN_API_KEY=your-linkedin-api-key

# Server Configuration
PORT=3000
NODE_ENV=development
JWT_SECRET=your-jwt-secret-key
```

### API Key Status
- ✅ **OpenAI API**: Fully configured and working
- ✅ **News API**: Configured and working
- ✅ **Alpha Vantage**: Configured and working
- ✅ **Polygon API**: Configured and working
- ✅ **YouTube API**: Configured and working
- ✅ **MongoDB Atlas**: Configured and working
- ❌ **Runway ML**: Paid service, using mock API
- ❌ **Social Media APIs**: Not configured (optional)

## 🎨 User Interface

### Main Dashboard
- **Cyberpunk Theme**: Neon purple/blue color scheme
- **Responsive Design**: Works on all devices
- **Real-time Updates**: Live data visualization
- **Industry Switching**: Dynamic dashboard based on selected industry

### Key Pages
1. **🏠 Dashboard**: Overview of all metrics and quick actions
2. **🤖 AI Chat**: Conversational AI for marketing consultation
3. **📊 Analytics**: Sentiment analysis and market trends
4. **🎬 Video Studio**: AI-powered video generation
5. **📱 Campaigns**: Campaign management and generation
6. **🏢 Company**: Company profile and settings management

## 📊 Current Status

### Working Features (90% Complete)
- ✅ User authentication and profile management
- ✅ AI content generation with OpenAI
- ✅ Real-time sentiment analysis
- ✅ Market trends and financial data
- ✅ Company profile management
- ✅ Industry-specific dashboards
- ✅ Socket.IO real-time updates
- ✅ Multi-tenant architecture
- ✅ Usage tracking and rate limiting

### Development Mode Features
- 🔧 Authentication bypass for development
- 🔧 Mock data for testing
- 🔧 Usage limit bypasses
- 🔧 Error handling and logging

### Known Issues
1. **ObjectId Casting Errors**: Development user ID format issues (non-critical)
2. **MongoDB Deprecation Warnings**: Non-critical driver warnings
3. **Runway ML 404 Errors**: Expected (paid service not configured)
4. **Port Conflicts**: Resolved with process management

## 🔧 Integration Requirements

### Immediate Integrations Needed
1. **Open-Sora Video Generation**
   - Local installation required
   - Python environment setup
   - GPU acceleration recommended

2. **Social Media APIs**
   - Twitter API v2 configuration
   - Facebook Graph API setup
   - Instagram Basic Display API
   - LinkedIn Marketing API

3. **Email Service**
   - SendGrid or Mailgun integration
   - Template management system
   - Campaign tracking

### Optional Integrations
1. **Runway ML API** (Premium video generation)
2. **Additional Market Data Sources**
3. **CRM Integration** (Salesforce, HubSpot)
4. **Analytics Platform** (Google Analytics, Mixpanel)

## 🐛 Issues for Teammate

### High Priority Issues
1. **[URGENT] ObjectId Casting Error Fix**
   - **Issue**: Development user ID "dev-user-123" causes MongoDB ObjectId casting errors
   - **Location**: `server/services/conversationalAI.js`, `server/middleware/tenantContext.js`
   - **Fix**: Replace string IDs with proper ObjectId format or improve error handling

2. **[HIGH] Open-Sora Local Installation**
   - **Issue**: Video generation currently uses mock API
   - **Requirements**: Python environment, GPU drivers, Open-Sora model installation
   - **Guide**: Follow Open-Sora documentation for local setup

3. **[HIGH] Production Environment Setup**
   - **Issue**: Currently optimized for development mode
   - **Requirements**: Production-ready error handling, logging, security headers
   - **Tasks**: Remove development bypasses, add production configurations

### Medium Priority Issues
4. **[MEDIUM] Social Media Integration**
   - **Issue**: Social media APIs not configured
   - **Requirements**: API keys for Twitter, Facebook, Instagram, LinkedIn
   - **Tasks**: Complete OAuth flows, implement posting functionality

5. **[MEDIUM] Email Campaign Service**
   - **Issue**: Email service not implemented
   - **Requirements**: SendGrid/Mailgun setup, template system
   - **Tasks**: Campaign creation, tracking, analytics

6. **[MEDIUM] MongoDB Index Optimization**
   - **Issue**: Duplicate index warnings
   - **Location**: User and Tenant models
   - **Fix**: Remove duplicate index declarations

### Low Priority Issues
7. **[LOW] Deprecation Warnings**
   - **Issue**: MongoDB driver deprecation warnings
   - **Fix**: Update to latest MongoDB driver methods
   - **Impact**: Non-critical, future compatibility

8. **[LOW] UI/UX Improvements**
   - **Issue**: Minor styling inconsistencies
   - **Tasks**: Polish responsive design, add animations, improve accessibility

## 📝 Development Notes

### Development Mode Features
- Authentication bypass with `🔧 Development mode` logging
- Mock tenant data when database is unavailable
- Usage limit bypasses for testing
- Comprehensive error logging

### Database Schema
- **Users**: Complete user management with usage tracking
- **Tenants**: Multi-tenant architecture with industry-specific data
- **Campaigns**: Campaign storage and management
- **Analytics**: Sentiment and usage analytics

### API Rate Limiting
- OpenAI API: Implemented with usage tracking
- External APIs: Rate limiting based on service limits
- Development: Bypassed for testing

## 🚀 Deployment

### Production Checklist
- [ ] Remove development mode bypasses
- [ ] Configure production environment variables
- [ ] Set up proper logging and monitoring
- [ ] Configure SSL certificates
- [ ] Set up CI/CD pipeline
- [ ] Configure database backups
- [ ] Set up error tracking (Sentry)
- [ ] Configure CDN for static assets

### Recommended Hosting
- **Backend**: Railway, Render, or DigitalOcean
- **Database**: MongoDB Atlas (already configured)
- **Frontend**: Vercel, Netlify, or CloudFlare Pages
- **File Storage**: AWS S3 or CloudFlare R2

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 👥 Contributors

- **Lead Developer**: [Your Name]
- **Team Member**: [Teammate Name]

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation in `/docs` (coming soon)

---

**🎯 Mission**: To revolutionize marketing through artificial intelligence and create the most comprehensive AI marketing platform available.

**🚀 Vision**: Empowering businesses of all sizes to leverage AI for marketing success while maintaining the highest standards of security and user experience. 