// Load environment variables from env.example for testing
require('dotenv').config({ path: './env.example' });

const SentimentAnalysis = require('./server/services/sentimentAnalysis');

async function testFastSentiment() {
  console.log('🚀 Testing FAST sentiment analysis...');
  
  // Set environment variables for testing
  process.env.NODE_ENV = 'development';
  process.env.OPENAI_API_KEY = 'sk-your-openai-api-key-here';
  process.env.NEWS_API_KEY = 'your-news-api-key-here';
  process.env.COMETAI_API_KEY = 'sk-your-cometai-api-key-here';
  
  const sentiment = new SentimentAnalysis();
  
  // Test with a simple brand name
  const startTime = Date.now();
  
  try {
    const result = await sentiment.analyzeBrandSentiment('Apple', {
      sources: ['social', 'news'],
      timeframe: '7d'
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('\n✅ FAST SENTIMENT ANALYSIS RESULTS:');
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📊 Brand: ${result.brandName}`);
    console.log(`🎯 Overall Score: ${result.sentiment.overall.score.toFixed(2)}`);
    console.log(`📈 Sentiment Label: ${result.sentiment.overall.label}`);
    console.log(`🔍 Confidence: ${result.sentiment.overall.confidence.toFixed(2)}`);
    console.log(`📱 Total Mentions: ${result.mentions.length}`);
    console.log(`🎯 Success: ${result.success ? 'YES' : 'NO'}`);
    
    // Show some sample mentions
    if (result.mentions.length > 0) {
      console.log('\n📝 Sample Mentions:');
      result.mentions.slice(0, 3).forEach((mention, i) => {
        console.log(`${i + 1}. [${mention.source}] ${mention.text.substring(0, 100)}...`);
      });
    }
    
    if (duration < 10000) {
      console.log('\n🎉 FAST ANALYSIS SUCCESSFUL! (< 10 seconds)');
    } else {
      console.log('\n⚠️  Analysis took longer than expected');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFastSentiment().catch(console.error); 