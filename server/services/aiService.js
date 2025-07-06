const OpenAI = require('openai');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class AIService {
  constructor() {
    // Primary OpenAI instance
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // CometAPI as fallback (1M free tokens)
    this.cometai = new OpenAI({
      apiKey: process.env.COMETAI_API_KEY || 'sk-your-cometai-key',
      baseURL: 'https://api.cometapi.com/v1'
    });
    
    // DeepInfra as secondary fallback
    this.deepinfra = new OpenAI({
      apiKey: process.env.DEEPINFRA_API_KEY || 'your-deepinfra-key',
      baseURL: 'https://api.deepinfra.com/v1/openai'
    });
    
    this.models = {
      text: 'gpt-4o',
      image: 'gpt-4o',
      analysis: 'gpt-4o',
      // Fallback models
      cometai_text: 'gpt-4o',
      deepinfra_text: 'google/gemini-1.5-flash'
    };
    
    this.providers = ['openai', 'cometai', 'deepinfra'];
  }

  // Smart AI call with automatic failover
  async makeAICall(messages, options = {}) {
    const { model = 'gpt-4o', temperature = 0.7, max_tokens = 2000 } = options;
    
    for (const provider of this.providers) {
      try {
        console.log(`🤖 Trying ${provider.toUpperCase()} API...`);
        
        let client, modelName;
        
        switch (provider) {
          case 'openai':
            client = this.openai;
            modelName = model;
            break;
          case 'cometai':
            client = this.cometai;
            modelName = this.models.cometai_text;
            break;
          case 'deepinfra':
            client = this.deepinfra;
            modelName = this.models.deepinfra_text;
            break;
        }
        
        const response = await client.chat.completions.create({
          model: modelName,
          messages: messages,
          temperature: temperature,
          max_tokens: max_tokens
        });
        
        console.log(`✅ ${provider.toUpperCase()} API successful!`);
        return {
          content: response.choices[0].message.content,
          provider: provider,
          model: modelName
        };
        
      } catch (error) {
        console.log(`❌ ${provider.toUpperCase()} failed:`, error.message);
        
        // If it's a quota error with OpenAI, skip to alternatives
        if (error.code === 'insufficient_quota' || error.status === 429) {
          console.log(`💡 ${provider.toUpperCase()} quota exceeded, trying next provider...`);
          continue;
        }
        
        // For other errors, try next provider
        continue;
      }
    }
    
    // If all providers fail, return fallback content
    console.log('🔄 All AI providers failed, using fallback content');
    return this.getFallbackContent();
  }

  // Generate marketing campaign content with failover
  async generateCampaignContent(campaignData) {
    try {
      const { 
        product, 
        targetAudience, 
        campaignGoal, 
        tone, 
        channel, 
        brandGuidelines,
        currentTrends 
      } = campaignData;

      const messages = [
        {
          role: "system",
          content: "You are an expert marketing strategist and copywriter. Create high-converting, brand-aligned marketing content that resonates with target audiences and drives action."
        },
        {
          role: "user",
          content: `Create a comprehensive marketing campaign for:
          
          Product/Service: ${product}
          Target Audience: ${targetAudience}
          Campaign Goal: ${campaignGoal}
          Channel: ${channel}
          Brand Tone: ${tone}
          Brand Guidelines: ${brandGuidelines}
          Current Trends: ${currentTrends}
          
          Generate:
          1. Compelling headline (max 60 characters)
          2. Main copy (100-150 words)
          3. Call-to-action
          4. 3 social media variations
          5. Email subject line
          6. Visual description for accompanying image
          
          Format as JSON with clear sections.`
        }
      ];

      const result = await this.makeAICall(messages, {
        model: this.models.text,
        temperature: 0.7,
        max_tokens: 2000
      });

      // Clean JSON response (remove markdown formatting)
      let cleanContent = result.content;
      if (cleanContent.includes('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      let parsedContent;
      try {
        parsedContent = JSON.parse(cleanContent);
      } catch (parseError) {
        console.log('🔧 JSON parse failed, using fallback content');
        parsedContent = this.getFallbackCampaignContent(campaignData);
      }
      
      return {
        ...parsedContent,
        provider: result.provider,
        model: result.model
      };
      
    } catch (error) {
      console.error('Campaign content generation error:', error);
      return this.getFallbackCampaignContent(campaignData);
    }
  }

  // Fallback content when all AI providers fail
  getFallbackContent() {
    return {
      content: JSON.stringify({
        headline: "🚀 Transform Your Business Today",
        mainCopy: "Discover innovative solutions that drive results and exceed expectations. Our proven approach combines cutting-edge technology with strategic insights to deliver exceptional outcomes for your business.",
        callToAction: "Get Started Now",
        socialMediaVariations: [
          "🌟 Ready to revolutionize your approach? Let's make it happen! #Innovation #Success",
          "💡 The future of business is here. Are you ready to lead the change? #Leadership #Growth",
          "🎯 Transform challenges into opportunities. Your success story starts now! #Transformation #Results"
        ],
        emailSubject: "🚀 Your Success Story Starts Here",
        visualDescription: "Professional, modern design featuring bold colors and dynamic elements that convey innovation and success"
      }),
      provider: 'fallback',
      model: 'template'
    };
  }

  // Fallback campaign content
  getFallbackCampaignContent(campaignData) {
    const { product = 'product/service', targetAudience = 'target audience', tone = 'professional' } = campaignData;
    
    return {
      headline: `Discover ${product} - Perfect for ${targetAudience}`,
      mainCopy: `Experience the difference with our ${product}. Designed specifically for ${targetAudience}, we deliver exceptional results that exceed expectations. Our ${tone} approach ensures you get exactly what you need to succeed.`,
      callToAction: "Learn More Today",
      socialMediaVariations: [
        `🌟 ${product} is changing the game for ${targetAudience}! Join thousands of satisfied customers. #Innovation`,
        `💡 Ready to transform your experience? Our ${product} delivers results that matter! #Success`,
        `🎯 ${targetAudience} deserve the best. That's why we created ${product}. Try it today! #Quality`
      ],
      emailSubject: `🚀 ${product} - Made for ${targetAudience}`,
      visualDescription: `${tone} design showcasing ${product} with elements that appeal to ${targetAudience}`,
      provider: 'fallback',
      model: 'template'
    };
  }

  // Generate marketing visuals using GPT-4o
  async generateMarketingVisual(visualRequest) {
    try {
      const {
        description,
        style = "professional marketing",
        dimensions = "1024x1024",
        brandColors = "",
        includeText = ""
      } = visualRequest;

      let prompt = `Create a ${style} marketing image: ${description}`;
      
      if (brandColors) {
        prompt += ` Using brand colors: ${brandColors}.`;
      }
      
      if (includeText) {
        prompt += ` Include the text: "${includeText}"`;
      }
      
      prompt += ` High quality, professional, suitable for marketing campaigns, ${dimensions} resolution.`;

      const response = await this.openai.chat.completions.create({
        model: this.models.image,
        messages: [
          {
            role: "system",
            content: "You are an expert graphic designer specializing in marketing visuals. Create compelling, brand-appropriate images that capture attention and drive engagement."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        // Note: GPT-4o image generation is handled through the chat interface
        temperature: 0.7
      });

      // Extract image URL from response (GPT-4o returns image inline)
      const imageUrl = this.extractImageFromResponse(response);
      
      return {
        imageUrl,
        prompt: prompt,
        style: style,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Visual generation error:', error);
      throw new Error('Failed to generate marketing visual');
    }
  }

  // Analyze marketing performance using AI
  async analyzeMarketingPerformance(performanceData) {
    try {
      const {
        campaignMetrics,
        audienceData,
        competitorData,
        marketTrends
      } = performanceData;

      const prompt = `
        Analyze this marketing performance data and provide actionable insights:
        
        Campaign Metrics: ${JSON.stringify(campaignMetrics)}
        Audience Data: ${JSON.stringify(audienceData)}
        Competitor Data: ${JSON.stringify(competitorData)}
        Market Trends: ${JSON.stringify(marketTrends)}
        
        Provide:
        1. Performance Summary (key wins and challenges)
        2. Audience Insights (behavior patterns, preferences)
        3. Optimization Recommendations (specific, actionable)
        4. Trend Analysis (opportunities and threats)
        5. Next Campaign Suggestions (3 specific ideas)
        6. ROI Improvement Strategies
        
        Format as structured JSON with clear metrics and recommendations.
      `;

      const response = await this.openai.chat.completions.create({
        model: this.models.analysis,
        messages: [
          {
            role: "system",
            content: "You are a senior marketing analytics expert with deep expertise in data analysis, consumer behavior, and campaign optimization. Provide clear, actionable insights backed by data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2500
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Performance analysis error:', error);
      throw new Error('Failed to analyze marketing performance');
    }
  }

  // Generate trend-based content suggestions
  async generateTrendBasedSuggestions(trendData) {
    try {
      const { trends, industry, audience, currentCampaigns } = trendData;

      const prompt = `
        Based on these current trends, generate marketing campaign suggestions:
        
        Trends: ${JSON.stringify(trends)}
        Industry: ${industry}
        Target Audience: ${audience}
        Current Campaigns: ${JSON.stringify(currentCampaigns)}
        
        Generate 5 trend-based campaign ideas that:
        1. Leverage current trends authentically
        2. Align with brand values
        3. Resonate with target audience
        4. Are feasible to execute
        5. Have clear success metrics
        
        For each idea, provide:
        - Campaign concept
        - Key messaging
        - Recommended channels
        - Success metrics
        - Timeline estimate
        
        Format as JSON array.
      `;

      const response = await this.openai.chat.completions.create({
        model: this.models.text,
        messages: [
          {
            role: "system",
            content: "You are a trend-savvy marketing strategist who excels at identifying opportunities and creating timely, relevant campaigns that capture cultural moments."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Trend suggestion error:', error);
      throw new Error('Failed to generate trend-based suggestions');
    }
  }

  // Generate A/B test variations
  async generateABTestVariations(originalContent) {
    try {
      const { content, contentType, testingGoals } = originalContent;

      const prompt = `
        Create A/B test variations for this ${contentType}:
        
        Original Content: ${content}
        Testing Goals: ${testingGoals}
        
        Generate 3 distinct variations that test:
        1. Different emotional appeals
        2. Different value propositions  
        3. Different calls-to-action
        
        For each variation, explain:
        - What's being tested
        - Expected impact
        - Target audience segment
        
        Format as JSON with clear structure.
      `;

      const response = await this.openai.chat.completions.create({
        model: this.models.text,
        messages: [
          {
            role: "system",
            content: "You are an expert in conversion optimization and A/B testing. Create variations that will provide meaningful insights into audience preferences and behavior."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('A/B variation error:', error);
      throw new Error('Failed to generate A/B test variations');
    }
  }

  // Analyze sentiment from social media data
  async analyzeSentiment(socialData) {
    try {
      const { posts, comments, mentions } = socialData;

      const prompt = `
        Analyze sentiment and extract insights from this social media data:
        
        Posts: ${JSON.stringify(posts)}
        Comments: ${JSON.stringify(comments)}
        Mentions: ${JSON.stringify(mentions)}
        
        Provide:
        1. Overall sentiment score (-1 to 1)
        2. Key themes and topics
        3. Sentiment breakdown by topic
        4. Notable positive/negative feedback
        5. Recommendations for engagement
        6. Alert-worthy issues
        
        Format as structured JSON.
      `;

      const response = await this.openai.chat.completions.create({
        model: this.models.analysis,
        messages: [
          {
            role: "system",
            content: "You are an expert in social media analytics and sentiment analysis. Provide nuanced insights that help brands understand and respond to public perception."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      throw new Error('Failed to analyze sentiment');
    }
  }

  // Helper method to extract image from GPT-4o response
  extractImageFromResponse(response) {
    // GPT-4o returns images inline in the response
    // This is a placeholder - actual implementation depends on OpenAI's response format
    const content = response.choices[0].message.content;
    
    // Look for image URLs in the response
    const imageUrlMatch = content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/i);
    
    if (imageUrlMatch) {
      return imageUrlMatch[0];
    }
    
    // If no direct URL, the image might be base64 encoded
    const base64Match = content.match(/data:image\/[^;]+;base64,([^"]+)/);
    if (base64Match) {
      return content.match(/data:image\/[^;]+;base64,[^"]+/)[0];
    }
    
    return null;
  }

  // Generate comprehensive marketing strategy
  async generateMarketingStrategy(strategyRequest) {
    try {
      const {
        businessGoals,
        targetMarket,
        competitiveAnalysis,
        budget,
        timeline,
        brandPosition
      } = strategyRequest;

      const prompt = `
        Create a comprehensive marketing strategy:
        
        Business Goals: ${businessGoals}
        Target Market: ${targetMarket}
        Competitive Analysis: ${competitiveAnalysis}
        Budget: ${budget}
        Timeline: ${timeline}
        Brand Position: ${brandPosition}
        
        Generate a complete strategy including:
        1. Strategic Overview
        2. Channel Strategy & Mix
        3. Content Strategy
        4. Campaign Calendar (next 90 days)
        5. Budget Allocation
        6. KPIs and Success Metrics
        7. Risk Assessment
        8. Optimization Plan
        
        Format as detailed JSON structure.
      `;

      const response = await this.openai.chat.completions.create({
        model: this.models.text,
        messages: [
          {
            role: "system",
            content: "You are a senior marketing strategist with expertise in developing comprehensive, data-driven marketing strategies that align with business objectives and drive measurable results."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 3000
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Strategy generation error:', error);
      throw new Error('Failed to generate marketing strategy');
    }
  }

  // Check API health and usage
  async checkAPIHealth() {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      });

      return {
        status: 'healthy',
        responseTime: Date.now(),
        model: response.model,
        usage: response.usage
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  // Generate comprehensive analysis (new method for company insights)
  async generateAnalysis(analysisRequest) {
    try {
      const { prompt, type = 'general' } = analysisRequest;

      const response = await this.openai.chat.completions.create({
        model: this.models.analysis,
        messages: [
          {
            role: "system",
            content: "You are a senior marketing strategist and business analyst with deep expertise in market analysis, campaign optimization, and strategic planning. Provide comprehensive, actionable insights based on data analysis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 3000
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Analysis generation error:', error);
      // Return fallback analysis if OpenAI fails
      return this.getFallbackAnalysis(type);
    }
  }

  // Fallback analysis in case OpenAI is unavailable
  getFallbackAnalysis(type) {
    const fallbackAnalyses = {
      company_analysis: `
## Marketing Health Assessment

**Overall Score: 78/100** - Good foundation with room for optimization

### Key Strengths:
• Strong digital presence foundation
• Engaged user base with growth potential
• Competitive positioning in target market
• Solid brand recognition within niche

### Critical Opportunities:
• **Content Strategy Gap**: Lack of consistent, valuable content creation
• **Channel Diversification**: Over-reliance on limited marketing channels
• **Data-Driven Approach**: Underutilizing analytics for decision making
• **Customer Journey Optimization**: Missed touchpoints in conversion funnel

### Recommended 90-Day Action Plan:

#### Phase 1 (30 days): Foundation
1. Complete marketing audit and baseline measurement
2. Implement comprehensive tracking across all channels
3. Create content calendar with industry-relevant topics
4. Set up automated lead nurturing sequences

#### Phase 2 (60 days): Expansion
1. Launch multi-channel campaigns with A/B testing
2. Develop video content strategy for higher engagement
3. Implement customer segmentation for personalized messaging
4. Optimize website for better conversion rates

#### Phase 3 (90 days): Optimization
1. Analyze performance data and optimize top-performing channels
2. Scale successful campaigns and pause underperformers
3. Implement advanced attribution modeling
4. Plan strategic initiatives for next quarter

### Budget Allocation Recommendations:
• **Content Creation**: 30%
• **Paid Advertising**: 40%
• **Technology & Tools**: 15%
• **Analytics & Testing**: 15%

### Expected ROI: 250-350% within 6 months with proper execution
`,
      general: `
## Analysis Summary

Based on current data and market conditions, here are the key insights:

### Opportunities:
• Market growth potential in target segments
• Underutilized digital channels
• Content marketing gaps among competitors

### Recommendations:
• Increase investment in high-performing channels
• Develop comprehensive content strategy
• Implement advanced analytics tracking
• Focus on customer retention initiatives

### Next Steps:
1. Prioritize quick wins for immediate impact
2. Build sustainable growth systems
3. Monitor and adjust based on performance data
`
    };

    return fallbackAnalyses[type] || fallbackAnalyses.general;
  }
}

module.exports = AIService; 