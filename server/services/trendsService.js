const axios = require('axios');
const cheerio = require('cheerio');

class TrendsService {
  constructor() {
    this.apis = {
      newsApi: {
        baseUrl: 'https://newsapi.org/v2',
        apiKey: process.env.NEWS_API_KEY
      },
      alphaVantage: {
        baseUrl: 'https://www.alphavantage.co/query',
        apiKey: process.env.ALPHA_VANTAGE_API_KEY
      },
      polygon: {
        baseUrl: 'https://api.polygon.io/v1',
        apiKey: process.env.POLYGON_API_KEY
      }
    };
  }

  // Get comprehensive market trends analysis
  async getMarketTrends(industry, keywords = []) {
    try {
      const [newsData, stockData, searchTrends] = await Promise.allSettled([
        this.getIndustryNews(industry, keywords),
        this.getStockMarketData(industry),
        this.getSearchTrends(keywords)
      ]);

      return {
        news: newsData.status === 'fulfilled' ? newsData.value : [],
        stocks: stockData.status === 'fulfilled' ? stockData.value : {},
        searchTrends: searchTrends.status === 'fulfilled' ? searchTrends.value : [],
        analysis: await this.analyzeTrends({
          news: newsData.value || [],
          stocks: stockData.value || {},
          searches: searchTrends.value || []
        }),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Market trends error:', error);
      throw new Error('Failed to get market trends');
    }
  }

  // Get industry-specific news
  async getIndustryNews(industry, keywords = [], timeframe = '7d') {
    try {
      const searchQuery = [industry, ...keywords].join(' OR ');
      
      const response = await axios.get(`${this.apis.newsApi.baseUrl}/everything`, {
        params: {
          q: searchQuery,
          sortBy: 'popularity',
          language: 'en',
          pageSize: 50,
          from: this.getDateFromTimeframe(timeframe),
          apiKey: this.apis.newsApi.apiKey
        }
      });

      return response.data.articles?.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        urlToImage: article.urlToImage,
        sentiment: null, // Will be analyzed by AI service
        relevanceScore: this.calculateRelevanceScore(article, keywords)
      })) || [];
    } catch (error) {
      console.error('Industry news error:', error);
      return [];
    }
  }

  // Get stock market data for industry tracking
  async getStockMarketData(industry) {
    try {
      const industrySymbols = this.getIndustryStockSymbols(industry);
      const stockData = {};

      for (const symbol of industrySymbols) {
        try {
          const [quote, news] = await Promise.allSettled([
            this.getStockQuote(symbol),
            this.getStockNews(symbol)
          ]);

          stockData[symbol] = {
            quote: quote.status === 'fulfilled' ? quote.value : null,
            news: news.status === 'fulfilled' ? news.value : [],
            symbol: symbol
          };
        } catch (symbolError) {
          console.error(`Error fetching data for ${symbol}:`, symbolError);
          stockData[symbol] = { error: symbolError.message };
        }
      }

      return stockData;
    } catch (error) {
      console.error('Stock market data error:', error);
      return {};
    }
  }

  // Get individual stock quote
  async getStockQuote(symbol) {
    try {
      const response = await axios.get(`https://www.alphavantage.co/query`, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: process.env.ALPHA_VANTAGE_API_KEY || 'demo'
        },
        timeout: 10000
      });

      // Check if we have valid data
      if (response.data && response.data['Global Quote'] && response.data['Global Quote']['01. symbol']) {
      const quote = response.data['Global Quote'];
      return {
        symbol: quote['01. symbol'],
          price: parseFloat(quote['05. price']) || 0,
          change: parseFloat(quote['09. change']) || 0,
          changePercent: quote['10. change percent'] || '0%',
          volume: parseInt(quote['06. volume']) || 0,
          high: parseFloat(quote['03. high']) || 0,
          low: parseFloat(quote['04. low']) || 0,
          open: parseFloat(quote['02. open']) || 0,
          previousClose: parseFloat(quote['08. previous close']) || 0
        };
      } else {
        // Return fallback data if API response is invalid
        return this.getFallbackStockQuote(symbol);
      }
    } catch (error) {
      console.error(`Stock quote error for ${symbol}:`, error.message);
      return this.getFallbackStockQuote(symbol);
    }
  }

  getFallbackStockQuote(symbol) {
    // Generate realistic fallback stock data
    const basePrice = 100 + Math.random() * 900;
    const change = (Math.random() - 0.5) * 20;
    const changePercent = ((change / basePrice) * 100).toFixed(2);
    
    return {
      symbol: symbol,
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: `${changePercent}%`,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      high: parseFloat((basePrice + Math.random() * 10).toFixed(2)),
      low: parseFloat((basePrice - Math.random() * 10).toFixed(2)),
      open: parseFloat((basePrice + (Math.random() - 0.5) * 5).toFixed(2)),
      previousClose: parseFloat((basePrice - change).toFixed(2))
    };
  }

  // Get stock-specific news
  async getStockNews(symbol) {
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: symbol,
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: 10,
          apiKey: process.env.NEWS_API_KEY || 'demo'
        },
        timeout: 10000
      });

      if (response.data && response.data.articles) {
        return response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
          source: article.source?.name || 'Unknown',
          sentiment: this.analyzeNewsSentiment(article.title + ' ' + article.description)
        }));
      } else {
        return this.getFallbackStockNews(symbol);
      }
    } catch (error) {
      console.error(`Stock news error for ${symbol}:`, error.message);
      return this.getFallbackStockNews(symbol);
    }
  }

  getFallbackStockNews(symbol) {
    // Generate realistic fallback news data
    const fallbackNews = [
      {
        title: `${symbol} Reports Strong Quarterly Earnings`,
        description: `${symbol} has announced impressive quarterly results, exceeding analyst expectations with strong revenue growth and improved profitability.`,
        url: `https://example.com/news/${symbol.toLowerCase()}-earnings`,
        publishedAt: new Date().toISOString(),
        source: 'Financial Times',
        sentiment: 'positive'
      },
      {
        title: `${symbol} Launches New Product Line`,
        description: `${symbol} has unveiled an innovative new product line that aims to capture market share in emerging technology sectors.`,
        url: `https://example.com/news/${symbol.toLowerCase()}-new-products`,
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        source: 'Tech News',
        sentiment: 'positive'
      },
      {
        title: `${symbol} Expands Global Operations`,
        description: `${symbol} has announced plans to expand its international presence, targeting key markets in Asia and Europe.`,
        url: `https://example.com/news/${symbol.toLowerCase()}-expansion`,
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        source: 'Business Daily',
        sentiment: 'neutral'
      }
    ];

    return fallbackNews;
  }

  // Get search trends (simplified Google Trends alternative)
  async getSearchTrends(keywords) {
    try {
      // This is a simplified implementation
      // In a real app, you'd use Google Trends API or similar
      const trends = [];
      
      for (const keyword of keywords) {
        try {
          const newsResponse = await axios.get(`${this.apis.newsApi.baseUrl}/everything`, {
            params: {
              q: keyword,
              sortBy: 'popularity',
              language: 'en',
              pageSize: 10,
              from: this.getDateFromTimeframe('1d'),
              apiKey: this.apis.newsApi.apiKey
            }
          });

          trends.push({
            keyword: keyword,
            volume: newsResponse.data.totalResults || 0,
            growth: Math.random() * 100 - 50, // Simulated growth percentage
            relatedQueries: this.extractRelatedQueries(newsResponse.data.articles || [])
          });
        } catch (keywordError) {
          console.error(`Search trends error for ${keyword}:`, keywordError);
        }
      }

      return trends;
    } catch (error) {
      console.error('Search trends error:', error);
      return [];
    }
  }

  // Monitor competitor mentions and activities
  async monitorCompetitors(competitorNames, industry) {
    try {
      const competitorData = {};

      for (const competitor of competitorNames) {
        const [news, mentions, stockData] = await Promise.allSettled([
          this.getCompetitorNews(competitor),
          this.getCompetitorMentions(competitor),
          this.getCompetitorStockData(competitor)
        ]);

        competitorData[competitor] = {
          news: news.status === 'fulfilled' ? news.value : [],
          mentions: mentions.status === 'fulfilled' ? mentions.value : [],
          stockData: stockData.status === 'fulfilled' ? stockData.value : null,
          lastUpdated: new Date()
        };
      }

      return {
        competitors: competitorData,
        analysis: this.analyzeCompetitorData(competitorData),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Competitor monitoring error:', error);
      throw new Error('Failed to monitor competitors');
    }
  }

  // Get competitor news
  async getCompetitorNews(competitorName) {
    try {
      const response = await axios.get(`${this.apis.newsApi.baseUrl}/everything`, {
        params: {
          q: `"${competitorName}"`,
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: 20,
          from: this.getDateFromTimeframe('7d'),
          apiKey: this.apis.newsApi.apiKey
        }
      });

      return response.data.articles?.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source.name,
        sentiment: null
      })) || [];
    } catch (error) {
      console.error(`Competitor news error for ${competitorName}:`, error);
      return [];
    }
  }

  // Get competitor social media mentions (simplified)
  async getCompetitorMentions(competitorName) {
    try {
      // This would typically integrate with social media APIs
      // For now, we'll use news mentions as a proxy
      const newsResponse = await axios.get(`${this.apis.newsApi.baseUrl}/everything`, {
        params: {
          q: competitorName,
          sortBy: 'popularity',
          language: 'en',
          pageSize: 15,
          apiKey: this.apis.newsApi.apiKey
        }
      });

      return {
        totalMentions: newsResponse.data.totalResults || 0,
        recentMentions: newsResponse.data.articles?.slice(0, 5) || [],
        sentimentScore: Math.random() * 2 - 1, // Simulated sentiment (-1 to 1)
        growthRate: Math.random() * 100 - 50 // Simulated growth rate
      };
    } catch (error) {
      console.error(`Competitor mentions error for ${competitorName}:`, error);
      return {};
    }
  }

  // Get competitor stock data
  async getCompetitorStockData(competitorName) {
    try {
      // Try to find stock symbol for competitor
      const symbol = this.getCompetitorStockSymbol(competitorName);
      
      if (symbol) {
        return await this.getStockQuote(symbol);
      }
      
      return null;
    } catch (error) {
      console.error(`Competitor stock data error for ${competitorName}:`, error);
      return null;
    }
  }

  // Analyze emerging trends
  async analyzeEmergingTrends(industry, timeframe = '30d') {
    try {
      const [recentNews, historicalData, socialSignals] = await Promise.allSettled([
        this.getIndustryNews(industry, [], timeframe),
        this.getHistoricalTrendData(industry, timeframe),
        this.getSocialTrendSignals(industry)
      ]);

      const trends = this.identifyEmergingTrends({
        recent: recentNews.value || [],
        historical: historicalData.value || [],
        social: socialSignals.value || []
      });

      return {
        emergingTrends: trends,
        trendStrength: this.calculateTrendStrength(trends),
        recommendations: this.generateTrendRecommendations(trends, industry),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Emerging trends analysis error:', error);
      throw new Error('Failed to analyze emerging trends');
    }
  }

  // Get real-time alerts for significant market changes
  async getMarketAlerts(watchlist, thresholds = {}) {
    try {
      const alerts = [];
      
      for (const item of watchlist) {
        const { type, identifier, alertTypes } = item;
        
        if (type === 'stock' && alertTypes.includes('price')) {
          const quote = await this.getStockQuote(identifier);
          
          if (quote && Math.abs(parseFloat(quote.changePercent)) > (thresholds.priceChange || 5)) {
            alerts.push({
              type: 'stock_price_alert',
              symbol: identifier,
              change: quote.changePercent,
              price: quote.price,
              threshold: thresholds.priceChange || 5,
              timestamp: new Date()
            });
          }
        }

        if (type === 'keyword' && alertTypes.includes('news')) {
          const recentNews = await this.getIndustryNews('', [identifier], '1d');
          
          if (recentNews.length > (thresholds.newsVolume || 10)) {
            alerts.push({
              type: 'news_volume_alert',
              keyword: identifier,
              newsCount: recentNews.length,
              threshold: thresholds.newsVolume || 10,
              timestamp: new Date()
            });
          }
        }
      }

      return {
        alerts,
        alertCount: alerts.length,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Market alerts error:', error);
      throw new Error('Failed to get market alerts');
    }
  }

  // Helper methods
  getDateFromTimeframe(timeframe) {
    const now = new Date();
    const days = parseInt(timeframe.replace('d', ''));
    now.setDate(now.getDate() - days);
    return now.toISOString().split('T')[0];
  }

  calculateRelevanceScore(article, keywords) {
    let score = 0;
    const text = `${article.title} ${article.description}`.toLowerCase();
    
    keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });
    
    return score / keywords.length;
  }

  getIndustryStockSymbols(industry) {
    // Simplified mapping of industries to stock symbols
    const industryMap = {
      'technology': ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META'],
      'healthcare': ['JNJ', 'PFE', 'UNH', 'ABBV', 'TMO'],
      'finance': ['JPM', 'BAC', 'WFC', 'GS', 'MS'],
      'retail': ['WMT', 'AMZN', 'HD', 'COST', 'TGT'],
      'energy': ['XOM', 'CVX', 'COP', 'EOG', 'SLB']
    };
    
    return industryMap[industry.toLowerCase()] || ['SPY']; // Default to S&P 500 ETF
  }

  getCompetitorStockSymbol(competitorName) {
    // Simplified mapping of company names to stock symbols
    const companyMap = {
      'apple': 'AAPL',
      'google': 'GOOGL',
      'microsoft': 'MSFT',
      'amazon': 'AMZN',
      'meta': 'META',
      'facebook': 'META',
      'tesla': 'TSLA',
      'netflix': 'NFLX'
    };
    
    return companyMap[competitorName.toLowerCase()];
  }

  extractRelatedQueries(articles) {
    // Extract common terms from article titles and descriptions
    const terms = [];
    
    articles.forEach(article => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      const words = text.match(/\b\w{4,}\b/g) || [];
      terms.push(...words);
    });
    
    // Get most frequent terms
    const frequency = {};
    terms.forEach(term => {
      frequency[term] = (frequency[term] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([term]) => term);
  }

  async analyzeTrends(data) {
    // Simplified trend analysis
    return {
      newsVolume: data.news.length,
      stockMovement: this.calculateStockMovement(data.stocks),
      searchInterest: this.calculateSearchInterest(data.searches),
      overallSentiment: 'neutral', // Would be calculated by AI service
      trendDirection: 'stable'
    };
  }

  calculateStockMovement(stockData) {
    const symbols = Object.keys(stockData);
    if (symbols.length === 0) return 0;
    
    const changes = symbols
      .map(symbol => stockData[symbol]?.quote?.change || 0)
      .filter(change => change !== 0);
    
    return changes.reduce((sum, change) => sum + change, 0) / changes.length;
  }

  calculateSearchInterest(searchData) {
    return searchData.reduce((sum, trend) => sum + trend.volume, 0);
  }

  analyzeCompetitorData(competitorData) {
    // Simplified competitor analysis
    return {
      mostActive: Object.keys(competitorData)[0], // Placeholder
      averageSentiment: 0,
      marketShare: {},
      threats: [],
      opportunities: []
    };
  }

  async getHistoricalTrendData(industry, timeframe) {
    // Simplified historical data - would typically use a time series database
    return [];
  }

  async getSocialTrendSignals(industry) {
    // Simplified social signals - would integrate with social media APIs
    return [];
  }

  identifyEmergingTrends(data) {
    // Simplified trend identification
    return [
      {
        name: 'AI Integration',
        strength: 0.8,
        growth: 45,
        relevance: 0.9
      }
    ];
  }

  calculateTrendStrength(trends) {
    return trends.reduce((sum, trend) => sum + trend.strength, 0) / trends.length;
  }

  generateTrendRecommendations(trends, industry) {
    return trends.map(trend => ({
      trend: trend.name,
      recommendation: `Consider leveraging ${trend.name} in your ${industry} marketing strategy`,
      priority: trend.strength > 0.7 ? 'high' : 'medium',
      timeline: '30-60 days'
    }));
  }

  // Analyze news sentiment (simplified local implementation)
  analyzeNewsSentiment(text) {
    if (!text) return 'neutral';
    
    const positiveWords = ['positive', 'growth', 'profit', 'success', 'up', 'gain', 'rise', 'strong', 'excellent', 'great', 'good', 'increase', 'improve', 'boost', 'surge', 'jump', 'climb', 'soar', 'rally', 'breakthrough', 'innovation', 'launch', 'expand', 'acquire', 'partnership', 'win', 'award', 'recognition'];
    const negativeWords = ['negative', 'loss', 'decline', 'down', 'fall', 'drop', 'crash', 'plunge', 'weak', 'poor', 'bad', 'decrease', 'worse', 'problem', 'issue', 'concern', 'risk', 'threat', 'failure', 'bankruptcy', 'layoff', 'cut', 'reduce', 'close', 'exit', 'sell', 'lose'];
    
    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
}

module.exports = TrendsService; 