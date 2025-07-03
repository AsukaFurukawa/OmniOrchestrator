const OpenAI = require('openai');
const axios = require('axios');
const crypto = require('crypto');

class SentimentAnalysis {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Sentiment monitoring configuration
    this.monitoringActive = new Map();
    this.sentimentHistory = new Map();
    this.alerts = new Map();
    
    // Brand reputation thresholds
    this.thresholds = {
      critical: -0.7,
      warning: -0.3,
      good: 0.3,
      excellent: 0.7
    };
    
    // Sentiment sources
    this.sources = {
      social: ['twitter', 'facebook', 'instagram', 'linkedin', 'tiktok'],
      review: ['google', 'yelp', 'trustpilot', 'amazon'],
      news: ['google_news', 'reddit', 'forums'],
      custom: ['surveys', 'feedback', 'support_tickets']
    };
    
    // Real-time processing queue
    this.processingQueue = [];
    this.processing = false;
  }

  /**
   * Analyze sentiment for brand mentions across all sources
   */
  async analyzeBrandSentiment(brandName, options = {}) {
    try {
      const mentions = await this.gatherBrandMentions(brandName, options.sources || ['social']);
      const sentimentResults = await this.analyzeMentionsSentiment(mentions);
      const aggregatedSentiment = this.aggregateSentiment(sentimentResults);
      
      return {
        success: true,
        brandName,
        sentiment: aggregatedSentiment,
        mentions: mentions.slice(0, 20),
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Brand sentiment analysis error:', error);
      throw error;
    }
  }

  /**
   * Real-time sentiment monitoring with alerts
   */
  async startRealtimeMonitoring(userId, brandName, options = {}) {
    try {
      const monitoringId = crypto.randomUUID();
      const config = {
        id: monitoringId,
        userId,
        brandName,
        sources: options.sources || ['social', 'review'],
        keywords: options.keywords || [brandName],
        alertThreshold: options.alertThreshold || this.thresholds.warning,
        checkInterval: options.checkInterval || 300000, // 5 minutes
        isActive: true,
        startedAt: new Date(),
        lastCheck: new Date()
      };
      
      this.monitoringActive.set(monitoringId, config);
      
      // Start monitoring process
      this.runMonitoringLoop(monitoringId);
      
      return {
        success: true,
        monitoringId,
        config: {
          brandName: config.brandName,
          sources: config.sources,
          keywords: config.keywords,
          alertThreshold: config.alertThreshold,
          checkInterval: config.checkInterval
        },
        status: 'active'
      };
    } catch (error) {
      console.error('Realtime monitoring setup error:', error);
      throw error;
    }
  }

  /**
   * Analyze sentiment for campaign content
   */
  async analyzeCampaignSentiment(userId, campaignId, contentData) {
    try {
      const sentimentResults = [];
      
      // Analyze different types of content
      if (contentData.posts) {
        for (const post of contentData.posts) {
          const sentiment = await this.analyzeSingleContent(post.text, 'social_post');
          sentimentResults.push({
            type: 'post',
            id: post.id,
            sentiment,
            engagement: post.engagement || {}
          });
        }
      }
      
      if (contentData.ads) {
        for (const ad of contentData.ads) {
          const sentiment = await this.analyzeSingleContent(ad.text, 'advertisement');
          sentimentResults.push({
            type: 'ad',
            id: ad.id,
            sentiment,
            performance: ad.performance || {}
          });
        }
      }
      
      if (contentData.emails) {
        for (const email of contentData.emails) {
          const sentiment = await this.analyzeSingleContent(email.subject + ' ' + email.body, 'email');
          sentimentResults.push({
            type: 'email',
            id: email.id,
            sentiment,
            metrics: email.metrics || {}
          });
        }
      }
      
      // Aggregate campaign sentiment
      const campaignSentiment = this.aggregateCampaignSentiment(sentimentResults);
      
      // Generate content optimization recommendations
      const optimizations = await this.generateContentOptimizations(sentimentResults);
      
      return {
        success: true,
        campaignId,
        sentiment: campaignSentiment,
        contentAnalysis: sentimentResults,
        optimizations,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Campaign sentiment analysis error:', error);
      throw error;
    }
  }

  /**
   * Competitive sentiment analysis
   */
  async analyzeCompetitorSentiment(userId, competitorBrands, options = {}) {
    try {
      const timeframe = options.timeframe || '30d';
      const competitorAnalysis = {};
      
      // Analyze each competitor
      for (const brand of competitorBrands) {
        const mentions = await this.gatherBrandMentions(brand, ['social', 'review'], timeframe);
        const sentimentResults = await this.analyzeMentionsSentiment(mentions);
        const aggregatedSentiment = this.aggregateSentiment(sentimentResults);
        
        competitorAnalysis[brand] = {
          sentiment: aggregatedSentiment.overall,
          volume: aggregatedSentiment.volume,
          topMentions: mentions.slice(0, 10),
          strengths: await this.extractBrandStrengths(mentions, sentimentResults),
          weaknesses: await this.extractBrandWeaknesses(mentions, sentimentResults)
        };
      }
      
      // Comparative analysis
      const comparison = this.generateCompetitiveComparison(competitorAnalysis);
      
      // Strategic insights
      const strategicInsights = await this.generateCompetitiveInsights(competitorAnalysis, comparison);
      
      return {
        success: true,
        competitors: competitorAnalysis,
        comparison,
        strategicInsights,
        timeframe,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Competitor sentiment analysis error:', error);
      throw error;
    }
  }

  /**
   * Core sentiment analysis using OpenAI
   */
  async analyzeSingleContent(text, contentType = 'general') {
    try {
      const sentimentPrompt = `
        Analyze the sentiment of this ${contentType} content:
        
        Content: "${text}"
        
        Provide:
        1. Overall sentiment score (-1 to 1)
        2. Sentiment label (very negative, negative, neutral, positive, very positive)
        3. Confidence score (0 to 1)
        4. Key emotional themes detected
        5. Specific positive/negative elements
        
        Format as JSON.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: "system",
            content: "You are an expert sentiment analysis AI. Provide accurate sentiment scores and detailed emotional analysis."
          },
          {
            role: "user",
            content: sentimentPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      
      return {
        score: analysis.sentiment_score || 0,
        label: analysis.sentiment_label || 'neutral',
        confidence: analysis.confidence || 0.7,
        themes: analysis.emotional_themes || [],
        positives: analysis.positive_elements || [],
        negatives: analysis.negative_elements || [],
        raw_text: text,
        analyzed_at: new Date()
      };
    } catch (error) {
      console.error('Single content sentiment analysis error:', error);
      return {
        score: 0,
        label: 'neutral',
        confidence: 0.5,
        themes: [],
        positives: [],
        negatives: [],
        raw_text: text,
        analyzed_at: new Date(),
        error: error.message
      };
    }
  }

  /**
   * Gather brand mentions from various sources
   */
  async gatherBrandMentions(brandName, sources, timeframe) {
    const mentions = [];
    
    // For demo purposes, we'll generate mock mentions
    // In production, this would integrate with actual APIs
    const mockMentions = this.generateMockMentions(brandName, sources, timeframe);
    mentions.push(...mockMentions);
    
    // TODO: Integrate with real APIs
    // - Twitter API
    // - Facebook Graph API
    // - Google Reviews API
    // - Reddit API
    // - News APIs
    
    return mentions;
  }

  /**
   * Analyze sentiment for multiple mentions
   */
  async analyzeMentionsSentiment(mentions) {
    const results = [];
    
    // Process mentions in batches for efficiency
    const batchSize = 10;
    for (let i = 0; i < mentions.length; i += batchSize) {
      const batch = mentions.slice(i, i + batchSize);
      const batchPromises = batch.map(mention => 
        this.analyzeSingleContent(mention.text, mention.source)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Aggregate sentiment data
   */
  aggregateSentiment(sentimentResults) {
    if (sentimentResults.length === 0) {
      return {
        overall: { score: 0, label: 'neutral', confidence: 0 },
        breakdown: {},
        volume: 0,
        sources: {}
      };
    }
    
    const totalScore = sentimentResults.reduce((sum, result) => sum + result.score, 0);
    const averageScore = totalScore / sentimentResults.length;
    const totalConfidence = sentimentResults.reduce((sum, result) => sum + result.confidence, 0);
    const averageConfidence = totalConfidence / sentimentResults.length;
    
    // Sentiment breakdown
    const breakdown = {
      very_positive: sentimentResults.filter(r => r.score > 0.6).length,
      positive: sentimentResults.filter(r => r.score > 0.2 && r.score <= 0.6).length,
      neutral: sentimentResults.filter(r => r.score >= -0.2 && r.score <= 0.2).length,
      negative: sentimentResults.filter(r => r.score >= -0.6 && r.score < -0.2).length,
      very_negative: sentimentResults.filter(r => r.score < -0.6).length
    };
    
    return {
      overall: {
        score: averageScore,
        label: this.getScoreLabel(averageScore),
        confidence: averageConfidence
      },
      breakdown,
      volume: sentimentResults.length,
      sources: this.aggregateSourceData(sentimentResults)
    };
  }

  /**
   * Generate sentiment insights
   */
  async generateSentimentInsights(aggregatedSentiment, mentions) {
    try {
      const insightsPrompt = `
        Analyze this sentiment data and provide strategic insights:
        
        Overall Sentiment: ${aggregatedSentiment.overall.score} (${aggregatedSentiment.overall.label})
        Volume: ${aggregatedSentiment.volume} mentions
        Breakdown: ${JSON.stringify(aggregatedSentiment.breakdown)}
        
        Top Mentions: ${mentions.slice(0, 10).map(m => m.text).join('; ')}
        
        Provide:
        1. Key sentiment drivers
        2. Reputation opportunities
        3. Risk factors
        4. Strategic recommendations
        5. Content themes to focus on
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: "system",
            content: "You are an expert brand reputation and sentiment strategist."
          },
          {
            role: "user",
            content: insightsPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      return {
        summary: response.choices[0].message.content,
        generated_at: new Date()
      };
    } catch (error) {
      console.error('Sentiment insights generation error:', error);
      return {
        summary: 'Unable to generate insights at this time.',
        error: error.message,
        generated_at: new Date()
      };
    }
  }

  // Helper methods
  generateMockMentions(brandName, sources, timeframe) {
    const mentions = [];
    const mockTexts = [
      `Just tried ${brandName} and I'm impressed! Great quality and service.`,
      `${brandName} customer support was really helpful today.`,
      `Not sure about ${brandName} - the price seems a bit high.`,
      `Love the new features from ${brandName}! Game changer.`,
      `${brandName} needs to work on their delivery times.`,
      `Highly recommend ${brandName} to anyone looking for quality.`,
      `${brandName} has been my go-to for years now.`,
      `Disappointed with my recent ${brandName} experience.`,
      `${brandName} just launched something amazing!`,
      `The ${brandName} team really knows what they're doing.`
    ];
    
    const sourcesExpanded = sources.flatMap(s => this.sources[s] || [s]);
    
    for (let i = 0; i < 25; i++) {
      mentions.push({
        id: `mention_${i}`,
        text: mockTexts[i % mockTexts.length],
        source: sourcesExpanded[i % sourcesExpanded.length],
        author: `user_${i}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        engagement: {
          likes: Math.floor(Math.random() * 50),
          shares: Math.floor(Math.random() * 10),
          comments: Math.floor(Math.random() * 5)
        }
      });
    }
    
    return mentions;
  }

  getScoreLabel(score) {
    if (score > 0.6) return 'very_positive';
    if (score > 0.2) return 'positive';
    if (score >= -0.2) return 'neutral';
    if (score >= -0.6) return 'negative';
    return 'very_negative';
  }

  assessReputationRisk(aggregatedSentiment) {
    const score = aggregatedSentiment.overall.score;
    const volume = aggregatedSentiment.volume;
    const negativeRatio = (aggregatedSentiment.breakdown.negative + aggregatedSentiment.breakdown.very_negative) / volume;
    
    let riskLevel = 'low';
    let riskFactors = [];
    
    if (score < this.thresholds.critical) {
      riskLevel = 'critical';
      riskFactors.push('Overall sentiment critically low');
    } else if (score < this.thresholds.warning) {
      riskLevel = 'high';
      riskFactors.push('Overall sentiment concerning');
    } else if (negativeRatio > 0.3) {
      riskLevel = 'medium';
      riskFactors.push('High ratio of negative mentions');
    }
    
    if (volume > 1000 && riskLevel !== 'low') {
      riskFactors.push('High volume amplifies risk');
    }
    
    return {
      level: riskLevel,
      score: score,
      factors: riskFactors,
      recommendations: this.getRiskRecommendations(riskLevel)
    };
  }

  getRiskRecommendations(riskLevel) {
    const recommendations = {
      critical: [
        'Immediate crisis management response required',
        'Engage with negative mentions directly',
        'Implement damage control strategy',
        'Consider public statement or apology'
      ],
      high: [
        'Increase monitoring frequency',
        'Develop response strategy for negative mentions',
        'Focus on positive content creation',
        'Engage with community proactively'
      ],
      medium: [
        'Monitor trends closely',
        'Address specific concerns raised',
        'Boost positive content marketing',
        'Engage with satisfied customers'
      ],
      low: [
        'Maintain current monitoring',
        'Continue positive engagement',
        'Leverage positive mentions for marketing'
      ]
    };
    
    return recommendations[riskLevel] || recommendations.low;
  }

  async generateActionRecommendations(sentiment, risk, insights) {
    const recommendations = [];
    
    // Risk-based recommendations
    recommendations.push(...risk.recommendations.map(rec => ({
      type: 'risk_mitigation',
      priority: risk.level === 'critical' ? 'critical' : 'high',
      action: rec,
      category: 'reputation_management'
    })));
    
    // Sentiment-based recommendations
    if (sentiment.overall.score < 0) {
      recommendations.push({
        type: 'sentiment_improvement',
        priority: 'high',
        action: 'Launch customer satisfaction improvement initiative',
        category: 'customer_experience'
      });
    }
    
    if (sentiment.volume < 50) {
      recommendations.push({
        type: 'brand_awareness',
        priority: 'medium',
        action: 'Increase brand visibility and engagement campaigns',
        category: 'marketing'
      });
    }
    
    return recommendations;
  }

  aggregateSourceData(sentimentResults) {
    const sources = {};
    
    sentimentResults.forEach(result => {
      if (!sources[result.source]) {
        sources[result.source] = {
          count: 0,
          totalScore: 0,
          averageScore: 0
        };
      }
      
      sources[result.source].count++;
      sources[result.source].totalScore += result.score;
      sources[result.source].averageScore = sources[result.source].totalScore / sources[result.source].count;
    });
    
    return sources;
  }

  calculateConfidence(mentions, sentimentResults) {
    if (mentions.length === 0 || sentimentResults.length === 0) {
      return 0.3;
    }
    
    const avgConfidence = sentimentResults.reduce((sum, r) => sum + r.confidence, 0) / sentimentResults.length;
    const volumeBonus = Math.min(mentions.length / 100, 0.2); // Up to 0.2 bonus for volume
    
    return Math.min(avgConfidence + volumeBonus, 1.0);
  }

  storeSentimentHistory(userId, brandName, result) {
    const key = `${userId}_${brandName}`;
    if (!this.sentimentHistory.has(key)) {
      this.sentimentHistory.set(key, []);
    }
    
    const history = this.sentimentHistory.get(key);
    history.push({
      timestamp: new Date(),
      sentiment: result.sentiment,
      riskLevel: result.riskAssessment.level
    });
    
    // Keep only last 100 entries
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  async analyzeSentimentTrends(userId, brandName, timeframe) {
    const key = `${userId}_${brandName}`;
    const history = this.sentimentHistory.get(key) || [];
    
    if (history.length < 2) {
      return {
        trend: 'insufficient_data',
        direction: 'stable',
        change: 0
      };
    }
    
    const recent = history.slice(-5);
    const older = history.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, h) => sum + h.sentiment.overall.score, 0) / recent.length;
    const olderAvg = older.reduce((sum, h) => sum + h.sentiment.overall.score, 0) / older.length;
    
    const change = recentAvg - olderAvg;
    
    return {
      trend: change > 0.1 ? 'improving' : change < -0.1 ? 'declining' : 'stable',
      direction: change > 0 ? 'positive' : change < 0 ? 'negative' : 'stable',
      change: change,
      recent_average: recentAvg,
      historical_average: olderAvg
    };
  }

  // Monitoring methods
  async runMonitoringLoop(monitoringId) {
    const config = this.monitoringActive.get(monitoringId);
    if (!config || !config.isActive) return;
    
    try {
      // Check for new mentions
      const mentions = await this.gatherBrandMentions(config.brandName, config.sources, '1h');
      
      if (mentions.length > 0) {
        const sentimentResults = await this.analyzeMentionsSentiment(mentions);
        const aggregatedSentiment = this.aggregateSentiment(sentimentResults);
        
        // Check for alerts
        if (aggregatedSentiment.overall.score < config.alertThreshold) {
          await this.triggerAlert(config, aggregatedSentiment, mentions);
        }
        
        config.lastCheck = new Date();
      }
      
      // Schedule next check
      setTimeout(() => this.runMonitoringLoop(monitoringId), config.checkInterval);
    } catch (error) {
      console.error('Monitoring loop error:', error);
      setTimeout(() => this.runMonitoringLoop(monitoringId), config.checkInterval);
    }
  }

  async triggerAlert(config, sentiment, mentions) {
    const alert = {
      id: crypto.randomUUID(),
      monitoringId: config.id,
      userId: config.userId,
      brandName: config.brandName,
      alertType: 'sentiment_threshold',
      severity: sentiment.overall.score < this.thresholds.critical ? 'critical' : 'warning',
      sentiment: sentiment.overall,
      mentions: mentions.slice(0, 5),
      timestamp: new Date()
    };
    
    this.alerts.set(alert.id, alert);
    
    // Send real-time notification if socket service is available
    if (global.socketService) {
      global.socketService.sendToUser(config.userId, 'sentiment_alert', alert);
    }
    
    return alert;
  }

  aggregateCampaignSentiment(sentimentResults) {
    const byType = {};
    
    sentimentResults.forEach(result => {
      if (!byType[result.type]) {
        byType[result.type] = [];
      }
      byType[result.type].push(result.sentiment);
    });
    
    const overall = this.aggregateSentiment(sentimentResults.map(r => r.sentiment));
    
    return {
      overall: overall.overall,
      byType: Object.keys(byType).reduce((acc, type) => {
        acc[type] = this.aggregateSentiment(byType[type]);
        return acc;
      }, {})
    };
  }

  async generateContentOptimizations(sentimentResults) {
    const optimizations = [];
    
    const negativeContent = sentimentResults.filter(r => r.sentiment.score < -0.2);
    
    if (negativeContent.length > 0) {
      optimizations.push({
        type: 'content_sentiment',
        priority: 'high',
        recommendation: 'Revise negative-sentiment content to be more positive',
        affectedContent: negativeContent.map(c => c.id),
        expectedImpact: 'Improved audience reception'
      });
    }
    
    return optimizations;
  }

  async extractBrandStrengths(mentions, sentimentResults) {
    const positiveMentions = mentions.filter((_, i) => sentimentResults[i].score > 0.3);
    const themes = [];
    
    // Extract common positive themes (simplified)
    positiveMentions.forEach(mention => {
      if (mention.text.includes('quality')) themes.push('quality');
      if (mention.text.includes('service')) themes.push('service');
      if (mention.text.includes('recommend')) themes.push('recommendation');
    });
    
    return [...new Set(themes)];
  }

  async extractBrandWeaknesses(mentions, sentimentResults) {
    const negativeMentions = mentions.filter((_, i) => sentimentResults[i].score < -0.3);
    const themes = [];
    
    // Extract common negative themes (simplified)
    negativeMentions.forEach(mention => {
      if (mention.text.includes('price')) themes.push('pricing');
      if (mention.text.includes('delivery')) themes.push('delivery');
      if (mention.text.includes('support')) themes.push('support');
    });
    
    return [...new Set(themes)];
  }

  generateCompetitiveComparison(competitorAnalysis) {
    const brands = Object.keys(competitorAnalysis);
    const comparison = {
      rankings: brands.sort((a, b) => 
        competitorAnalysis[b].sentiment.overall.score - competitorAnalysis[a].sentiment.overall.score
      ),
      averageSentiment: brands.reduce((sum, brand) => 
        sum + competitorAnalysis[brand].sentiment.overall.score, 0) / brands.length,
      volumeLeader: brands.reduce((leader, brand) => 
        competitorAnalysis[brand].volume > competitorAnalysis[leader].volume ? brand : leader
      )
    };
    
    return comparison;
  }

  async generateCompetitiveInsights(competitorAnalysis, comparison) {
    const insights = [];
    
    const topBrand = comparison.rankings[0];
    const strengths = competitorAnalysis[topBrand].strengths;
    
    if (strengths.length > 0) {
      insights.push(`Market leader ${topBrand} excels in: ${strengths.join(', ')}`);
    }
    
    return insights;
  }

  // Public API methods
  stopMonitoring(monitoringId) {
    const config = this.monitoringActive.get(monitoringId);
    if (config) {
      config.isActive = false;
      this.monitoringActive.delete(monitoringId);
      return { success: true, message: 'Monitoring stopped' };
    }
    return { success: false, error: 'Monitor not found' };
  }

  getMonitoringStatus(monitoringId) {
    const config = this.monitoringActive.get(monitoringId);
    if (!config) {
      return { success: false, error: 'Monitor not found' };
    }
    
    return {
      success: true,
      status: {
        id: config.id,
        brandName: config.brandName,
        isActive: config.isActive,
        lastCheck: config.lastCheck,
        startedAt: config.startedAt
      }
    };
  }

  getUserAlerts(userId) {
    const userAlerts = [];
    for (const [alertId, alert] of this.alerts.entries()) {
      if (alert.userId === userId) {
        userAlerts.push(alert);
      }
    }
    return userAlerts.sort((a, b) => b.timestamp - a.timestamp);
  }
}

module.exports = SentimentAnalysis; 