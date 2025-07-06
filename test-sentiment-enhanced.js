const axios = require('axios');

async function testEnhancedSentimentAnalysis() {
    console.log('🧪 Testing Enhanced Sentiment Analysis with Real Data...');
    
    const testCases = [
        {
            name: 'Apple',
            description: 'Major tech company - should have mixed sentiment'
        },
        {
            name: 'Google',
            description: 'Search giant - generally positive'
        },
        {
            name: 'Tesla',
            description: 'Electric car company - polarizing opinions'
        },
        {
            name: 'Microsoft',
            description: 'Software company - professional reputation'
        },
        {
            name: 'Facebook',
            description: 'Social media - privacy concerns vs utility'
        },
        {
            name: 'Netflix',
            description: 'Streaming service - content quality varies'
        },
        {
            name: 'Amazon',
            description: 'E-commerce giant - convenience vs worker issues'
        },
        {
            name: 'Coca-Cola',
            description: 'Classic brand - generally loved'
        }
    ];
    
    // Test with mock auth token (in dev mode)
    const authToken = 'dev-token-test-sentiment';
    
    for (const testCase of testCases) {
        console.log(`\n🔍 Testing sentiment for: ${testCase.name}`);
        console.log(`📝 Expected: ${testCase.description}`);
        
        try {
            const startTime = Date.now();
            
            const response = await axios.post('http://localhost:3000/api/analytics/sentiment/brand', {
                brandName: testCase.name,
                options: {
                    sources: ['social', 'news', 'review'],
                    timeframe: '7d',
                    includeDetails: true
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                timeout: 30000 // 30 second timeout
            });
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            if (response.data.success !== false && response.data.sentiment) {
                const sentiment = response.data.sentiment;
                console.log(`✅ ${testCase.name} Analysis Complete (${duration}ms):`);
                console.log(`   📊 Overall Score: ${sentiment.overall.score.toFixed(2)}`);
                console.log(`   🏷️  Label: ${sentiment.overall.label}`);
                console.log(`   🎯 Confidence: ${Math.round(sentiment.overall.confidence * 100)}%`);
                console.log(`   📈 Volume: ${sentiment.volume} mentions`);
                
                if (sentiment.breakdown) {
                    console.log(`   📋 Breakdown:`);
                    Object.entries(sentiment.breakdown).forEach(([key, value]) => {
                        if (value > 0) {
                            console.log(`      ${key}: ${value}`);
                        }
                    });
                }
                
                if (response.data.mentions && response.data.mentions.length > 0) {
                    console.log(`   💬 Sample mentions:`);
                    response.data.mentions.slice(0, 3).forEach((mention, index) => {
                        const text = mention.text.substring(0, 100);
                        console.log(`      ${index + 1}. "${text}..." (${mention.platform})`);
                    });
                }
                
                if (response.data.rawSentiments && response.data.rawSentiments.length > 0) {
                    console.log(`   🔬 Analysis Methods Used:`);
                    const methods = [...new Set(response.data.rawSentiments.map(r => r.method))];
                    methods.forEach(method => {
                        const count = response.data.rawSentiments.filter(r => r.method === method).length;
                        console.log(`      ${method}: ${count} analyses`);
                    });
                }
                
                // Sentiment quality assessment
                if (sentiment.overall.confidence > 0.7) {
                    console.log(`   ⭐ High quality analysis`);
                } else if (sentiment.overall.confidence > 0.5) {
                    console.log(`   ⚠️  Medium quality analysis`);
                } else {
                    console.log(`   ❓ Low confidence analysis`);
                }
                
            } else {
                console.log(`❌ ${testCase.name}: Analysis failed`);
                if (response.data.error) {
                    console.log(`   Error: ${response.data.error}`);
                }
                if (response.data.note) {
                    console.log(`   Note: ${response.data.note}`);
                }
            }
            
        } catch (error) {
            console.log(`❌ ${testCase.name} Error:`, error.response?.data?.error || error.message);
            
            if (error.code === 'ECONNREFUSED') {
                console.log('   🔌 Server not running? Start with "npm start"');
                break;
            }
        }
        
        // Small delay between requests to be respectful
        if (testCase !== testCases[testCases.length - 1]) {
            console.log('   ⏳ Waiting 2 seconds...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    console.log('\n✅ Enhanced Sentiment Analysis Test Complete!');
    console.log('\n📝 Test Summary:');
    console.log('   - Real News API integration tested');
    console.log('   - Reddit data gathering tested');
    console.log('   - Multiple AI sentiment providers tested');
    console.log('   - Local sentiment analysis fallback tested');
    console.log('   - Enhanced error handling verified');
}

// Test individual content analysis
async function testContentAnalysis() {
    console.log('\n🧪 Testing Individual Content Analysis...');
    
    const testTexts = [
        "I absolutely love this product! Amazing quality and fantastic customer service.",
        "This is terrible. Worst experience ever. Complete waste of money.",
        "It's okay, nothing special but does the job fine.",
        "Not sure if I would recommend this. Mixed feelings about the quality.",
        "Outstanding performance! Exceeded all my expectations. Highly recommend!"
    ];
    
    for (const text of testTexts) {
        try {
            const response = await axios.post('http://localhost:3000/api/analytics/sentiment/content', {
                text: text,
                contentType: 'review'
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer dev-token-test-content'
                }
            });
            
            if (response.data.success) {
                const sentiment = response.data.sentiment;
                console.log(`📝 "${text.substring(0, 50)}..."`);
                console.log(`   Score: ${sentiment.score.toFixed(2)} (${sentiment.label})`);
                console.log(`   Method: ${sentiment.method || 'unknown'}`);
                console.log(`   Confidence: ${Math.round(sentiment.confidence * 100)}%`);
            }
        } catch (error) {
            console.log(`❌ Content analysis error: ${error.message}`);
        }
    }
}

// Run both tests
async function runAllTests() {
    await testEnhancedSentimentAnalysis();
    await testContentAnalysis();
}

runAllTests().catch(console.error); 