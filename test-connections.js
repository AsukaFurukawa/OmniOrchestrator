const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_ENDPOINTS = [
  '/api/health',
  '/api/image/generate/shivani',
  '/api/ai/generate/text/shivani', 
  '/api/video/generate/audio/shivani'
];

async function testConnections() {
  console.log('🔍 Testing OmniOrchestrator Backend Connections...\n');

  for (const endpoint of TEST_ENDPOINTS) {
    try {
      console.log(`Testing ${endpoint}...`);
      
      if (endpoint === '/api/health') {
        // Health check - should work without data
        const response = await axios.get(`${BASE_URL}${endpoint}`);
        console.log(`✅ ${endpoint} - Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.data, null, 2)}\n`);
      } else {
        // API endpoints - should return proper error for missing data (which is good)
        try {
          const response = await axios.post(`${BASE_URL}${endpoint}`, {});
          console.log(`✅ ${endpoint} - Status: ${response.status}`);
        } catch (error) {
          if (error.response && error.response.status === 400) {
            console.log(`✅ ${endpoint} - Status: 400 (Expected - missing required data)`);
          } else {
            console.log(`❌ ${endpoint} - Error: ${error.message}`);
          }
        }
        console.log('');
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Connection failed: ${error.message}\n`);
    }
  }

  console.log('🎯 Connection Test Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Make sure your server is running: npm start');
  console.log('2. Set up your environment variables in .env file');
  console.log('3. Test the UI features in your browser');
}

// Run the test
testConnections().catch(console.error); 