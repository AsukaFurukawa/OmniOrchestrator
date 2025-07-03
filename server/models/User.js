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

// Method to check if user has reached API limits
userSchema.methods.hasReachedLimit = function(apiType) {
  const usage = this.apiUsage.currentMonth;
  const limits = this.apiUsage.limits;
  
  switch (apiType) {
    case 'campaign':
      return usage.campaignGenerations >= limits.campaignGenerations;
    case 'image':
      return usage.imageGenerations >= limits.imageGenerations;
    case 'analysis':
      return usage.analysisRequests >= limits.analysisRequests;
    default:
      return false;
  }
};

// Method to increment API usage
userSchema.methods.incrementUsage = function(apiType) {
  const usage = this.apiUsage.currentMonth;
  
  switch (apiType) {
    case 'campaign':
      usage.campaignGenerations += 1;
      break;
    case 'image':
      usage.imageGenerations += 1;
      break;
    case 'analysis':
      usage.analysisRequests += 1;
      break;
  }
  
  usage.totalRequests += 1;
  return this.save();
};

// Method to get active campaigns
userSchema.methods.getActiveCampaigns = function() {
  return this.campaigns.filter(campaign => campaign.status === 'active');
};

// Method to calculate total campaign performance
userSchema.methods.getTotalPerformance = function() {
  const campaigns = this.campaigns;
  
  return campaigns.reduce((total, campaign) => {
    total.impressions += campaign.metrics.impressions || 0;
    total.clicks += campaign.metrics.clicks || 0;
    total.conversions += campaign.metrics.conversions || 0;
    total.spend += campaign.metrics.spend || 0;
    return total;
  }, { impressions: 0, clicks: 0, conversions: 0, spend: 0 });
};

// Pre-save middleware to update timestamps
userSchema.pre('save', function(next) {
  if (this.campaigns && this.campaigns.length > 0) {
    this.campaigns.forEach(campaign => {
      if (campaign.isModified()) {
        campaign.updatedAt = new Date();
      }
    });
  }
  next();
});

// Static method to find users by industry
userSchema.statics.findByIndustry = function(industry) {
  return this.find({ industry: new RegExp(industry, 'i') });
};

// Static method to get subscription statistics
userSchema.statics.getSubscriptionStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$profile.subscription.plan',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('User', userSchema); 