const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');
const socialRoutes = require('./routes/social');
const trendRoutes = require('./routes/trends');
const webhookRoutes = require('./routes/webhooks');
const videoRoutes = require('./routes/video');
const usageRoutes = require('./routes/usage');
const freeAIRoutes = require('./routes/freeAI');

// Import middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Import services
const CronService = require('./services/cronService');
const SocketService = require('./services/socketService');
const UsageTrackingService = require('./services/usageTrackingService');
const ConversationalAI = require('./services/conversationalAI');
const AdvancedAnalytics = require('./services/advancedAnalytics');
const SentimentAnalysis = require('./services/sentimentAnalysis');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-hashes'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://cdn.socket.io"],
      scriptSrcElem: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://cdn.socket.io"],
      scriptSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.openai.com", "wss:", "ws:", "http://localhost:3000"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/omniorchestra', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Serve static files from the root directory
app.use(express.static('.'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', require('./routes/tenants')); // No auth required for tenant config
app.use('/api/campaigns', authMiddleware, campaignRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/social', authMiddleware, socialRoutes);
app.use('/api/trends', authMiddleware, trendRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/video', authMiddleware, videoRoutes);
app.use('/api/conversational', authMiddleware, require('./routes/conversational'));
app.use('/api/free-ai', freeAIRoutes); // No auth required for free services!

// Serve the main UI for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Serve static files from public directory (for videos)
app.use('/videos', express.static(path.join(__dirname, '..', 'public', 'videos')));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Initialize services
const socketService = new SocketService(io);
const usageTrackingService = new UsageTrackingService();
const conversationalAI = new ConversationalAI();
const advancedAnalytics = new AdvancedAnalytics();
const sentimentAnalysis = new SentimentAnalysis();

// Make services available globally
global.socketService = socketService;
global.usageTracker = usageTrackingService;
global.conversationalAI = conversationalAI;
global.advancedAnalytics = advancedAnalytics;
global.sentimentAnalysis = sentimentAnalysis;

// Error handling middleware
app.use(errorHandler);

// 404 handler - serve frontend for non-API routes
app.use('*', (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    res.status(404).json({ error: 'Route not found' });
  } else {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
});

// Start cron jobs
const cronService = new CronService();
cronService.start();

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 OmniOrchestra server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Dashboard will be available at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});

module.exports = app; 