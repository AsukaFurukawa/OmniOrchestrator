const User = require('../models/User');
const Tenant = require('../models/Tenant');
const cron = require('node-cron');

class UsageTrackingService {
  constructor() {
    this.startCronJobs();
  }

  /**
   * Track API usage for a user
   */
  async trackUsage(userId, usageType, amount = 1, metadata = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user has reached limits
      if (user.hasReachedLimit(usageType)) {
        throw new Error(`${usageType} limit reached. Please upgrade your plan.`);
      }

      // Increment usage
      await user.incrementUsage(usageType);

      // Log usage event
      await this.logUsageEvent(userId, usageType, amount, metadata);

      return {
        success: true,
        remaining: user.getRemainingUsage(usageType),
        limit: user.apiUsage.limits[`${usageType}Generations`] || user.apiUsage.limits[`${usageType}Requests`]
      };
    } catch (error) {
      console.error('Usage tracking error:', error);
      throw error;
    }
  }

  /**
   * Track tenant usage (for multi-tenant system)
   */
  async trackTenantUsage(tenantId, usageType, amount = 1, metadata = {}) {
    try {
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Check tenant limits
      const remaining = tenant.getRemainingUsage(usageType);
      if (remaining <= 0) {
        throw new Error(`Tenant ${usageType} limit reached. Please upgrade your plan.`);
      }

      // Increment tenant usage
      await tenant.incrementUsage(usageType, amount);

      // Log tenant usage event
      await this.logTenantUsageEvent(tenantId, usageType, amount, metadata);

      return {
        success: true,
        remaining: tenant.getRemainingUsage(usageType),
        limit: tenant.aiConfig.restrictions[`max${usageType.charAt(0).toUpperCase() + usageType.slice(1)}PerMonth`]
      };
    } catch (error) {
      console.error('Tenant usage tracking error:', error);
      throw error;
    }
  }

  /**
   * Get user usage statistics
   */
  async getUserUsageStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const currentMonth = user.apiUsage.currentMonth;
      const limits = user.apiUsage.limits;

      return {
        currentMonth: {
          campaigns: {
            used: currentMonth.campaignGenerations,
            limit: limits.campaignGenerations,
            remaining: Math.max(0, limits.campaignGenerations - currentMonth.campaignGenerations),
            percentage: Math.round((currentMonth.campaignGenerations / limits.campaignGenerations) * 100)
          },
          images: {
            used: currentMonth.imageGenerations,
            limit: limits.imageGenerations,
            remaining: Math.max(0, limits.imageGenerations - currentMonth.imageGenerations),
            percentage: Math.round((currentMonth.imageGenerations / limits.imageGenerations) * 100)
          },
          analysis: {
            used: currentMonth.analysisRequests,
            limit: limits.analysisRequests,
            remaining: Math.max(0, limits.analysisRequests - currentMonth.analysisRequests),
            percentage: Math.round((currentMonth.analysisRequests / limits.analysisRequests) * 100)
          },
          total: {
            used: currentMonth.totalRequests,
            limit: limits.campaignGenerations + limits.imageGenerations + limits.analysisRequests
          }
        },
        plan: user.profile.subscription.plan,
        billingCycle: user.profile.subscription.startDate,
        nextReset: this.getNextResetDate()
      };
    } catch (error) {
      console.error('Get usage stats error:', error);
      throw error;
    }
  }

  /**
   * Get tenant usage statistics
   */
  async getTenantUsageStats(tenantId) {
    try {
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const currentMonth = tenant.usage.currentMonth;
      const restrictions = tenant.aiConfig.restrictions;

      return {
        currentMonth: {
          campaigns: {
            used: currentMonth.campaignsGenerated,
            limit: restrictions.maxCampaignsPerMonth,
            remaining: Math.max(0, restrictions.maxCampaignsPerMonth - currentMonth.campaignsGenerated),
            percentage: Math.round((currentMonth.campaignsGenerated / restrictions.maxCampaignsPerMonth) * 100)
          },
          videos: {
            used: currentMonth.videosGenerated,
            limit: restrictions.maxVideosPerMonth,
            remaining: Math.max(0, restrictions.maxVideosPerMonth - currentMonth.videosGenerated),
            percentage: Math.round((currentMonth.videosGenerated / restrictions.maxVideosPerMonth) * 100)
          },
          tokens: {
            used: currentMonth.aiTokensUsed,
            limit: restrictions.maxAITokensPerMonth,
            remaining: Math.max(0, restrictions.maxAITokensPerMonth - currentMonth.aiTokensUsed),
            percentage: Math.round((currentMonth.aiTokensUsed / restrictions.maxAITokensPerMonth) * 100)
          },
          emails: {
            used: currentMonth.emailsSent,
            limit: 10000, // Default email limit
            remaining: Math.max(0, 10000 - currentMonth.emailsSent),
            percentage: Math.round((currentMonth.emailsSent / 10000) * 100)
          },
          apiCalls: {
            used: currentMonth.apiCalls,
            limit: 50000, // Default API call limit
            remaining: Math.max(0, 50000 - currentMonth.apiCalls),
            percentage: Math.round((currentMonth.apiCalls / 50000) * 100)
          }
        },
        plan: tenant.plan.type,
        billingCycle: tenant.plan.startDate,
        nextReset: this.getNextResetDate()
      };
    } catch (error) {
      console.error('Get tenant usage stats error:', error);
      throw error;
    }
  }

  /**
   * Check if user/tenant is approaching limits
   */
  async checkUsageLimits(userId, tenantId = null) {
    try {
      const alerts = [];

      if (userId) {
        const userStats = await this.getUserUsageStats(userId);
        
        // Check for usage approaching limits (80% threshold)
        Object.entries(userStats.currentMonth).forEach(([key, stats]) => {
          if (key !== 'total' && stats.percentage >= 80) {
            alerts.push({
              type: 'user_usage_warning',
              resource: key,
              percentage: stats.percentage,
              remaining: stats.remaining,
              message: `${key} usage is at ${stats.percentage}% of your monthly limit`
            });
          }
        });
      }

      if (tenantId) {
        const tenantStats = await this.getTenantUsageStats(tenantId);
        
        // Check tenant limits
        Object.entries(tenantStats.currentMonth).forEach(([key, stats]) => {
          if (stats.percentage >= 80) {
            alerts.push({
              type: 'tenant_usage_warning',
              resource: key,
              percentage: stats.percentage,
              remaining: stats.remaining,
              message: `Tenant ${key} usage is at ${stats.percentage}% of monthly limit`
            });
          }
        });
      }

      return alerts;
    } catch (error) {
      console.error('Check usage limits error:', error);
      return [];
    }
  }

  /**
   * Log usage event for analytics
   */
  async logUsageEvent(userId, usageType, amount, metadata) {
    try {
      // In a production system, you'd log to a dedicated analytics service
      console.log(`Usage Event: User ${userId} - ${usageType} - ${amount}`, metadata);
      
      // Could integrate with services like:
      // - Google Analytics
      // - Mixpanel
      // - Custom analytics database
      // - Billing system
    } catch (error) {
      console.error('Log usage event error:', error);
    }
  }

  /**
   * Log tenant usage event
   */
  async logTenantUsageEvent(tenantId, usageType, amount, metadata) {
    try {
      console.log(`Tenant Usage Event: ${tenantId} - ${usageType} - ${amount}`, metadata);
    } catch (error) {
      console.error('Log tenant usage event error:', error);
    }
  }

  /**
   * Reset monthly usage for all users (run monthly)
   */
  async resetMonthlyUsage() {
    try {
      console.log('Starting monthly usage reset...');
      
      // Reset user usage
      const users = await User.find({});
      for (const user of users) {
        await user.resetMonthlyUsage();
      }
      
      // Reset tenant usage
      const tenants = await Tenant.find({});
      for (const tenant of tenants) {
        // Reset tenant usage - similar to user reset
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        // Archive current month
        if (!tenant.usage.historical) {
          tenant.usage.historical = [];
        }
        
        tenant.usage.historical.push({
          month: monthKey,
          year: now.getFullYear(),
          usage: { ...tenant.usage.currentMonth }
        });
        
        // Reset current month
        tenant.usage.currentMonth = {
          campaignsGenerated: 0,
          videosGenerated: 0,
          aiTokensUsed: 0,
          emailsSent: 0,
          apiCalls: 0
        };
        
        await tenant.save();
      }
      
      console.log(`Monthly usage reset completed for ${users.length} users and ${tenants.length} tenants`);
    } catch (error) {
      console.error('Monthly usage reset error:', error);
    }
  }

  /**
   * Get next reset date (first day of next month)
   */
  getNextResetDate() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  /**
   * Start cron jobs for usage management
   */
  startCronJobs() {
    // Reset usage monthly (1st day of each month at 00:00)
    cron.schedule('0 0 1 * *', async () => {
      await this.resetMonthlyUsage();
    });

    // Send usage alerts weekly (every Monday at 09:00)
    cron.schedule('0 9 * * 1', async () => {
      await this.sendUsageAlerts();
    });

    console.log('Usage tracking cron jobs started');
  }

  /**
   * Send usage alerts to users approaching limits
   */
  async sendUsageAlerts() {
    try {
      const users = await User.find({});
      
      for (const user of users) {
        const alerts = await this.checkUsageLimits(user._id);
        
        if (alerts.length > 0) {
          // In production, send email notifications
          console.log(`Usage alerts for user ${user.email}:`, alerts);
          
          // Could integrate with:
          // - Email service (SendGrid, Mailgun)
          // - Push notifications
          // - In-app notifications
        }
      }
    } catch (error) {
      console.error('Send usage alerts error:', error);
    }
  }

  /**
   * Get usage analytics for admin dashboard
   */
  async getUsageAnalytics() {
    try {
      const users = await User.find({});
      const tenants = await Tenant.find({});

      const analytics = {
        totalUsers: users.length,
        totalTenants: tenants.length,
        planDistribution: {},
        totalUsage: {
          campaigns: 0,
          images: 0,
          analysis: 0,
          videos: 0,
          tokens: 0
        },
        topUsageUsers: [],
        topUsageTenants: []
      };

      // Calculate plan distribution
      users.forEach(user => {
        const plan = user.profile.subscription.plan;
        analytics.planDistribution[plan] = (analytics.planDistribution[plan] || 0) + 1;
      });

      // Calculate total usage
      users.forEach(user => {
        const usage = user.apiUsage.currentMonth;
        analytics.totalUsage.campaigns += usage.campaignGenerations;
        analytics.totalUsage.images += usage.imageGenerations;
        analytics.totalUsage.analysis += usage.analysisRequests;
      });

      tenants.forEach(tenant => {
        const usage = tenant.usage.currentMonth;
        analytics.totalUsage.videos += usage.videosGenerated;
        analytics.totalUsage.tokens += usage.aiTokensUsed;
      });

      return analytics;
    } catch (error) {
      console.error('Get usage analytics error:', error);
      throw error;
    }
  }
}

module.exports = UsageTrackingService; 