const axios = require('axios');
const { TwitterApi } = require('twitter-api-v2');

class SocialMediaService {
  constructor() {
    // Initialize Twitter client
    this.twitter = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
    
    // API configurations
    this.apis = {
      twitter: {
        baseUrl: 'https://api.twitter.com/2',
        bearerToken: process.env.TWITTER_BEARER_TOKEN
      },
      linkedin: {
        baseUrl: 'https://api.linkedin.com/v2',
        accessToken: process.env.LINKEDIN_ACCESS_TOKEN
      },
      facebook: {
        baseUrl: 'https://graph.facebook.com/v18.0',
        accessToken: process.env.FACEBOOK_ACCESS_TOKEN
      },
      instagram: {
        baseUrl: 'https://graph.instagram.com',
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN
      }
    };
  }

  // Monitor brand mentions across platforms
  async monitorBrandMentions(brandKeywords, timeframe = '24h') {
    try {
      const mentions = await Promise.allSettled([
        this.getTwitterMentions(brandKeywords, timeframe),
        this.getLinkedInMentions(brandKeywords, timeframe),
        this.getFacebookMentions(brandKeywords, timeframe),
        this.getInstagramMentions(brandKeywords, timeframe)
      ]);

      return {
        twitter: mentions[0].status === 'fulfilled' ? mentions[0].value : [],
        linkedin: mentions[1].status === 'fulfilled' ? mentions[1].value : [],
        facebook: mentions[2].status === 'fulfilled' ? mentions[2].value : [],
        instagram: mentions[3].status === 'fulfilled' ? mentions[3].value : [],
        summary: this.aggregateMentionsSummary(mentions),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Brand monitoring error:', error);
      throw new Error('Failed to monitor brand mentions');
    }
  }

  // Get Twitter mentions
  async getTwitterMentions(keywords, timeframe) {
    try {
      const query = keywords.map(keyword => `"${keyword}"`).join(' OR ');
      
      const response = await axios.get(`${this.apis.twitter.baseUrl}/tweets/search/recent`, {
        headers: {
          'Authorization': `Bearer ${this.apis.twitter.bearerToken}`
        },
        params: {
          query: query,
          max_results: 100,
          'tweet.fields': 'created_at,public_metrics,context_annotations,author_id',
          'user.fields': 'name,username,verified',
          expansions: 'author_id'
        }
      });

      return response.data.data?.map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        author: response.data.includes?.users?.find(user => user.id === tweet.author_id),
        metrics: tweet.public_metrics,
        platform: 'twitter',
        sentiment: null
      })) || [];
    } catch (error) {
      console.error('Twitter mentions error:', error);
      return [];
    }
  }

  // Get LinkedIn mentions (simplified)
  async getLinkedInMentions(keywords, timeframe) {
    try {
      // LinkedIn API implementation would go here
      return [];
    } catch (error) {
      console.error('LinkedIn mentions error:', error);
      return [];
    }
  }

  // Get Facebook mentions
  async getFacebookMentions(keywords, timeframe) {
    try {
      const response = await axios.get(
        `${this.apis.facebook.baseUrl}/${process.env.FACEBOOK_PAGE_ID}/posts`,
        {
          params: {
            access_token: this.apis.facebook.accessToken,
            fields: 'id,message,created_time,likes.summary(true),comments.summary(true),shares'
          }
        }
      );

      return response.data.data?.map(post => ({
        id: post.id,
        text: post.message || '',
        created_at: post.created_time,
        metrics: {
          likes: post.likes?.summary?.total_count || 0,
          comments: post.comments?.summary?.total_count || 0,
          shares: post.shares?.count || 0
        },
        platform: 'facebook'
      })) || [];
    } catch (error) {
      console.error('Facebook mentions error:', error);
      return [];
    }
  }

  // Get Instagram mentions
  async getInstagramMentions(keywords, timeframe) {
    try {
      const response = await axios.get(
        `${this.apis.instagram.baseUrl}/me/media`,
        {
          params: {
            access_token: this.apis.instagram.accessToken,
            fields: 'id,caption,timestamp,like_count,comments_count,media_type,media_url'
          }
        }
      );

      return response.data.data?.map(post => ({
        id: post.id,
        text: post.caption || '',
        created_at: post.timestamp,
        metrics: {
          likes: post.like_count || 0,
          comments: post.comments_count || 0,
          shares: 0
        },
        platform: 'instagram',
        media_url: post.media_url,
        media_type: post.media_type
      })) || [];
    } catch (error) {
      console.error('Instagram mentions error:', error);
      return [];
    }
  }

  // Get trending topics
  async getTrendingTopics(location = 'global') {
    try {
      const twitterTrends = await this.getTwitterTrends(location);
      
      return {
        twitter: twitterTrends,
        linkedin: [], // Would implement LinkedIn trends
        combined: twitterTrends,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Trending topics error:', error);
      throw new Error('Failed to get trending topics');
    }
  }

  // Get Twitter trends
  async getTwitterTrends(location) {
    try {
      const response = await axios.get(`${this.apis.twitter.baseUrl}/trends/by/woeid/1`, {
        headers: {
          'Authorization': `Bearer ${this.apis.twitter.bearerToken}`
        }
      });

      return response.data.data?.map(trend => ({
        name: trend.trend,
        volume: trend.tweet_volume,
        platform: 'twitter'
      })) || [];
    } catch (error) {
      console.error('Twitter trends error:', error);
      return [];
    }
  }

  // Post to multiple platforms
  async postToMultiplePlatforms(content, platforms = ['twitter', 'linkedin', 'facebook']) {
    try {
      const results = {};

      if (platforms.includes('twitter') && content.twitter) {
        results.twitter = await this.postToTwitter(content.twitter);
      }

      if (platforms.includes('linkedin') && content.linkedin) {
        results.linkedin = await this.postToLinkedIn(content.linkedin);
      }

      if (platforms.includes('facebook') && content.facebook) {
        results.facebook = await this.postToFacebook(content.facebook);
      }

      return {
        success: true,
        results,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Multi-platform posting error:', error);
      throw new Error('Failed to post to multiple platforms');
    }
  }

  // Post to Twitter
  async postToTwitter(content) {
    try {
      const response = await axios.post(
        `${this.apis.twitter.baseUrl}/tweets`,
        { text: content.text },
        {
          headers: {
            'Authorization': `Bearer ${this.apis.twitter.bearerToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        postId: response.data.data.id,
        platform: 'twitter'
      };
    } catch (error) {
      console.error('Twitter posting error:', error);
      return { success: false, error: error.message, platform: 'twitter' };
    }
  }

  // Post to LinkedIn
  async postToLinkedIn(content) {
    try {
      const postData = {
        author: `urn:li:person:${process.env.LINKEDIN_PERSON_ID}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content.text
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      const response = await axios.post(
        `${this.apis.linkedin.baseUrl}/ugcPosts`,
        postData,
        {
          headers: {
            'Authorization': `Bearer ${this.apis.linkedin.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        postId: response.data.id,
        platform: 'linkedin'
      };
    } catch (error) {
      console.error('LinkedIn posting error:', error);
      return { success: false, error: error.message, platform: 'linkedin' };
    }
  }

  // Post to Facebook
  async postToFacebook(content) {
    try {
      const response = await axios.post(
        `${this.apis.facebook.baseUrl}/${process.env.FACEBOOK_PAGE_ID}/feed`,
        {
          message: content.text,
          access_token: this.apis.facebook.accessToken
        }
      );

      return {
        success: true,
        postId: response.data.id,
        platform: 'facebook'
      };
    } catch (error) {
      console.error('Facebook posting error:', error);
      return { success: false, error: error.message, platform: 'facebook' };
    }
  }

  // Helper methods
  aggregateMentionsSummary(mentions) {
    const totalMentions = mentions.reduce((sum, mention) => {
      return sum + (mention.status === 'fulfilled' ? mention.value.length : 0);
    }, 0);

    return {
      totalMentions,
      byPlatform: {
        twitter: mentions[0].status === 'fulfilled' ? mentions[0].value.length : 0,
        linkedin: mentions[1].status === 'fulfilled' ? mentions[1].value.length : 0,
        facebook: mentions[2].status === 'fulfilled' ? mentions[2].value.length : 0,
        instagram: mentions[3].status === 'fulfilled' ? mentions[3].value.length : 0
      }
    };
  }

  // Get audience analytics
  async getAudienceAnalytics(timeframe = '30d') {
    try {
      return {
        twitter: { followers: 1000, engagement: 500 },
        linkedin: { followers: 2000, engagement: 300 },
        facebook: { followers: 1500, engagement: 400 },
        instagram: { followers: 3000, engagement: 600 },
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Audience analytics error:', error);
      throw new Error('Failed to get audience analytics');
    }
  }
}

module.exports = SocialMediaService; 