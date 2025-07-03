const OpenAI = require('openai');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.models = {
      text: 'gpt-4o',
      image: 'gpt-4o', // Using GPT-4o for image generation
      analysis: 'gpt-4o'
    };
  }

  // Generate marketing campaign content
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

      const prompt = `
        Create a comprehensive marketing campaign for:
        
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
        
        Format as JSON with clear sections.
      `;

      const response = await this.openai.chat.completions.create({
        model: this.models.text,
        messages: [
          {
            role: "system",
            content: "You are an expert marketing strategist and copywriter. Create high-converting, brand-aligned marketing content that resonates with target audiences and drives action."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Campaign content generation error:', error);
      throw new Error('Failed to generate campaign content');
    }
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
}

module.exports = AIService; 