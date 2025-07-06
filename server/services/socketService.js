const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const UsageTrackingService = require('./usageTrackingService');

class SocketService {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map();
    this.tenantRooms = new Map();
    this.usageTracker = new UsageTrackingService();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Handle user authentication
      socket.on('authenticate', async (data) => {
        try {
          const { token, tenantId } = data;
          
          // Verify JWT token
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.userId);
          
          if (!user) {
            socket.emit('auth_error', { message: 'User not found' });
            return;
          }

          // Store user connection info
          this.connectedUsers.set(socket.id, { 
            userId: decoded.userId, 
            email: user.email,
            name: user.name,
            tenantId: tenantId || 'default',
            socketId: socket.id,
            connectedAt: new Date()
          });

          // Join user and tenant rooms
          socket.join(`user_${decoded.userId}`);
          if (tenantId) {
            socket.join(`tenant_${tenantId}`);
            
            // Track tenant room
            if (!this.tenantRooms.has(tenantId)) {
              this.tenantRooms.set(tenantId, new Set());
            }
            this.tenantRooms.get(tenantId).add(socket.id);
          }
          
          console.log(`User ${user.email} authenticated with socket ${socket.id}`);
          
          // Send authentication success with user info
          socket.emit('authenticated', { 
            success: true, 
            user: {
              id: decoded.userId,
              name: user.name,
              email: user.email,
              plan: user.profile.subscription.plan
            }
          });

          // Send initial usage stats
          const usageStats = await this.usageTracker.getUserUsageStats(decoded.userId);
          socket.emit('usage_stats', usageStats);

          // Send current analytics
          await this.sendInitialAnalytics(socket, decoded.userId);

        } catch (error) {
          console.error('Authentication error:', error);
          socket.emit('auth_error', { message: 'Authentication failed' });
        }
      });

      // Handle campaign updates
      socket.on('campaign_update', async (data) => {
        const user = this.connectedUsers.get(socket.id);
        if (!user) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        try {
          // Broadcast campaign update to tenant room
          if (user.tenantId) {
            socket.to(`tenant_${user.tenantId}`).emit('campaign_updated', {
              ...data,
              updatedBy: user.name,
              timestamp: new Date()
            });
          }

          // Track campaign update usage
          await this.usageTracker.trackUsage(user.userId, 'campaign', 1, {
            action: 'update',
            campaignId: data.campaignId
          });

          socket.emit('campaign_update_success', { success: true });
        } catch (error) {
          console.error('Campaign update error:', error);
          socket.emit('error', { message: 'Failed to update campaign' });
        }
      });

      // Handle real-time analytics requests
      socket.on('request_analytics', async (data) => {
        const user = this.connectedUsers.get(socket.id);
        if (!user) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        try {
          await this.sendAnalyticsUpdate(socket, user.userId, data);
        } catch (error) {
          console.error('Analytics request error:', error);
          socket.emit('error', { message: 'Failed to fetch analytics' });
        }
      });

      // Handle AI generation requests
      socket.on('start_ai_generation', async (data) => {
        const user = this.connectedUsers.get(socket.id);
        if (!user) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        try {
          const { type, prompt, options } = data;
          
          // Check usage limits
          const userFromDb = await User.findById(user.userId);
          if (userFromDb.hasReachedLimit(type)) {
            socket.emit('generation_error', { 
              message: `${type} generation limit reached. Please upgrade your plan.`,
              type: 'limit_reached'
            });
            return;
          }

          // Start generation process
          socket.emit('generation_started', { 
            type, 
            estimatedTime: this.getEstimatedGenerationTime(type)
          });

          // Simulate generation progress
          await this.simulateGenerationProgress(socket, type, user.userId);

        } catch (error) {
          console.error('AI generation error:', error);
          socket.emit('generation_error', { message: 'Generation failed' });
        }
      });

      // Handle usage stats requests
      socket.on('request_usage_stats', async () => {
        const user = this.connectedUsers.get(socket.id);
        if (!user) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        try {
          const usageStats = await this.usageTracker.getUserUsageStats(user.userId);
          socket.emit('usage_stats', usageStats);
        } catch (error) {
          console.error('Usage stats error:', error);
          socket.emit('error', { message: 'Failed to fetch usage stats' });
        }
      });

      // Handle tenant analytics requests
      socket.on('request_tenant_analytics', async (data) => {
        const user = this.connectedUsers.get(socket.id);
        if (!user || !user.tenantId) {
          socket.emit('error', { message: 'Not authenticated or no tenant access' });
          return;
        }

        try {
          const tenantStats = await this.usageTracker.getTenantUsageStats(user.tenantId);
          socket.emit('tenant_analytics', tenantStats);
        } catch (error) {
          console.error('Tenant analytics error:', error);
          socket.emit('error', { message: 'Failed to fetch tenant analytics' });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        
        const user = this.connectedUsers.get(socket.id);
        if (user && user.tenantId) {
          // Remove from tenant room
          const tenantRoom = this.tenantRooms.get(user.tenantId);
          if (tenantRoom) {
            tenantRoom.delete(socket.id);
            if (tenantRoom.size === 0) {
              this.tenantRooms.delete(user.tenantId);
            }
          }
        }
        
        this.connectedUsers.delete(socket.id);
      });
    });
  }

  // Send initial analytics when user connects
  async sendInitialAnalytics(socket, userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const campaignStats = user.getCampaignStats();
      const recentActivity = await this.getRecentActivity(userId);

      socket.emit('initial_analytics', {
        campaignStats,
        recentActivity,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Send initial analytics error:', error);
    }
  }

  // Send real-time campaign metrics
  async sendCampaignMetrics(userId, campaignId, metrics) {
    try {
      this.io.to(`user_${userId}`).emit('campaign_metrics', {
        campaignId,
        metrics: {
          ...metrics,
          timestamp: new Date()
        }
      });

      // Also send to tenant room if applicable
      const userConnection = Array.from(this.connectedUsers.values())
        .find(u => u.userId === userId);
      
      if (userConnection && userConnection.tenantId) {
        this.io.to(`tenant_${userConnection.tenantId}`).emit('tenant_campaign_metrics', {
          campaignId,
          metrics,
          userId,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Send campaign metrics error:', error);
    }
  }

  // Send trend alerts
  async sendTrendAlert(userId, alert) {
    try {
      this.io.to(`user_${userId}`).emit('trend_alert', {
        alert,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Send trend alert error:', error);
    }
  }

  // Send AI generation progress
  async sendGenerationProgress(userId, progress) {
    try {
      this.io.to(`user_${userId}`).emit('generation_progress', {
        progress,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Send generation progress error:', error);
    }
  }

  // Simulate generation progress for demo
  async simulateGenerationProgress(socket, type, userId) {
    const progressSteps = [
      { step: 'Initializing', progress: 10 },
      { step: 'Analyzing prompt', progress: 30 },
      { step: 'Generating content', progress: 60 },
      { step: 'Optimizing output', progress: 85 },
      { step: 'Finalizing', progress: 100 }
    ];

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      socket.emit('generation_progress', {
        type,
        step: step.step,
        progress: step.progress,
        timestamp: new Date()
      });
    }

    // Track usage after completion
    await this.usageTracker.trackUsage(userId, type, 1, {
      action: 'generation_complete',
      type
    });

    socket.emit('generation_complete', {
      type,
      timestamp: new Date()
    });
  }

  // Get estimated generation time
  getEstimatedGenerationTime(type) {
    const times = {
      'campaign': 5, // 5 seconds
      'image': 10,   // 10 seconds
      'video': 30,   // 30 seconds
      'analysis': 8  // 8 seconds
    };
    return times[type] || 10;
  }

  // Send analytics update
  async sendAnalyticsUpdate(socket, userId, data) {
    try {
      // Simulate real-time analytics data
      const analyticsData = {
        impressions: Math.floor(Math.random() * 1000) + 500,
        clicks: Math.floor(Math.random() * 100) + 50,
        conversions: Math.floor(Math.random() * 20) + 5,
        ctr: ((Math.random() * 5) + 2).toFixed(2),
        cpc: ((Math.random() * 2) + 0.5).toFixed(2),
        timestamp: new Date()
      };

      socket.emit('analytics_update', analyticsData);
    } catch (error) {
      console.error('Send analytics update error:', error);
    }
  }

  // Get recent activity for user
  async getRecentActivity(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return [];

      return user.campaigns
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 5)
        .map(campaign => ({
          id: campaign._id,
          name: campaign.name,
          type: campaign.type,
          status: campaign.status,
          lastUpdate: campaign.updatedAt
        }));
    } catch (error) {
      console.error('Get recent activity error:', error);
      return [];
    }
  }

  // Broadcast to tenant room
  async broadcastToTenant(tenantId, event, data) {
    try {
      this.io.to(`tenant_${tenantId}`).emit(event, {
        ...data,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Broadcast to tenant error:', error);
    }
  }

  // Send message to specific user
  async sendToUser(userId, event, data) {
    try {
      this.io.to(`user_${userId}`).emit(event, {
        ...data,
        timestamp: new Date()
      });
      console.log(`Sent ${event} to user ${userId}`);
    } catch (error) {
      console.error('Send to user error:', error);
    }
  }

  // Broadcast message to all connected clients
  async broadcast(event, data) {
    try {
      this.io.emit(event, {
        ...data,
        timestamp: new Date()
      });
      console.log(`Broadcasted ${event} to all clients`);
    } catch (error) {
      console.error('Broadcast error:', error);
    }
  }

  // Send usage alert to user
  async sendUsageAlert(userId, alert) {
    try {
      this.io.to(`user_${userId}`).emit('usage_alert', {
        ...alert,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Send usage alert error:', error);
    }
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get tenant connections count
  getTenantConnectionsCount(tenantId) {
    const tenantRoom = this.tenantRooms.get(tenantId);
    return tenantRoom ? tenantRoom.size : 0;
  }

  // Send notification to specific user
  async sendNotification(userId, notification) {
    try {
      this.io.to(`user_${userId}`).emit('notification', {
        ...notification,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Send notification error:', error);
    }
  }

  // Get connection statistics
  getConnectionStats() {
    const tenantStats = {};
    this.tenantRooms.forEach((connections, tenantId) => {
      tenantStats[tenantId] = connections.size;
    });

    return {
      totalConnections: this.connectedUsers.size,
      tenantConnections: tenantStats,
      timestamp: new Date()
    };
  }
}

module.exports = SocketService; 