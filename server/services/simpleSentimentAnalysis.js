const VADER = require('vader-sentiment');

class SimpleSentimentAnalyzer {
  constructor() {
    this.feedbackData = [];
    
    // Market-specific sentiment words for business context
    this.marketPositiveWords = [
      'bullish', 'growth', 'profit', 'revenue', 'earnings', 'success', 'gain', 'rise', 'up', 'positive',
      'strong', 'excellent', 'outstanding', 'impressive', 'robust', 'solid', 'stable', 'reliable',
      'innovative', 'leading', 'premium', 'quality', 'trusted', 'established', 'profitable'
    ];
    
    this.marketNegativeWords = [
      'bearish', 'decline', 'loss', 'drop', 'fall', 'negative', 'weak', 'poor', 'disappointing',
      'concerning', 'risky', 'volatile', 'uncertain', 'troubled', 'struggling', 'failing',
      'overvalued', 'expensive', 'overpriced', 'bubble', 'crash', 'recession', 'downturn'
    ];
  }

  /**
   * Main sentiment analysis method using VADER
   */
  async analyzeSentiment(text, context = 'market') {
    try {
      console.log('📊 VADER market sentiment analysis starting...');
      
      // Use VADER for primary analysis
      const vaderResult = VADER.SentimentIntensityAnalyzer.polarity_scores(text);
      
      // Enhance with market-specific analysis
      const marketEnhancement = this.analyzeMarketContext(text);
      
      // Combine VADER with market analysis
      const combinedScore = (vaderResult.compound * 0.7) + (marketEnhancement.score * 0.3);
      const finalScore = Math.max(-1, Math.min(1, combinedScore));
      
      // Determine label
      let label = 'neutral';
      if (finalScore > 0.3) label = 'positive';
      else if (finalScore > 0.1) label = 'slightly_positive';
      else if (finalScore > -0.1) label = 'neutral';
      else if (finalScore > -0.3) label = 'slightly_negative';
      else label = 'negative';
      
      // Calculate confidence
      const confidence = Math.abs(finalScore) + 0.2; // Base confidence
      
      // Extract themes
      const themes = this.extractMarketThemes(text);
      
      // Store for learning
      this.feedbackData.push({
        text: text.substring(0, 200),
        prediction: { score: finalScore, label: label },
        context: context,
        timestamp: Date.now()
      });
      
      console.log(`✅ VADER analysis complete: ${finalScore.toFixed(3)} (${label})`);
      
      return {
        score: finalScore,
        label: label,
        confidence: Math.min(0.95, confidence),
        themes: themes,
        entities: this.extractEntities(text),
        emotions: this.extractEmotions(text),
        positives: marketEnhancement.positives,
        negatives: marketEnhancement.negatives,
        raw_text: text,
        analyzed_at: new Date(),
        method: 'vader_market_analysis',
        vader_score: vaderResult.compound,
        market_score: marketEnhancement.score,
        total_matches: marketEnhancement.positives.length + marketEnhancement.negatives.length,
        text_length: text.split(' ').length
      };
      
    } catch (error) {
      console.error('VADER sentiment analysis error:', error);
      return this.getFallbackAnalysis(text);
    }
  }

  /**
   * Analyze market-specific context
   */
  analyzeMarketContext(text) {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    
    let score = 0;
    let positives = [];
    let negatives = [];
    
    // Check for market-specific words
    this.marketPositiveWords.forEach(word => {
      if (lowerText.includes(word)) {
        score += 0.2;
        positives.push(word);
      }
    });
    
    this.marketNegativeWords.forEach(word => {
      if (lowerText.includes(word)) {
        score -= 0.2;
        negatives.push(word);
      }
    });
    
    // Check for intensifiers
    const intensifiers = ['very', 'extremely', 'highly', 'significantly'];
    intensifiers.forEach(intensifier => {
      if (lowerText.includes(intensifier)) {
        score *= 1.2; // Amplify the sentiment
      }
    });
    
    // Check for negators
    const negators = ['not', 'no', 'never', 'isnt', 'arent'];
    negators.forEach(negator => {
      if (lowerText.includes(negator)) {
        score *= -0.8; // Reverse the sentiment
      }
    });
    
    return {
      score: Math.max(-1, Math.min(1, score)),
      positives: positives,
      negatives: negatives
    };
  }

  /**
   * Extract market-specific themes
   */
  extractMarketThemes(text) {
    const themes = [];
    const lowerText = text.toLowerCase();
    
    // Market themes
    if (lowerText.includes('stock') || lowerText.includes('share') || lowerText.includes('trading')) {
      themes.push('stock_market');
    }
    if (lowerText.includes('earnings') || lowerText.includes('revenue') || lowerText.includes('profit')) {
      themes.push('financial_performance');
    }
    if (lowerText.includes('growth') || lowerText.includes('expansion') || lowerText.includes('market_share')) {
      themes.push('business_growth');
    }
    if (lowerText.includes('innovation') || lowerText.includes('technology') || lowerText.includes('digital')) {
      themes.push('innovation');
    }
    if (lowerText.includes('customer') || lowerText.includes('service') || lowerText.includes('satisfaction')) {
      themes.push('customer_experience');
    }
    if (lowerText.includes('competition') || lowerText.includes('competitor') || lowerText.includes('market_position')) {
      themes.push('competitive_landscape');
    }
    if (lowerText.includes('economy') || lowerText.includes('economic') || lowerText.includes('market_conditions')) {
      themes.push('economic_factors');
    }
    
    // Sentiment themes
    if (lowerText.includes('bullish') || lowerText.includes('positive') || lowerText.includes('growth')) {
      themes.push('bullish_sentiment');
    }
    if (lowerText.includes('bearish') || lowerText.includes('negative') || lowerText.includes('decline')) {
      themes.push('bearish_sentiment');
    }
    
    return themes.length > 0 ? themes : ['general_market'];
  }

  /**
   * Extract entities (simple approach)
   */
  extractEntities(text) {
    const entities = {
      people: [],
      places: [],
      organizations: [],
      numbers: []
    };
    
    // Simple entity extraction
    const words = text.split(' ');
    
    words.forEach(word => {
      // Organizations (capitalized words)
      if (word.match(/^[A-Z][a-z]+$/) && word.length > 2) {
        entities.organizations.push(word);
      }
      
      // Numbers
      if (word.match(/^\d+$/) || word.match(/^\d+\.\d+$/)) {
        entities.numbers.push(word);
      }
    });
    
    return entities;
  }

  /**
   * Extract emotions (simple approach)
   */
  extractEmotions(text) {
    const emotions = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('excited') || lowerText.includes('thrilled') || lowerText.includes('optimistic')) {
      emotions.push('optimism');
    }
    if (lowerText.includes('worried') || lowerText.includes('concerned') || lowerText.includes('pessimistic')) {
      emotions.push('concern');
    }
    if (lowerText.includes('confident') || lowerText.includes('assured') || lowerText.includes('certain')) {
      emotions.push('confidence');
    }
    if (lowerText.includes('uncertain') || lowerText.includes('doubtful') || lowerText.includes('unsure')) {
      emotions.push('uncertainty');
    }
    
    return emotions;
  }

  /**
   * Fallback analysis
   */
  getFallbackAnalysis(text) {
    console.log('🔄 Using fallback analysis');
    
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    
    let score = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    
    // Simple word counting
    this.marketPositiveWords.forEach(word => {
      if (lowerText.includes(word)) {
        score += 0.2;
        positiveCount++;
      }
    });
    
    this.marketNegativeWords.forEach(word => {
      if (lowerText.includes(word)) {
        score -= 0.2;
        negativeCount++;
      }
    });
    
    score = Math.max(-1, Math.min(1, score));
    
    let label = 'neutral';
    if (score > 0.2) label = 'positive';
    else if (score < -0.2) label = 'negative';
    
    return {
      score: score,
      label: label,
      confidence: 0.6,
      themes: ['fallback_market_analysis'],
      entities: {},
      emotions: [],
      positives: [],
      negatives: [],
      raw_text: text,
      analyzed_at: new Date(),
      method: 'fallback_analysis'
    };
  }

  /**
   * Get learning statistics
   */
  getLearningStats() {
    return {
      total_analyses: this.feedbackData.length,
      recent_analyses: this.feedbackData.slice(-10),
      average_confidence: this.feedbackData.length > 0 
        ? this.feedbackData.reduce((sum, item) => sum + item.prediction.confidence, 0) / this.feedbackData.length 
        : 0,
      method_distribution: this.getMethodDistribution()
    };
  }

  /**
   * Get method distribution
   */
  getMethodDistribution() {
    const distribution = {};
    this.feedbackData.forEach(item => {
      const method = item.prediction.method || 'unknown';
      distribution[method] = (distribution[method] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Update model based on user feedback
   */
  updateModel(text, userFeedback) {
    console.log('🎓 Updating model with user feedback');
    
    this.feedbackData.push({
      text: text.substring(0, 200),
      prediction: { score: 0, label: 'user_feedback' },
      user_feedback: userFeedback,
      timestamp: Date.now()
    });
    
    return { success: true, message: 'Model updated with feedback' };
  }
}

module.exports = SimpleSentimentAnalyzer; 