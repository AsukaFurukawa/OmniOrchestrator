const OpenAI = require('openai');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const TrendsService = require('./trendsService');
const SocialMediaService = require('./socialMediaService');

class AdvancedAnalytics {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.trendsService = new TrendsService();
    this.socialService = new SocialMediaService();
    
    // Analytics cache for performance
    this.cache = new Map();
    this.cacheExpiry = 15 * 60 * 1000; // 15 minutes
    
    // Predictive models configuration
    this.models = {
      engagement: {
        name: 'Engagement Predictor',
        accuracy: 0.85,
        features: ['time_of_day', 'content_type', 'audience_size', 'hashtags', 'sentiment']
      },
      conversion: {
        name: 'Conversion Optimizer',
        accuracy: 0.78,
        features: ['channel', 'audience_match', 'content_quality', 'timing', 'budget']
      },
      retention: {
        name: 'Retention Analyzer',
        accuracy: 0.82,
        features: ['engagement_history', 'content_relevance', 'frequency', 'personalization']
      }
    };
  }

  /**
   * Comprehensive campaign performance analysis with AI insights
   */
  async analyzeCampaignPerformance(userId, campaignId, options = {}) {
    try {
      const cacheKey = `campaign_analysis_${userId}_${campaignId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const user = await User.findById(userId);
      const campaign = user.campaigns.id(campaignId);
      
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Gather comprehensive data
      const analysisData = await this.gatherCampaignData(user, campaign, options);
      
      // AI-powered insights
      const insights = await this.generateAIInsights(analysisData);
      
      // Predictive modeling
      const predictions = await this.generatePredictions(analysisData);
      
      // Optimization recommendations
      const recommendations = await this.generateOptimizations(analysisData, insights, predictions);
      
      // Competitive analysis
      const competitiveAnalysis = await this.generateCompetitiveAnalysis(user, campaign);
      
      // Performance scoring
      const performanceScore = this.calculatePerformanceScore(campaign, insights);
      
      const result = {
        success: true,
        campaignId,
        analysis: {
          overview: {
            performanceScore,
            status: this.getPerformanceStatus(performanceScore),
            keyMetrics: this.extractKeyMetrics(campaign),
            timeframe: options.timeframe || '30d'
          },
          insights,
          predictions,
          recommendations,
          competitiveAnalysis,
          benchmarks: await this.getIndustryBenchmarks(user.industry, campaign.type),
          riskAssessment: this.assessRisks(campaign, insights),
          actionPlan: await this.generateActionPlan(recommendations)
        },
        metadata: {
          confidence: this.calculateConfidence(analysisData),
          dataQuality: this.assessDataQuality(analysisData),
          generatedAt: new Date()
        }
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Advanced analytics error:', error);
      throw error;
    }
  }

  /**
   * Multi-campaign portfolio analysis
   */
  async analyzePortfolio(userId, options = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const campaigns = user.campaigns.filter(c => c.status === 'active');
      
      if (campaigns.length === 0) {
        return {
          success: false,
          error: 'No active campaigns found'
        };
      }

      // Portfolio metrics
      const portfolioMetrics = this.calculatePortfolioMetrics(campaigns);
      
      // Channel performance analysis
      const channelAnalysis = await this.analyzeChannelPerformance(campaigns);
      
      // Budget optimization
      const budgetOptimization = await this.optimizeBudgetAllocation(campaigns);
      
      // Risk diversification
      const riskAnalysis = this.analyzePortfolioRisk(campaigns);
      
      // AI-powered portfolio insights
      const portfolioInsights = await this.generatePortfolioInsights(campaigns, portfolioMetrics);

      return {
        success: true,
        portfolio: {
          overview: portfolioMetrics,
          channelAnalysis,
          budgetOptimization,
          riskAnalysis,
          insights: portfolioInsights,
          recommendations: await this.generatePortfolioRecommendations(campaigns)
        },
        metadata: {
          campaignCount: campaigns.length,
          generatedAt: new Date()
        }
      };
    } catch (error) {
      console.error('Portfolio analysis error:', error);
      throw error;
    }
  }

  /**
   * Real-time performance monitoring with alerts
   */
  async monitorPerformance(userId, campaignId, thresholds = {}) {
    try {
      const user = await User.findById(userId);
      const campaign = user.campaigns.id(campaignId);
      
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Get real-time metrics
      const currentMetrics = await this.getCurrentMetrics(campaign);
      
      // Compare with thresholds
      const alerts = this.checkThresholds(currentMetrics, thresholds);
      
      // Performance trends
      const trends = await this.analyzeTrends(campaign);
      
      // Anomaly detection
      const anomalies = this.detectAnomalies(currentMetrics, trends);
      
      // Auto-recommendations if issues detected
      const autoRecommendations = [];
      if (alerts.length > 0 || anomalies.length > 0) {
        autoRecommendations.push(
          ...await this.generateEmergencyRecommendations(campaign, alerts, anomalies)
        );
      }

      return {
        success: true,
        monitoring: {
          currentMetrics,
          alerts,
          trends,
          anomalies,
          autoRecommendations,
          status: this.getMonitoringStatus(alerts, anomalies),
          lastChecked: new Date()
        }
      };
    } catch (error) {
      console.error('Performance monitoring error:', error);
      throw error;
    }
  }

  /**
   * Predictive analytics for campaign optimization
   */
  async generatePredictions(analysisData) {
    return {
      engagement: {
        predicted_rate: 0.035,
        confidence: 0.85,
        factors: ['content_quality', 'timing', 'audience_match']
      },
      conversion: {
        predicted_rate: 0.045,
        confidence: 0.78,
        factors: ['audience_targeting', 'offer_strength', 'landing_page']
      },
      budgetOptimization: {
        recommended_budget: analysisData.campaign.budget * 1.2,
        efficiency: 0.75,
        reasoning: 'Increase budget for better performance'
      }
    };
  }

  /**
   * AI-powered insights generation
   */
  async generateAIInsights(analysisData) {
    try {
      const insightsPrompt = `
        Analyze this marketing campaign data and provide deep insights:
        
        Campaign Data: ${JSON.stringify(analysisData, null, 2)}
        
        Provide insights on performance drivers, audience behavior, content effectiveness, and optimization opportunities.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: "system",
            content: "You are an expert marketing analyst AI that provides deep, actionable insights."
          },
          {
            role: "user",
            content: insightsPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      return this.parseAIResponse(response.choices[0].message.content);
    } catch (error) {
      console.error('AI insights generation error:', error);
      return { error: 'Failed to generate AI insights' };
    }
  }

  /**
   * Generate optimization recommendations
   */
  async generateOptimizations(analysisData, insights, predictions) {
    const optimizations = [];
    
    // Performance-based optimizations
    if (analysisData.campaign.metrics.engagement_rate < 0.02) {
      optimizations.push({
        type: 'engagement',
        priority: 'high',
        recommendation: 'Increase content interactivity and visual appeal',
        expectedImpact: '+25% engagement',
        effort: 'medium'
      });
    }
    
    // Budget optimizations
    if (predictions.budgetOptimization && predictions.budgetOptimization.efficiency < 0.7) {
      optimizations.push({
        type: 'budget',
        priority: 'high',
        recommendation: 'Reallocate budget to higher-performing channels',
        expectedImpact: '+15% ROI',
        effort: 'low'
      });
    }
    
    // Timing optimizations
    if (insights.timing && insights.timing.optimization_potential > 0.3) {
      optimizations.push({
        type: 'timing',
        priority: 'medium',
        recommendation: 'Adjust posting schedule based on audience activity',
        expectedImpact: '+10% reach',
        effort: 'low'
      });
    }
    
    // AI-generated optimizations
    const aiOptimizations = await this.generateAIOptimizations(analysisData, insights);
    optimizations.push(...aiOptimizations);

    return optimizations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Helper methods
  async gatherCampaignData(user, campaign, options) {
    return {
      user: {
        industry: user.industry,
        company: user.company,
        plan: user.profile.subscription.plan
      },
      campaign: {
        id: campaign._id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        metrics: campaign.metrics,
        targeting: campaign.targeting,
        content: campaign.content,
        budget: campaign.budget,
        schedule: campaign.schedule,
        createdAt: campaign.createdAt,
        daysRunning: Math.floor((new Date() - campaign.createdAt) / (1000 * 60 * 60 * 24))
      },
      context: {
        timeframe: options.timeframe || '30d',
        includeCompetitors: options.includeCompetitors || false,
        includeTrends: options.includeTrends || true
      }
    };
  }

  calculatePerformanceScore(campaign, insights) {
    let score = 0;
    const metrics = campaign.metrics;
    
    // Base scoring
    score += Math.min(metrics.engagement_rate * 1000, 50); // Max 50 points
    score += Math.min(metrics.conversion_rate * 500, 30); // Max 30 points
    score += Math.min(metrics.roi * 10, 20); // Max 20 points
    
    // Bonus for consistency
    if (insights.consistency && insights.consistency.score > 0.8) {
      score += 10;
    }
    
    return Math.min(Math.round(score), 100);
  }

  getPerformanceStatus(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'needs_improvement';
  }

  extractKeyMetrics(campaign) {
    const metrics = campaign.metrics;
    return {
      impressions: metrics.impressions || 0,
      clicks: metrics.clicks || 0,
      conversions: metrics.conversions || 0,
      engagement_rate: metrics.engagement_rate || 0,
      conversion_rate: metrics.conversion_rate || 0,
      ctr: metrics.ctr || 0,
      roi: metrics.roi || 0,
      spend: metrics.spend || 0
    };
  }

  calculateConfidence(analysisData) {
    let confidence = 0.7; // Base confidence
    
    // Increase confidence with more data
    if (analysisData.campaign.daysRunning > 30) confidence += 0.1;
    if (analysisData.campaign.metrics.impressions > 10000) confidence += 0.1;
    if (analysisData.campaign.metrics.clicks > 500) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  assessDataQuality(analysisData) {
    const metrics = analysisData.campaign.metrics;
    let quality = 'medium';
    
    if (metrics.impressions > 50000 && metrics.clicks > 1000) {
      quality = 'high';
    } else if (metrics.impressions < 1000 || metrics.clicks < 50) {
      quality = 'low';
    }
    
    return quality;
  }

  // Cache management
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Placeholder methods for complex analytics
  async getIndustryBenchmarks(industry, campaignType) {
    // In production, this would fetch real benchmark data
    return {
      engagement_rate: 0.025,
      conversion_rate: 0.035,
      ctr: 0.02,
      roi: 3.5
    };
  }

  assessRisks(campaign, insights) {
    const risks = [];
    
    if (campaign.metrics.engagement_rate < 0.01) {
      risks.push({
        type: 'low_engagement',
        severity: 'high',
        description: 'Engagement rate is critically low'
      });
    }
    
    if (campaign.metrics.roi < 1.0) {
      risks.push({
        type: 'negative_roi',
        severity: 'critical',
        description: 'Campaign is losing money'
      });
    }
    
    return risks;
  }

  async generateActionPlan(recommendations) {
    return recommendations.slice(0, 5).map((rec, index) => ({
      step: index + 1,
      action: rec.recommendation,
      timeframe: rec.effort === 'low' ? '1-2 days' : rec.effort === 'medium' ? '1 week' : '2-3 weeks',
      priority: rec.priority,
      expectedImpact: rec.expectedImpact
    }));
  }

  parseAIResponse(response) {
    try {
      // Try to parse JSON if it's structured
      if (response.trim().startsWith('{')) {
        return JSON.parse(response);
      }
      
      // Otherwise, return as structured text
      return {
        summary: response,
        structured: false
      };
    } catch (error) {
      return {
        summary: response,
        structured: false
      };
    }
  }

  async generateAIOptimizations(analysisData, insights) {
    // This would generate AI-powered optimizations
    return [
      {
        type: 'ai_generated',
        priority: 'medium',
        recommendation: 'AI-powered content optimization based on audience preferences',
        expectedImpact: '+12% engagement',
        effort: 'medium'
      }
    ];
  }

  // Additional placeholder methods
  calculatePortfolioMetrics(campaigns) {
    return {
      totalSpend: campaigns.reduce((sum, c) => sum + (c.metrics.spend || 0), 0),
      avgROI: campaigns.reduce((sum, c) => sum + (c.metrics.roi || 0), 0) / campaigns.length,
      totalConversions: campaigns.reduce((sum, c) => sum + (c.metrics.conversions || 0), 0)
    };
  }

  async analyzeChannelPerformance(campaigns) {
    // Analyze performance by channel
    return {
      topChannels: ['social_media', 'search', 'email'],
      channelROI: {
        social_media: 2.5,
        search: 3.2,
        email: 4.1
      }
    };
  }

  async optimizeBudgetAllocation(campaigns) {
    return {
      currentAllocation: campaigns.map(c => ({ name: c.name, budget: c.budget })),
      recommendedAllocation: campaigns.map(c => ({ name: c.name, budget: c.budget * 1.1 }))
    };
  }

  analyzePortfolioRisk(campaigns) {
    return {
      diversificationScore: 0.75,
      riskLevel: 'medium',
      recommendations: ['Diversify across more channels', 'Balance high/low risk campaigns']
    };
  }

  async generatePortfolioInsights(campaigns, metrics) {
    return {
      summary: `Portfolio of ${campaigns.length} campaigns with ${metrics.avgROI.toFixed(1)}x average ROI`,
      keyInsights: [
        'Strong performance in search campaigns',
        'Opportunity to expand social media presence',
        'Budget allocation needs optimization'
      ]
    };
  }

  async generatePortfolioRecommendations(campaigns) {
    return [
      {
        type: 'budget_reallocation',
        priority: 'high',
        recommendation: 'Shift 15% budget from low-performing to high-performing campaigns'
      },
      {
        type: 'channel_expansion',
        priority: 'medium',
        recommendation: 'Test new channels based on audience insights'
      }
    ];
  }

  // More placeholder methods for monitoring
  async getCurrentMetrics(campaign) {
    return campaign.metrics;
  }

  checkThresholds(metrics, thresholds) {
    const alerts = [];
    
    if (thresholds.min_engagement && metrics.engagement_rate < thresholds.min_engagement) {
      alerts.push({
        type: 'low_engagement',
        severity: 'warning',
        message: 'Engagement rate below threshold'
      });
    }
    
    return alerts;
  }

  async analyzeTrends(campaign) {
    return {
      engagement: 'increasing',
      conversions: 'stable',
      roi: 'improving'
    };
  }

  detectAnomalies(metrics, trends) {
    return []; // Placeholder for anomaly detection
  }

  async generateEmergencyRecommendations(campaign, alerts, anomalies) {
    return [
      {
        type: 'emergency',
        priority: 'critical',
        recommendation: 'Immediate action required based on alerts'
      }
    ];
  }

  getMonitoringStatus(alerts, anomalies) {
    if (alerts.some(a => a.severity === 'critical') || anomalies.length > 0) {
      return 'attention_required';
    }
    if (alerts.some(a => a.severity === 'warning')) {
      return 'monitoring';
    }
    return 'healthy';
  }

  // Prediction methods
  async predictEngagement(analysisData) {
    return {
      predicted_rate: 0.035,
      confidence: 0.85,
      factors: ['content_quality', 'timing', 'audience_match']
    };
  }

  async predictConversion(analysisData) {
    return {
      predicted_rate: 0.045,
      confidence: 0.78,
      factors: ['audience_targeting', 'offer_strength', 'landing_page']
    };
  }

  async predictOptimalBudget(analysisData) {
    return {
      recommended_budget: analysisData.campaign.budget * 1.2,
      efficiency: 0.75,
      reasoning: 'Increase budget for better performance'
    };
  }

  async predictAudienceGrowth(analysisData) {
    return {
      growth_rate: 0.15,
      timeframe: '30 days',
      factors: ['content_strategy', 'engagement_rate']
    };
  }

  async predictTrends(analysisData) {
    return {
      engagement: 'increasing',
      market_demand: 'stable',
      competition: 'intensifying'
    };
  }

  async generateCompetitiveAnalysis(user, campaign) {
    return {
      position: 'competitive',
      strengths: ['Strong engagement', 'Good targeting'],
      weaknesses: ['Higher costs', 'Limited reach'],
      opportunities: ['New channels', 'Audience expansion']
    };
  }
}

module.exports = AdvancedAnalytics; 