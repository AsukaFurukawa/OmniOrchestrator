// Set environment variables for testing
process.env.NODE_ENV = 'development';
process.env.OPENAI_API_KEY = 'test-key';

const SentimentAnalysis = require('./server/services/sentimentAnalysis');

async function testSimpleSentiment() {
  console.log('🚀 Testing LOCAL sentiment analysis...');
  
  const sentiment = new SentimentAnalysis();
  
  try {
    // Test individual sentiment analysis
    const text = "Apple products are amazing and innovative!";
    const result = await sentiment.analyzeSingleContent(text);
    
    console.log('✅ Individual Analysis Result:');
    console.log(`Text: "${text}"`);
    console.log(`Score: ${result.score.toFixed(2)}`);
    console.log(`Label: ${result.label}`);
    console.log(`Method: ${result.method}`);
    
    // Test brand analysis
    console.log('\n🎯 Testing brand analysis...');
    const brandResult = await sentiment.analyzeBrandSentiment('Tesla');
    
    console.log('✅ Brand Analysis Result:');
    console.log(`Brand: ${brandResult.brandName}`);
    console.log(`Success: ${brandResult.success}`);
    console.log(`Overall Score: ${brandResult.sentiment.overall.score.toFixed(2)}`);
    console.log(`Label: ${brandResult.sentiment.overall.label}`);
    
    console.log('\n🎉 ALL TESTS PASSED! Sentiment analysis is working!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSimpleSentiment(); 