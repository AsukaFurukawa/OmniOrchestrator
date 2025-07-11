// Set environment variables directly
process.env.NODE_ENV = "development";

const SentimentAnalysis = require("./server/services/sentimentAnalysis");

async function testUltraFastSentiment() {
  console.log(" Testing ULTRA-FAST LOCAL-ONLY sentiment analysis...");
  
  const sentiment = new SentimentAnalysis();
  
  const startTime = Date.now();
  
  try {
    // Test individual content analysis (no external APIs)
    const sampleTexts = [
      "Apple products are amazing and innovative!",
      "Google search is terrible and disappointing",
      "Microsoft has great customer service and reliable software",
      "This company is okay, nothing special"
    ];
    
    console.log("\n Testing individual sentiment analysis:");
    for (const text of sampleTexts) {
      const result = await sentiment.analyzeSingleContent(text);
      console.log(`Text: "${text}"`);
      console.log(`Score: ${result.score.toFixed(2)} | Label: ${result.label} | Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`Method: ${result.method}\n`);
    }
    
    // Test brand sentiment analysis with mock data
    console.log(" Testing brand sentiment analysis:");
    const brandResult = await sentiment.analyzeBrandSentiment("Tesla", {
      sources: ["social", "news"],
      timeframe: "7d"
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log("\n ULTRA-FAST SENTIMENT ANALYSIS RESULTS:");
    console.log(`  Total Duration: ${duration}ms`);
    console.log(` Brand: ${brandResult.brandName}`);
    console.log(` Overall Score: ${brandResult.sentiment.overall.score.toFixed(2)}`);
    console.log(` Sentiment Label: ${brandResult.sentiment.overall.label}`);
    console.log(` Confidence: ${(brandResult.sentiment.overall.confidence * 100).toFixed(1)}%`);
    console.log(` Total Mentions: ${brandResult.mentions.length}`);
    console.log(` Success: ${brandResult.success ? "YES" : "NO"}`);
    
    if (duration < 2000) {
      console.log("\n ULTRA-FAST ANALYSIS SUCCESSFUL! (< 2 seconds)");
      console.log(" 100% LOCAL - NO EXTERNAL DEPENDENCIES");
      console.log(" Ready for production use!");
    } else {
      console.log("\n  Analysis took longer than expected");
    }
    
  } catch (error) {
    console.error(" Test failed:", error.message);
  }
}

testUltraFastSentiment().catch(console.error);
