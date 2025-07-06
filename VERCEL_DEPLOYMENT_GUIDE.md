# 🚀 OmniOrchestrator - Vercel Deployment Guide

Complete guide to deploy OmniOrchestrator AI Marketing Platform to Vercel for production use.

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- [Git](https://git-scm.com/) installed
- [Vercel CLI](https://vercel.com/cli) installed: `npm i -g vercel`
- MongoDB Atlas account (for database)
- API keys for integrated services

## 🔧 Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/omniorchestrator.git
cd omniorchestrator
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory with your actual API keys:

```env
# Core Configuration
NODE_ENV=production
PORT=3000

# Database (MongoDB Atlas recommended for production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/omniorchestrator

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-here

# AI Services
OPENAI_API_KEY=sk-your-openai-api-key
COMETAI_API_KEY=sk-your-cometai-api-key
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key

# Marketing APIs
NEWS_API_KEY=your-news-api-key
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
POLYGON_API_KEY=your-polygon-api-key
YOUTUBE_API_KEY=your-youtube-api-key

# Video Generation (Optional)
RUNWAY_API_KEY=your-runway-api-key
STABILITY_API_KEY=your-stability-api-key
REPLICATE_API_TOKEN=your-replicate-token

# Open-Sora (Local Only - Not Used in Vercel)
OPEN_SORA_PATH=/opt/Open-Sora
OPEN_SORA_PYTHON=python
```

## 🌐 MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create new cluster (M0 free tier is sufficient for testing)
3. Add your IP to whitelist (or 0.0.0.0/0 for all IPs)
4. Create database user with read/write permissions
5. Get connection string and add to `MONGODB_URI`

## 🚀 Vercel Deployment

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables**
   ```bash
   # Add each environment variable
   vercel env add NODE_ENV
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add OPENAI_API_KEY
   # ... add all other environment variables
   ```

4. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. Visit [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Import Project"
3. Connect your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (leave empty for static)
   - **Output Directory**: `./` (leave empty for static)
   - **Install Command**: `npm install`

5. **Add Environment Variables** in project settings:
   - Go to Settings → Environment Variables
   - Add all variables from your `.env` file
   - Make sure to select "Production" environment

6. **Deploy**: Click "Deploy" button

## ⚙️ Production Configuration

### Database Indexing
After deployment, connect to your MongoDB and create these indexes:

```javascript
// Users collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "tenantId": 1 })

// Campaigns collection  
db.campaigns.createIndex({ "userId": 1 })
db.campaigns.createIndex({ "status": 1 })
db.campaigns.createIndex({ "createdAt": -1 })

// Analytics collection
db.analytics.createIndex({ "userId": 1, "date": -1 })
db.analytics.createIndex({ "campaignId": 1 })
```

### Rate Limiting & Security
The app includes built-in security features:
- Helmet.js for security headers
- Rate limiting (100 requests per 15 minutes)
- CORS configured for production
- JWT authentication
- Input validation with Joi

## 🔗 Custom Domain (Optional)

1. In Vercel Dashboard → Project Settings → Domains
2. Add your custom domain (e.g., `marketing.yourcompany.com`)
3. Configure DNS records:
   - CNAME: `marketing` → `your-project.vercel.app`
   - Or A record: `marketing` → Vercel IP

## 📊 Monitoring & Analytics

### Built-in Monitoring
- Real-time user analytics
- Campaign performance tracking
- Error logging with Winston
- Usage tracking and limits

### Vercel Analytics
Enable Vercel Analytics in project settings for:
- Page views and performance
- User engagement metrics
- Error tracking

## 🚨 Troubleshooting

### Common Issues

**1. Environment Variables Not Loading**
```bash
# Check if variables are set
vercel env ls

# Pull environment variables locally
vercel env pull .env.local
```

**2. Database Connection Issues**
- Verify MongoDB URI format
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

**3. API Rate Limits**
- Monitor API usage in respective dashboards
- Implement caching for frequently accessed data
- Consider upgrading API plans for higher limits

**4. Large Bundle Size**
```bash
# Analyze bundle size
npx webpack-bundle-analyzer

# Remove unused dependencies
npm prune
```

### Performance Optimization

**1. Enable Caching**
```javascript
// Add to server/index.js
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}));
```

**2. Database Query Optimization**
```javascript
// Use proper indexes and limit results
db.campaigns.find({ userId }).limit(50).sort({ createdAt: -1 });
```

**3. API Response Compression**
```javascript
// Add compression middleware
const compression = require('compression');
app.use(compression());
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Vercel automatically handles serverless scaling
- Each function instance can handle multiple concurrent requests
- No server management required

### Database Scaling
- MongoDB Atlas provides automatic scaling
- Consider read replicas for heavy read workloads
- Implement database connection pooling

### CDN & Static Assets
- Vercel Edge Network automatically caches static assets
- Images and videos served through Vercel CDN
- Global distribution for optimal performance

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use different secrets for development/production
   - Rotate secrets regularly

2. **Database Security**
   - Use strong passwords
   - Enable MongoDB Atlas encryption
   - Regular security updates

3. **API Security**
   - Implement rate limiting
   - Validate all inputs
   - Use HTTPS only
   - Regular dependency updates

## 📞 Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)

## 🎉 Post-Deployment Checklist

- [ ] Application loads without errors
- [ ] Database connections working
- [ ] All API endpoints responding
- [ ] User authentication working
- [ ] Video generation functional
- [ ] Analytics tracking operational
- [ ] Real-time features (Socket.IO) working
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring and alerting set up
- [ ] Performance optimization applied
- [ ] Security measures verified

---

## 🚀 Quick Start Commands

```bash
# Development
npm install
npm start

# Deploy to Vercel
vercel --prod

# Check logs
vercel logs

# Environment management
vercel env add VARIABLE_NAME
vercel env ls
```

Your OmniOrchestrator is now ready for production! 🎯🚀 