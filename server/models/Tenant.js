const mongoose = require('mongoose');

const DataSourceSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Salesforce", "HubSpot", "Custom CRM"
    type: { type: String, required: true }, // "crm", "email", "social", "analytics", "custom"
    config: {
        apiUrl: String,
        apiKey: String,
        clientId: String,
        clientSecret: String,
        webhookUrl: String,
        customFields: Object, // Company-specific field mappings
        syncFrequency: { type: String, default: '1hour' }, // "15min", "1hour", "1day"
        isActive: { type: Boolean, default: true }
    },
    lastSync: Date,
    syncStatus: { type: String, default: 'pending' } // "pending", "syncing", "success", "error"
});

const BrandingSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    logo: {
        url: String,
        uploadedAt: Date
    },
    colors: {
        primary: { type: String, default: '#667eea' },     // Main brand color
        secondary: { type: String, default: '#764ba2' },   // Secondary brand color
        accent: { type: String, default: '#f093fb' },      // Accent color
        background: { type: String, default: '#0f0f23' },  // Background
        text: { type: String, default: '#ffffff' },        // Text color
        success: { type: String, default: '#10b981' },     // Success color
        warning: { type: String, default: '#f59e0b' },     // Warning color
        error: { type: String, default: '#ef4444' }        // Error color
    },
    fonts: {
        primary: { type: String, default: 'Inter' },
        secondary: { type: String, default: 'Inter' }
    },
    customCSS: String, // Custom CSS overrides
    favicon: String
});

const AudienceSegmentSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Enterprise Customers", "SMB Prospects"
    description: String,
    criteria: {
        demographics: Object,    // Age, location, company size, etc.
        behavioral: Object,      // Past purchases, engagement level, etc.
        psychographic: Object,   // Interests, values, lifestyle
        firmographic: Object     // Industry, revenue, employee count (B2B)
    },
    size: Number, // Estimated segment size
    customFields: Object, // Company-specific audience data
    aiPersona: {
        tone: { type: String, default: 'professional' }, // "professional", "casual", "friendly", "urgent"
        style: { type: String, default: 'informative' }, // "informative", "persuasive", "educational", "entertaining"
        language: { type: String, default: 'en' },
        customPrompts: Object // Company-specific AI prompt templates
    }
});

const IntegrationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true }, // "email", "crm", "social", "analytics", "video", "payment"
    provider: String, // "mailchimp", "salesforce", "twitter", "stripe", etc.
    credentials: {
        encrypted: String, // Encrypted API keys/tokens
        refreshToken: String,
        expiresAt: Date
    },
    settings: Object, // Provider-specific settings
    isActive: { type: Boolean, default: true },
    lastUsed: Date,
    usageStats: {
        requestCount: { type: Number, default: 0 },
        lastMonth: { type: Number, default: 0 },
        errorCount: { type: Number, default: 0 }
    }
});

const AIConfigSchema = new mongoose.Schema({
    chatModel: { type: String, default: 'gpt-4o' }, // AI model for campaign generation
    imageModel: { type: String, default: 'dall-e-3' }, // AI model for image generation
    videoModel: { type: String, default: 'open-sora' }, // AI model for video generation
    customPrompts: {
        campaignGeneration: {
            systemPrompt: String,
            userPromptTemplate: String,
            examples: [Object] // Example inputs/outputs for few-shot learning
        },
        videoGeneration: {
            systemPrompt: String,
            stylePresets: [Object] // Company-specific video styles
        },
        analytics: {
            insightPrompts: [String], // Custom insight generation prompts
            reportTemplates: [Object]
        }
    },
    restrictions: {
        maxCampaignsPerMonth: { type: Number, default: 100 },
        maxVideosPerMonth: { type: Number, default: 20 },
        maxAITokensPerMonth: { type: Number, default: 100000 },
        allowedFeatures: [String] // ["campaigns", "videos", "analytics", "insights"]
    }
});

const TenantSchema = new mongoose.Schema({
    // Basic tenant info
    tenantId: { type: String, required: true, unique: true }, // e.g., "acme-corp", "tech-startup"
    companyName: { type: String, required: true },
    industry: { type: String, required: true }, // "Technology", "Healthcare", "E-commerce", etc.
    companySize: { type: String, required: true }, // "startup", "smb", "enterprise"
    website: String,
    
    // Subscription & Billing
    plan: {
        type: { type: String, required: true }, // "starter", "professional", "enterprise", "custom"
        status: { type: String, default: 'active' }, // "active", "suspended", "canceled"
        billingCycle: { type: String, default: 'monthly' }, // "monthly", "yearly"
        startDate: { type: Date, default: Date.now },
        nextBillingDate: Date,
        features: [String] // Enabled features for this plan
    },
    
    // Contact & Admin
    adminUsers: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, default: 'admin' }, // "admin", "manager", "user"
        permissions: [String]
    }],
    primaryContact: {
        name: String,
        email: String,
        phone: String,
        timezone: { type: String, default: 'UTC' }
    },
    
    // Branding & Customization
    branding: BrandingSchema,
    
    // Data Sources & Integrations
    dataSources: [DataSourceSchema],
    integrations: [IntegrationSchema],
    
    // Audience & Marketing Configuration
    audienceSegments: [AudienceSegmentSchema],
    defaultAudience: { type: String }, // Default audience segment name
    
    // AI Configuration
    aiConfig: AIConfigSchema,
    
    // Custom Fields & Metadata
    customFields: {
        leadFields: Object,     // Custom lead/contact fields
        campaignFields: Object, // Custom campaign tracking fields
        productFields: Object,  // Custom product/service fields
        eventFields: Object     // Custom event tracking fields
    },
    
    // Analytics & Tracking
    analytics: {
        trackingId: String, // Google Analytics, custom tracking
        goals: [Object],    // Custom conversion goals
        kpis: [Object],     // Key performance indicators
        dashboardConfig: Object // Custom dashboard layout
    },
    
    // Compliance & Security
    compliance: {
        gdprEnabled: { type: Boolean, default: false },
        ccpaEnabled: { type: Boolean, default: false },
        dataRetentionDays: { type: Number, default: 365 },
        encryptionLevel: { type: String, default: 'standard' }, // "standard", "enhanced"
        allowedCountries: [String], // Geo-restrictions
        blockedCountries: [String]
    },
    
    // Usage & Limits
    usage: {
        currentMonth: {
            campaignsGenerated: { type: Number, default: 0 },
            videosGenerated: { type: Number, default: 0 },
            aiTokensUsed: { type: Number, default: 0 },
            emailsSent: { type: Number, default: 0 },
            apiCalls: { type: Number, default: 0 }
        },
        historical: [Object] // Monthly usage history
    },
    
    // Settings & Preferences
    settings: {
        timezone: { type: String, default: 'UTC' },
        language: { type: String, default: 'en' },
        currency: { type: String, default: 'USD' },
        dateFormat: { type: String, default: 'MM/DD/YYYY' },
        emailNotifications: {
            campaignResults: { type: Boolean, default: true },
            weeklyReports: { type: Boolean, default: true },
            systemUpdates: { type: Boolean, default: true },
            billingAlerts: { type: Boolean, default: true }
        },
        autoOptimization: { type: Boolean, default: true },
        aiSuggestions: { type: Boolean, default: true }
    },
    
    // Status & Metadata
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastActivity: Date,
    
    // Trial & Onboarding
    trial: {
        isTrialActive: { type: Boolean, default: false },
        trialStartDate: Date,
        trialEndDate: Date,
        trialExtensions: { type: Number, default: 0 }
    },
    onboarding: {
        isCompleted: { type: Boolean, default: false },
        currentStep: { type: Number, default: 1 },
        completedSteps: [Number],
        skipOptionalSteps: { type: Boolean, default: false }
    }
});

// Indexes for performance
TenantSchema.index({ tenantId: 1 });
TenantSchema.index({ 'plan.status': 1 });
TenantSchema.index({ industry: 1 });
TenantSchema.index({ companySize: 1 });
TenantSchema.index({ createdAt: -1 });

// Pre-save middleware
TenantSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Instance methods
TenantSchema.methods.isFeatureEnabled = function(featureName) {
    return this.plan.features.includes(featureName);
};

TenantSchema.methods.getRemainingUsage = function(metric) {
    const limits = this.aiConfig.restrictions;
    const current = this.usage.currentMonth;
    
    switch(metric) {
        case 'campaigns':
            return Math.max(0, limits.maxCampaignsPerMonth - current.campaignsGenerated);
        case 'videos':
            return Math.max(0, limits.maxVideosPerMonth - current.videosGenerated);
        case 'tokens':
            return Math.max(0, limits.maxAITokensPerMonth - current.aiTokensUsed);
        default:
            return 0;
    }
};

TenantSchema.methods.incrementUsage = function(metric, amount = 1) {
    switch(metric) {
        case 'campaigns':
            this.usage.currentMonth.campaignsGenerated += amount;
            break;
        case 'videos':
            this.usage.currentMonth.videosGenerated += amount;
            break;
        case 'tokens':
            this.usage.currentMonth.aiTokensUsed += amount;
            break;
        case 'emails':
            this.usage.currentMonth.emailsSent += amount;
            break;
        case 'api':
            this.usage.currentMonth.apiCalls += amount;
            break;
    }
    this.lastActivity = new Date();
    return this.save();
};

// Static methods
TenantSchema.statics.findByTenantId = function(tenantId) {
    return this.findOne({ tenantId, isActive: true });
};

TenantSchema.statics.getActiveTenants = function() {
    return this.find({ isActive: true, 'plan.status': 'active' });
};

module.exports = mongoose.model('Tenant', TenantSchema); 