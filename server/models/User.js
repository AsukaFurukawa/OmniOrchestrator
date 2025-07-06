const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  company: {
    type: String,
    trim: true,
    maxlength: 100
  },
  industry: {
    type: String,
    trim: true,
    maxlength: 50
  },
  profile: {
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastLogin: {
      type: Date
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      marketingInsights: {
        type: Boolean,
        default: true
      },
      trendAlerts: {
        type: Boolean,
        default: true
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
      }
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free'
      },
      startDate: {
        type: Date,
        default: Date.now
      },
      endDate: {
        type: Date
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled'],
        default: 'active'
      }
    }
  },
  campaigns: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['email', 'social', 'web', 'sms'],
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'completed'],
      default: 'draft'
    },
    content: {
      headline: String,
      body: String,
      cta: String,
      visualUrl: String
    },
    targeting: {
      audience: String,
      demographics: {
        ageRange: String,
        interests: [String],
        location: String
      }
    },
    metrics: {
      impressions: {
        type: Number,
        default: 0
      },
      clicks: {
        type: Number,
        default: 0
      },
      conversions: {
        type: Number,
        default: 0
      },
      spend: {
        type: Number,
        default: 0
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  apiUsage: {
    currentMonth: {
      campaignGenerations: {
        type: Number,
        default: 0
      },
      imageGenerations: {
        type: Number,
        default: 0
      },
      analysisRequests: {
        type: Number,
        default: 0
      },
      totalRequests: {
        type: Number,
        default: 0
      }
    },
    limits: {
      campaignGenerations: {
        type: Number,
        default: 50 // Free tier limit
      },
      imageGenerations: {
        type: Number,
        default: 20 // Free tier limit
      },
      analysisRequests: {
        type: Number,
        default: 100 // Free tier limit
      }
    },
    history: [{
      month: {
        type: String,
        required: true
      },
      year: {
        type: Number,
        required: true
      },
      usage: {
        campaignGenerations: Number,
        imageGenerations: Number,
        analysisRequests: Number,
        totalRequests: Number
      }
    }]
  },
  integrations: {
    socialMedia: {
      twitter: {
        connected: {
          type: Boolean,
          default: false
        },
        accessToken: String,
        username: String
      },
      linkedin: {
        connected: {
          type: Boolean,
          default: false
        },
        accessToken: String,
        companyId: String
      },
      facebook: {
        connected: {
          type: Boolean,
          default: false
        },
        accessToken: String,
        pageId: String
      },
      instagram: {
        connected: {
          type: Boolean,
          default: false
        },
        accessToken: String,
        userId: String
      }
    },
    analytics: {
      googleAnalytics: {
        connected: {
          type: Boolean,
          default: false
        },
        propertyId: String
      }
    },
    crm: {
      hubspot: {
        connected: {
          type: Boolean,
          default: false
        },
        apiKey: String
      },
      salesforce: {
        connected: {
          type: Boolean,
          default: false
        },
        accessToken: String,
        instanceUrl: String
      }
    }
  },
  settings: {
    brandGuidelines: {
      brandColors: [String],
      fonts: [String],
      tone: {
        type: String,
        enum: ['professional', 'casual', 'friendly', 'bold', 'elegant'],
        default: 'professional'
      },
      keywords: [String],
      prohibitedWords: [String]
    },
    competitors: [String],
    targetAudiences: [{
      name: String,
      description: String,
      demographics: {
        ageRange: String,
        interests: [String],
        location: String,
        income: String
      }
    }],
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ 'campaigns.status': 1 });
userSchema.index({ 'profile.subscription.plan': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Instance methods for usage tracking
userSchema.methods.hasReachedLimit = function(type) {
  const current = this.apiUsage.currentMonth;
  const limits = this.apiUsage.limits;
  
  switch(type) {
    case 'campaign':
      return current.campaignGenerations >= limits.campaignGenerations;
    case 'image':
      return current.imageGenerations >= limits.imageGenerations;
    case 'analysis':
      return current.analysisRequests >= limits.analysisRequests;
    default:
      return false;
  }
};

userSchema.methods.incrementUsage = function(type) {
  const current = this.apiUsage.currentMonth;
  
  switch(type) {
    case 'campaign':
      current.campaignGenerations += 1;
      break;
    case 'image':
      current.imageGenerations += 1;
      break;
    case 'analysis':
      current.analysisRequests += 1;
      break;
  }
  
  current.totalRequests += 1;
  return this.save();
};

userSchema.methods.getRemainingUsage = function(type) {
  const current = this.apiUsage.currentMonth;
  const limits = this.apiUsage.limits;
  
  switch(type) {
    case 'campaign':
      return Math.max(0, limits.campaignGenerations - current.campaignGenerations);
    case 'image':
      return Math.max(0, limits.imageGenerations - current.imageGenerations);
    case 'analysis':
      return Math.max(0, limits.analysisRequests - current.analysisRequests);
    default:
      return 0;
  }
};

userSchema.methods.resetMonthlyUsage = function() {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Archive current month usage
  this.apiUsage.history.push({
    month: monthKey,
    year: now.getFullYear(),
    usage: { ...this.apiUsage.currentMonth }
  });
  
  // Reset current month counters
  this.apiUsage.currentMonth = {
    campaignGenerations: 0,
    imageGenerations: 0,
    analysisRequests: 0,
    totalRequests: 0
  };
  
  return this.save();
};

userSchema.methods.upgradePlan = function(newPlan) {
  const planLimits = {
    free: {
      campaignGenerations: 50,
      imageGenerations: 20,
      analysisRequests: 100
    },
    pro: {
      campaignGenerations: 500,
      imageGenerations: 200,
      analysisRequests: 1000
    },
    enterprise: {
      campaignGenerations: 5000,
      imageGenerations: 2000,
      analysisRequests: 10000
    }
  };
  
  this.profile.subscription.plan = newPlan;
  this.apiUsage.limits = planLimits[newPlan] || planLimits.free;
  
  return this.save();
};

userSchema.methods.addCampaign = function(campaignData) {
  const campaign = {
    name: campaignData.name,
    type: campaignData.type,
    status: campaignData.status || 'draft',
    content: campaignData.content || {},
    targeting: campaignData.targeting || {},
    metrics: {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      spend: 0
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  this.campaigns.push(campaign);
  return this.save();
};

userSchema.methods.updateCampaign = function(campaignId, updates) {
  const campaign = this.campaigns.id(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }
  
  Object.assign(campaign, updates);
  campaign.updatedAt = new Date();
  
  return this.save();
};

userSchema.methods.deleteCampaign = function(campaignId) {
  const campaign = this.campaigns.id(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }
  
  campaign.remove();
  return this.save();
};

userSchema.methods.getCampaignStats = function() {
  const campaigns = this.campaigns;
  
  return {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    paused: campaigns.filter(c => c.status === 'paused').length,
    totalImpressions: campaigns.reduce((sum, c) => sum + c.metrics.impressions, 0),
    totalClicks: campaigns.reduce((sum, c) => sum + c.metrics.clicks, 0),
    totalConversions: campaigns.reduce((sum, c) => sum + c.metrics.conversions, 0),
    totalSpend: campaigns.reduce((sum, c) => sum + c.metrics.spend, 0)
  };
};

// Get total performance across all campaigns
userSchema.methods.getTotalPerformance = function() {
  const campaigns = this.campaigns;
  
  return {
    impressions: campaigns.reduce((sum, c) => sum + (c.metrics.impressions || 0), 0),
    clicks: campaigns.reduce((sum, c) => sum + (c.metrics.clicks || 0), 0),
    conversions: campaigns.reduce((sum, c) => sum + (c.metrics.conversions || 0), 0),
    spend: campaigns.reduce((sum, c) => sum + (c.metrics.spend || 0), 0)
  };
};

// Get active campaigns
userSchema.methods.getActiveCampaigns = function() {
  return this.campaigns.filter(campaign => campaign.status === 'active');
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ 
    'profile.subscription.status': 'active',
    'profile.lastLogin': { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Active within 30 days
  });
};

userSchema.statics.getUsersByPlan = function(plan) {
  return this.find({ 'profile.subscription.plan': plan });
};

// Pre-save middleware
userSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

module.exports = mongoose.model('User', userSchema); 