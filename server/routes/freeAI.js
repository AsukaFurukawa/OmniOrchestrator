const express = require('express');
const router = express.Router();
const { FreeAIProviders } = require('../services/freeAIProviders');

const freeAI = new FreeAIProviders();

// 🤖 FREE CHAT ENDPOINT (replaces OpenAI chat)
router.post('/chat', async (req, res) => {
    try {
        const { message, options = {} } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // Use completely FREE chat
        const result = await freeAI.generateChat(message, options);
        
        res.json({
            success: true,
            data: {
                response: result.response,
                provider: result.provider,
                cost: result.cost,
                message: `✅ FREE AI Chat - No API keys needed!`
            }
        });
        
    } catch (error) {
        console.error('Free chat error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            fallback: "I'm a helpful AI assistant! How can I help you today?"
        });
    }
});

// 🎨 FREE IMAGE GENERATION (replaces DALL-E)
router.post('/generate-image', async (req, res) => {
    try {
        const { prompt, options = {} } = req.body;
        
        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: 'Prompt is required'
            });
        }

        console.log('🎨 Generating FREE image for:', prompt);
        
        const result = await freeAI.generateImage(prompt, options);
        
        res.json({
            success: true,
            data: {
                imageUrl: result.imageUrl,
                provider: result.provider,
                cost: result.cost,
                prompt: prompt,
                message: `✅ FREE Image Generation - No credits needed!`
            }
        });
        
    } catch (error) {
        console.error('Free image generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            fallback: `https://via.placeholder.com/512x512/667eea/ffffff?text=${encodeURIComponent(prompt.slice(0, 20))}`
        });
    }
});

// 💭 FREE SENTIMENT ANALYSIS (replaces OpenAI sentiment)
router.post('/sentiment', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Text is required'
            });
        }

        console.log('💭 Analyzing sentiment for:', text.substring(0, 50) + '...');
        
        const result = await freeAI.analyzeSentiment(text);
        
        res.json({
            success: true,
            data: {
                sentiment: result.sentiment,
                confidence: result.confidence,
                provider: result.provider,
                cost: result.cost,
                message: `✅ FREE Sentiment Analysis - ${result.sentiment} (${(result.confidence * 100).toFixed(1)}% confidence)`
            }
        });
        
    } catch (error) {
        console.error('Free sentiment analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            fallback: { sentiment: 'NEUTRAL', confidence: 0.5 }
        });
    }
});

// 📈 FREE MARKET DATA (replaces paid market APIs)
router.get('/market/:symbol?', async (req, res) => {
    try {
        const symbol = req.params.symbol || 'AAPL';
        
        console.log('📈 Getting FREE market data for:', symbol);
        
        const result = await freeAI.getMarketData(symbol);
        
        res.json({
            success: true,
            data: {
                marketData: result.data,
                provider: result.provider,
                cost: result.cost,
                message: `✅ FREE Market Data for ${symbol}`
            }
        });
        
    } catch (error) {
        console.error('Free market data error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            fallback: {
                symbol: symbol,
                price: '150.00',
                change: '+2.50',
                changePercent: '+1.69%'
            }
        });
    }
});

// 📰 FREE NEWS SENTIMENT (replaces paid news APIs)
router.get('/news-sentiment/:topic?', async (req, res) => {
    try {
        const topic = req.params.topic || 'technology';
        
        console.log('📰 Getting FREE news sentiment for:', topic);
        
        const result = await freeAI.getNewsSentiment(topic);
        
        res.json({
            success: true,
            data: {
                articles: result.articles,
                provider: result.provider,
                cost: result.cost,
                topic: topic,
                message: `✅ FREE News Sentiment Analysis for "${topic}"`
            }
        });
        
    } catch (error) {
        console.error('Free news sentiment error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            fallback: {
                articles: [
                    { title: 'Market trends continue upward', sentiment: 'POSITIVE', confidence: 0.8 },
                    { title: 'Technology sector shows growth', sentiment: 'POSITIVE', confidence: 0.9 }
                ]
            }
        });
    }
});

// 📋 LIST ALL FREE PROVIDERS
router.get('/providers', async (req, res) => {
    try {
        const result = freeAI.getProviderList();
        
        res.json({
            success: true,
            data: result.providers,
            message: result.message,
            totalCost: result.totalCost,
            info: {
                chat: '🤖 FREE unlimited chat with Hugging Face',
                images: '🎨 FREE image generation with Stable Diffusion',
                sentiment: '💭 FREE sentiment analysis',
                market: '📈 FREE market data with Alpha Vantage',
                news: '📰 FREE news with sentiment analysis'
            }
        });
        
    } catch (error) {
        console.error('Provider list error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 🧪 TEST ALL FREE SERVICES
router.get('/test', async (req, res) => {
    try {
        console.log('🧪 Testing all FREE AI services...');
        
        const tests = await Promise.allSettled([
            freeAI.generateChat('Hello, how are you?'),
            freeAI.generateImage('a beautiful sunset'),
            freeAI.analyzeSentiment('This is amazing!'),
            freeAI.getMarketData('AAPL'),
            freeAI.getNewsSentiment('technology')
        ]);
        
        const results = {
            chat: tests[0].status === 'fulfilled' ? '✅ Working' : '❌ Failed',
            image: tests[1].status === 'fulfilled' ? '✅ Working' : '❌ Failed',
            sentiment: tests[2].status === 'fulfilled' ? '✅ Working' : '❌ Failed',
            market: tests[3].status === 'fulfilled' ? '✅ Working' : '❌ Failed',
            news: tests[4].status === 'fulfilled' ? '✅ Working' : '❌ Failed'
        };
        
        res.json({
            success: true,
            tests: results,
            message: '🎉 All FREE AI services tested!',
            cost: '$0.00',
            note: 'No API keys or credits required!'
        });
        
    } catch (error) {
        console.error('Test error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router; 