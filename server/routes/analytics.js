const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { timeframe = '30d' } = req.query;
    
    // Calculate performance metrics
    const totalPerformance = user.getTotalPerformance();
    const activeCampaigns = user.getActiveCampaigns();
    
    // Generate mock analytics data
    const analytics = {
      overview: {
        totalCampaigns: user.campaigns.length,
        activeCampaigns: activeCampaigns.length,
        totalImpressions: totalPerformance.impressions,
        totalClicks: totalPerformance.clicks,
        totalConversions: totalPerformance.conversions,
        totalSpend: totalPerformance.spend,
        averageCTR: totalPerformance.impressions > 0 ? 
          (totalPerformance.clicks / totalPerformance.impressions * 100).toFixed(2) : 0,
        averageConversionRate: totalPerformance.clicks > 0 ? 
          (totalPerformance.conversions / totalPerformance.clicks * 100).toFixed(2) : 0
      },
      trends: {
        impressions: generateTrendData(7),
        clicks: generateTrendData(7),
        conversions: generateTrendData(7),
        spend: generateTrendData(7)
      },
      topCampaigns: user.campaigns
        .sort((a, b) => b.metrics.impressions - a.metrics.impressions)
        .slice(0, 5)
        .map(campaign => ({
          id: campaign._id,
          name: campaign.name,
          type: campaign.type,
          status: campaign.status,
          impressions: campaign.metrics.impressions,
          clicks: campaign.metrics.clicks,
          conversions: campaign.metrics.conversions,
          ctr: campaign.metrics.impressions > 0 ? 
            (campaign.metrics.clicks / campaign.metrics.impressions * 100).toFixed(2) : 0
        })),
      channelPerformance: calculateChannelPerformance(user.campaigns),
      timeframe
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard analytics',
      details: error.message
    });
  }
});

// Get detailed campaign analytics
router.get('/campaigns/:campaignId', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const campaign = user.campaigns.id(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    const analytics = {
      campaign: {
        id: campaign._id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt
      },
      metrics: campaign.metrics,
      performance: {
        ctr: campaign.metrics.impressions > 0 ? 
          (campaign.metrics.clicks / campaign.metrics.impressions * 100).toFixed(2) : 0,
        conversionRate: campaign.metrics.clicks > 0 ? 
          (campaign.metrics.conversions / campaign.metrics.clicks * 100).toFixed(2) : 0,
        cpc: campaign.metrics.clicks > 0 ? 
          (campaign.metrics.spend / campaign.metrics.clicks).toFixed(2) : 0,
        cpa: campaign.metrics.conversions > 0 ? 
          (campaign.metrics.spend / campaign.metrics.conversions).toFixed(2) : 0
      },
      trends: {
        daily: generateTrendData(30),
        hourly: generateTrendData(24)
      },
      demographics: generateDemographicsData(),
      deviceBreakdown: generateDeviceData(),
      locationBreakdown: generateLocationData()
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Campaign analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaign analytics',
      details: error.message
    });
  }
});

// Get API usage analytics
router.get('/api-usage', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const usage = user.apiUsage;
    
    const analytics = {
      currentMonth: usage.currentMonth,
      limits: usage.limits,
      utilization: {
        campaignGenerations: usage.limits.campaignGenerations > 0 ? 
          (usage.currentMonth.campaignGenerations / usage.limits.campaignGenerations * 100).toFixed(1) : 0,
        imageGenerations: usage.limits.imageGenerations > 0 ? 
          (usage.currentMonth.imageGenerations / usage.limits.imageGenerations * 100).toFixed(1) : 0,
        analysisRequests: usage.limits.analysisRequests > 0 ? 
          (usage.currentMonth.analysisRequests / usage.limits.analysisRequests * 100).toFixed(1) : 0
      },
      history: usage.history.slice(-6), // Last 6 months
      predictions: generateUsagePredictions(usage.history)
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('API usage analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch API usage analytics',
      details: error.message
    });
  }
});

// Get ROI analytics
router.get('/roi', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const totalPerformance = user.getTotalPerformance();
    
    // Simulate revenue data (in a real app, this would come from e-commerce integration)
    const estimatedRevenue = totalPerformance.conversions * 50; // $50 per conversion
    
    const roiAnalytics = {
      totalSpend: totalPerformance.spend,
      estimatedRevenue: estimatedRevenue,
      netProfit: estimatedRevenue - totalPerformance.spend,
      roi: totalPerformance.spend > 0 ? 
        ((estimatedRevenue - totalPerformance.spend) / totalPerformance.spend * 100).toFixed(2) : 0,
      roas: totalPerformance.spend > 0 ? 
        (estimatedRevenue / totalPerformance.spend).toFixed(2) : 0,
      campaignROI: user.campaigns.map(campaign => {
        const revenue = campaign.metrics.conversions * 50;
        const spend = campaign.metrics.spend;
        return {
          id: campaign._id,
          name: campaign.name,
          spend: spend,
          revenue: revenue,
          roi: spend > 0 ? ((revenue - spend) / spend * 100).toFixed(2) : 0
        };
      }).sort((a, b) => b.roi - a.roi),
      monthlyTrends: generateROITrends(6)
    };

    res.json({
      success: true,
      analytics: roiAnalytics
    });
  } catch (error) {
    console.error('ROI analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ROI analytics',
      details: error.message
    });
  }
});

// Helper functions
function generateTrendData(days) {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 100) + 10
    });
  }
  return data;
}

function calculateChannelPerformance(campaigns) {
  const channels = {};
  
  campaigns.forEach(campaign => {
    if (!channels[campaign.type]) {
      channels[campaign.type] = {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spend: 0,
        campaigns: 0
      };
    }
    
    channels[campaign.type].impressions += campaign.metrics.impressions;
    channels[campaign.type].clicks += campaign.metrics.clicks;
    channels[campaign.type].conversions += campaign.metrics.conversions;
    channels[campaign.type].spend += campaign.metrics.spend;
    channels[campaign.type].campaigns += 1;
  });
  
  return Object.entries(channels).map(([type, metrics]) => ({
    channel: type,
    ...metrics,
    ctr: metrics.impressions > 0 ? (metrics.clicks / metrics.impressions * 100).toFixed(2) : 0,
    conversionRate: metrics.clicks > 0 ? (metrics.conversions / metrics.clicks * 100).toFixed(2) : 0
  }));
}

function generateDemographicsData() {
  return {
    ageGroups: [
      { range: '18-24', percentage: 15, clicks: 150, conversions: 12 },
      { range: '25-34', percentage: 35, clicks: 350, conversions: 45 },
      { range: '35-44', percentage: 25, clicks: 250, conversions: 38 },
      { range: '45-54', percentage: 15, clicks: 150, conversions: 22 },
      { range: '55+', percentage: 10, clicks: 100, conversions: 15 }
    ],
    gender: [
      { type: 'Male', percentage: 55, clicks: 550, conversions: 68 },
      { type: 'Female', percentage: 45, clicks: 450, conversions: 64 }
    ]
  };
}

function generateDeviceData() {
  return [
    { device: 'Mobile', percentage: 65, clicks: 650, conversions: 78 },
    { device: 'Desktop', percentage: 30, clicks: 300, conversions: 45 },
    { device: 'Tablet', percentage: 5, clicks: 50, conversions: 9 }
  ];
}

function generateLocationData() {
  return [
    { location: 'United States', percentage: 40, clicks: 400, conversions: 60 },
    { location: 'Canada', percentage: 15, clicks: 150, conversions: 22 },
    { location: 'United Kingdom', percentage: 12, clicks: 120, conversions: 18 },
    { location: 'Germany', percentage: 10, clicks: 100, conversions: 15 },
    { location: 'Other', percentage: 23, clicks: 230, conversions: 17 }
  ];
}

function generateUsagePredictions(history) {
  if (history.length < 2) return {};
  
  const recent = history.slice(-3);
  const avgGrowth = recent.reduce((sum, month, index) => {
    if (index === 0) return 0;
    const prev = recent[index - 1];
    const growth = (month.usage.totalRequests - prev.usage.totalRequests) / prev.usage.totalRequests;
    return sum + growth;
  }, 0) / (recent.length - 1);
  
  const lastMonth = recent[recent.length - 1];
  const predictedNext = Math.max(0, Math.floor(lastMonth.usage.totalRequests * (1 + avgGrowth)));
  
  return {
    nextMonth: predictedNext,
    growthRate: (avgGrowth * 100).toFixed(1)
  };
}

function generateROITrends(months) {
  const trends = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    trends.push({
      month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
      spend: Math.floor(Math.random() * 5000) + 1000,
      revenue: Math.floor(Math.random() * 8000) + 2000,
      roi: Math.floor(Math.random() * 200) + 50
    });
  }
  return trends;
}

module.exports = router; 