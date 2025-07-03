const OpenAI = require('openai');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const TrendsService = require('./trendsService');
const SocialMediaService = require('./socialMediaService');

class ConversationalAI {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.trendsService = new TrendsService();
    this.socialService = new SocialMediaService();
    
    // Conversation history storage (in production, use Redis/DB)
    this.conversations = new Map();
    
    this.systemPrompts = {
      marketingAnalyst: `You are an expert AI marketing analyst. You provide actionable, data-driven insights with specific recommendations. Always be helpful, professional, and focused on driving business results.`,
      dataInterpreter: `You are a specialized data interpretation AI that converts complex analytics into simple, understandable insights with actionable recommendations.`,
      strategicAdvisor: `You are a senior marketing strategist AI that provides strategic recommendations with implementation timelines and expected outcomes.`
    };
  }

  /**
   * Main conversation handler - analyzes context and provides intelligent responses
   */
  async handleConversation(userId, message, context = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const conversationType = this.determineConversationType(message, context);
      const systemPrompt = this.systemPrompts[conversationType];
      const contextData = await this.gatherContextualData(userId, message, context);
      const conversationHistory = this.getConversationHistory(userId);
      const fullPrompt = await this.buildContextualPrompt(message, contextData, user, context);

      const response = await this.generateAIResponse(systemPrompt, fullPrompt, conversationHistory);
      this.storeConversation(userId, message, response, contextData);
      const insights = await this.extractActionableInsights(response, contextData);

      return {
        success: true,
        response: response.content,
        insights,
        conversationType,
        confidence: response.confidence || 0.85,
        suggestedActions: insights.actions || [],
        dataSourcesUsed: contextData.sources || [],
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Conversational AI error:', error);
      throw error;
    }
  }

  /**
   * Analyze campaign performance with AI insights
   */
  async analyzeCampaignPerformance(userId, campaignId, timeframe = '30d') {
    try {
      const user = await User.findById(userId);
      const campaign = user.campaigns.id(campaignId);
      
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const campaignData = {
        campaign: {
          name: campaign.name,
          type: campaign.type,
          status: campaign.status,
          metrics: campaign.metrics,
          targeting: campaign.targeting,
          content: campaign.content,
          createdAt: campaign.createdAt,
          daysRunning: Math.floor((new Date() - campaign.createdAt) / (1000 * 60 * 60 * 24))
        },
        industry: user.industry,
        companySize: user.company,
        benchmarks: await this.getIndustryBenchmarks(user.industry, campaign.type)
      };

      const analysisPrompt = `
        Analyze this marketing campaign performance and provide detailed insights:
        
        Campaign Details: ${JSON.stringify(campaignData.campaign, null, 2)}
        Industry: ${campaignData.industry}
        
        Provide structured analysis with performance assessment, optimization opportunities, and specific recommendations.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: "system", content: this.systemPrompts.marketingAnalyst },
          { role: "user", content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 3000
      });

      return {
        success: true,
        campaignId,
        analysis: response.choices[0].message.content,
        confidence: 0.9,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Campaign analysis error:', error);
      throw error;
    }
  }

  /**
   * Generate strategic recommendations based on user's complete data
   */
  async generateStrategicRecommendations(userId, goals = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Gather comprehensive user data
      const userData = {
        profile: {
          industry: user.industry,
          company: user.company,
          plan: user.profile.subscription.plan
        },
        campaigns: user.getCampaignStats(),
        usage: user.apiUsage.currentMonth,
        recentActivity: user.campaigns.slice(-5).map(c => ({
          name: c.name,
          type: c.type,
          status: c.status,
          performance: c.metrics
        }))
      };

      // Get market context
      const marketContext = await this.trendsService.getMarketTrends(user.industry);
      const socialContext = await this.socialService.getAudienceAnalytics('30d');

      const strategicPrompt = `
        As a senior marketing strategist, analyze this company's complete marketing situation and provide strategic recommendations:
        
        Company Profile: ${JSON.stringify(userData.profile, null, 2)}
        Campaign Performance: ${JSON.stringify(userData.campaigns, null, 2)}
        Recent Activity: ${JSON.stringify(userData.recentActivity, null, 2)}
        Market Trends: ${JSON.stringify(marketContext.analysis, null, 2)}
        Goals: ${JSON.stringify(goals, null, 2)}
        
        Provide a comprehensive strategic plan including:
        1. Situation Analysis (SWOT)
        2. Strategic Priorities (next 90 days)
        3. Channel Strategy Recommendations
        4. Budget Allocation Suggestions
        5. Content Strategy Framework
        6. Measurement & KPI Framework
        7. Quarterly Roadmap
        8. Risk Mitigation Strategies
        
        Format as actionable business strategy with specific timelines and metrics.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: "system",
            content: this.systemPrompts.strategicAdvisor
          },
          {
            role: "user",
            content: strategicPrompt
          }
        ],
        temperature: 0.4,
        max_tokens: 4000
      });

      const strategy = JSON.parse(response.choices[0].message.content);
      
      return {
        success: true,
        strategy,
        confidence: 0.87,
        timeframe: '90 days',
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Strategic recommendations error:', error);
      throw error;
    }
  }

  /**
   * Real-time data interpretation and insights
   */
  async interpretDataInRealTime(userId, dataType, dataPoints, question = null) {
    try {
      const interpretationPrompt = question 
        ? `User asks: "${question}"\n\nAnalyze this ${dataType} data and answer their question:\n${JSON.stringify(dataPoints, null, 2)}`
        : `Analyze this ${dataType} data and provide key insights:\n${JSON.stringify(dataPoints, null, 2)}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: "system",
            content: this.systemPrompts.dataInterpreter
          },
          {
            role: "user",
            content: interpretationPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1500
      });

      return {
        success: true,
        interpretation: response.choices[0].message.content,
        dataType,
        confidence: 0.85,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Data interpretation error:', error);
      throw error;
    }
  }

  /**
   * Sentiment analysis with conversational context
   */
  async analyzeSentimentWithContext(userId, sentimentData, context = {}) {
    try {
      const sentimentPrompt = `
        Analyze this brand sentiment data and provide strategic insights:
        
        Sentiment Data: ${JSON.stringify(sentimentData, null, 2)}
        Context: ${JSON.stringify(context, null, 2)}
        
        Provide:
        1. Overall sentiment summary
        2. Key sentiment drivers (positive and negative)
        3. Reputation risk assessment
        4. Response strategy recommendations
        5. Monitoring priorities
        6. Crisis prevention measures
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: "system",
            content: "You are an expert brand reputation and sentiment analysis specialist."
          },
          {
            role: "user",
            content: sentimentPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      return {
        success: true,
        analysis: response.choices[0].message.content,
        riskLevel: this.assessRiskLevel(sentimentData),
        recommendations: this.extractRecommendations(response.choices[0].message.content),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      throw error;
    }
  }

  // Helper methods
  determineConversationType(message, context) {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('strategy') || messageLower.includes('plan')) {
      return 'strategicAdvisor';
    } else if (messageLower.includes('data') || messageLower.includes('metrics')) {
      return 'dataInterpreter';
    } else {
      return 'marketingAnalyst';
    }
  }

  async gatherContextualData(userId, message, context) {
    try {
      const user = await User.findById(userId);
      return {
        user: {
          industry: user.industry,
          company: user.company,
          plan: user.profile.subscription.plan
        },
        campaigns: user.getCampaignStats(),
        sources: ['user_profile', 'campaigns']
      };
    } catch (error) {
      return { sources: ['user_profile'] };
    }
  }

  getConversationHistory(userId) {
    return this.conversations.get(userId) || [];
  }

  async buildContextualPrompt(message, contextData, user, context) {
    return `
      User Question: ${message}
      
      User Context:
      - Industry: ${user.industry}
      - Company: ${user.company}
      - Plan: ${user.profile.subscription.plan}
      
      Available Data: ${JSON.stringify(contextData, null, 2)}
      
      Please provide a helpful, actionable response with specific recommendations.
    `;
  }

  async generateAIResponse(systemPrompt, userPrompt, conversationHistory) {
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-4),
      { role: "user", content: userPrompt }
    ];

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.4,
      max_tokens: 2500
    });

    return {
      content: response.choices[0].message.content,
      confidence: 0.85
    };
  }

  storeConversation(userId, userMessage, aiResponse, contextData) {
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, []);
    }
    
    const history = this.conversations.get(userId);
    history.push(
      { role: "user", content: userMessage },
      { role: "assistant", content: aiResponse.content }
    );
    
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
  }

  async extractActionableInsights(response, contextData) {
    try {
      const actions = [];
      const content = response.content || response;
      
      const actionPatterns = [
        /should (.*?)(?=\.|$)/gi,
        /recommend (.*?)(?=\.|$)/gi,
        /consider (.*?)(?=\.|$)/gi
      ];
      
      actionPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          actions.push(...matches.slice(0, 3));
        }
      });

      return {
        actions: actions.slice(0, 5),
        dataQuality: contextData.sources?.length > 2 ? 'high' : 'medium',
        confidence: actions.length > 0 ? 0.8 : 0.6
      };
    } catch (error) {
      return { actions: [], dataQuality: 'low', confidence: 0.5 };
    }
  }

  async getIndustryBenchmarks(industry, campaignType) {
    const benchmarks = {
      'Technology': { ctr: 2.5, cpc: 1.2, conversionRate: 3.5 },
      'Healthcare': { ctr: 2.1, cpc: 1.8, conversionRate: 4.2 },
      'E-commerce': { ctr: 3.2, cpc: 0.8, conversionRate: 2.8 }
    };
    
    return benchmarks[industry] || benchmarks['Technology'];
  }

  async getCompetitorInsights(industry) {
    // Placeholder for competitor analysis
    return {
      averageSpend: '$5,000/month',
      topChannels: ['Google Ads', 'Facebook', 'LinkedIn'],
      trendingKeywords: ['AI', 'automation', 'digital transformation']
    };
  }

  assessRiskLevel(sentimentData) {
    // Simple risk assessment based on sentiment scores
    const negativeRatio = sentimentData.negative / (sentimentData.total || 1);
    
    if (negativeRatio > 0.4) return 'high';
    if (negativeRatio > 0.2) return 'medium';
    return 'low';
  }

  extractRecommendations(content) {
    // Extract bullet points and numbered lists as recommendations
    const recommendations = [];
    const patterns = [
      /\d+\.\s*(.*?)(?=\n|\d+\.|\*|$)/g,
      /\*\s*(.*?)(?=\n|\*|$)/g,
      /-\s*(.*?)(?=\n|-|$)/g
    ];
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        recommendations.push(...matches.slice(0, 3));
      }
    });
    
    return recommendations.slice(0, 5);
  }
}

module.exports = ConversationalAI; 