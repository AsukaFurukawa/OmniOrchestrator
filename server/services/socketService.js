class SocketService {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Handle user authentication
      socket.on('authenticate', (data) => {
        const { userId, token } = data;
        
        // Verify token and associate socket with user
        this.connectedUsers.set(socket.id, { userId, socketId: socket.id });
        socket.join(`user_${userId}`);
        
        console.log(`User ${userId} authenticated with socket ${socket.id}`);
        
        socket.emit('authenticated', { success: true });
      });

      // Handle campaign updates
      socket.on('campaign_update', (data) => {
        const user = this.connectedUsers.get(socket.id);
        if (user) {
          this.broadcastToCampaignTeam(user.userId, 'campaign_updated', data);
        }
      });

      // Handle real-time analytics requests
      socket.on('request_analytics', (data) => {
        const user = this.connectedUsers.get(socket.id);
        if (user) {
          this.sendAnalyticsUpdate(socket, data);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        this.connectedUsers.delete(socket.id);
      });
    });
  }

  // Send real-time campaign metrics
  sendCampaignMetrics(userId, campaignId, metrics) {
    this.io.to(`user_${userId}`).emit('campaign_metrics', {
      campaignId,
      metrics,
      timestamp: new Date()
    });
  }

  // Send trend alerts
  sendTrendAlert(userId, alert) {
    this.io.to(`user_${userId}`).emit('trend_alert', {
      alert,
      timestamp: new Date()
    });
  }

  // Send AI generation progress
  sendGenerationProgress(userId, progress) {
    this.io.to(`user_${userId}`).emit('generation_progress', {
      progress,
      timestamp: new Date()
    });
  }

  // Broadcast to campaign team
  broadcastToCampaignTeam(userId, event, data) {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  // Send analytics update
  sendAnalyticsUpdate(socket, data) {
    // Simulate real-time analytics data
    const analyticsData = {
      impressions: Math.floor(Math.random() * 1000),
      clicks: Math.floor(Math.random() * 100),
      conversions: Math.floor(Math.random() * 20),
      timestamp: new Date()
    };

    socket.emit('analytics_update', analyticsData);
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Send notification to specific user
  sendNotification(userId, notification) {
    this.io.to(`user_${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date()
    });
  }
}

module.exports = SocketService; 