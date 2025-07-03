const Tenant = require('../models/Tenant');
const jwt = require('jsonwebtoken');

/**
 * Multi-Tenant Context Middleware
 * Handles tenant identification, data isolation, and dynamic configuration
 */

// Tenant identification strategies
const TENANT_STRATEGIES = {
    SUBDOMAIN: 'subdomain',     // acme.omniorchestrator.com
    CUSTOM_DOMAIN: 'domain',    // marketing.acme.com
    PATH_PREFIX: 'path',        // omniorchestrator.com/acme
    HEADER: 'header',           // X-Tenant-ID header
    JWT_CLAIM: 'jwt'            // Tenant ID in JWT token
};

/**
 * Extract tenant ID from request using multiple strategies
 */
function extractTenantId(req) {
    // Strategy 1: Custom domain mapping
    const host = req.get('host');
    if (host && !host.includes('localhost') && !host.includes('omniorchestrator.com')) {
        // Custom domain like marketing.acme.com
        return host.split('.')[0];
    }
    
    // Strategy 2: Subdomain
    if (host && host.includes('omniorchestrator.com')) {
        const subdomain = host.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
            return subdomain;
        }
    }
    
    // Strategy 3: Path prefix /tenant/{tenantId}
    const pathMatch = req.path.match(/^\/tenant\/([^\/]+)/);
    if (pathMatch) {
        return pathMatch[1];
    }
    
    // Strategy 4: X-Tenant-ID header
    const tenantHeader = req.get('X-Tenant-ID');
    if (tenantHeader) {
        return tenantHeader;
    }
    
    // Strategy 5: JWT token claim
    const authHeader = req.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.substring(7);
            const decoded = jwt.decode(token);
            if (decoded && decoded.tenantId) {
                return decoded.tenantId;
            }
        } catch (error) {
            console.warn('Failed to decode JWT for tenant ID:', error.message);
        }
    }
    
    // Strategy 6: Query parameter (for development/testing)
    if (req.query.tenantId) {
        return req.query.tenantId;
    }
    
    // Default tenant for development
    return process.env.DEFAULT_TENANT_ID || 'demo-company';
}

/**
 * Main tenant context middleware
 */
async function tenantContext(req, res, next) {
    try {
        // Extract tenant ID
        const tenantId = extractTenantId(req);
        
        if (!tenantId) {
            return res.status(400).json({
                success: false,
                error: 'Tenant identification required',
                details: 'Unable to identify tenant from request'
            });
        }
        
        // Load tenant configuration
        let tenant;
        try {
            tenant = await Tenant.findByTenantId(tenantId);
        } catch (error) {
            console.log('🔧 Development mode: Using mock tenant due to DB error');
        }
        
        // Development mode fallback
        if (!tenant && process.env.NODE_ENV === 'development') {
            tenant = {
                _id: 'dev-tenant-123',
                tenantId: tenantId,
                companyName: 'Demo Company',
                plan: {
                    type: 'Pro',
                    status: 'active',
                    features: ['ai-generation', 'advanced-analytics', 'video-creation']
                },
                isFeatureEnabled: () => true,
                getRemainingUsage: () => 1000
            };
        }
        
        if (!tenant) {
            return res.status(404).json({
                success: false,
                error: 'Tenant not found',
                details: `No active tenant found for ID: ${tenantId}`
            });
        }
        
        // Check tenant status
        if (tenant.plan.status !== 'active') {
            return res.status(403).json({
                success: false,
                error: 'Tenant account suspended',
                details: `Account status: ${tenant.plan.status}`
            });
        }
        
        // Attach tenant context to request
        req.tenant = tenant;
        req.tenantId = tenantId;
        
        // Set tenant-specific database connection namespace
        req.dbNamespace = `tenant_${tenantId}`;
        
        // Add tenant context to response headers for debugging
        if (process.env.NODE_ENV === 'development') {
            res.set('X-Tenant-ID', tenantId);
            res.set('X-Tenant-Plan', tenant.plan.type);
        }
        
        next();
    } catch (error) {
        console.error('Tenant context middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Tenant context initialization failed',
            details: error.message
        });
    }
}

/**
 * Feature gate middleware - checks if tenant has access to specific features
 */
function requireFeature(featureName) {
    return (req, res, next) => {
        if (!req.tenant) {
            return res.status(400).json({
                success: false,
                error: 'Tenant context required'
            });
        }
        
        if (!req.tenant.isFeatureEnabled(featureName)) {
            return res.status(403).json({
                success: false,
                error: 'Feature not available',
                details: `Feature '${featureName}' not included in ${req.tenant.plan.type} plan`,
                upgradeRequired: true,
                currentPlan: req.tenant.plan.type
            });
        }
        
        next();
    };
}

/**
 * Usage limit middleware - checks and enforces usage limits
 */
function checkUsageLimit(metric) {
    return async (req, res, next) => {
        if (!req.tenant) {
            return res.status(400).json({
                success: false,
                error: 'Tenant context required'
            });
        }
        
        const remaining = req.tenant.getRemainingUsage(metric);
        
        if (remaining <= 0) {
            return res.status(429).json({
                success: false,
                error: 'Usage limit exceeded',
                details: `Monthly ${metric} limit reached`,
                metric: metric,
                limit: req.tenant.aiConfig.restrictions[`max${metric.charAt(0).toUpperCase() + metric.slice(1)}PerMonth`],
                current: req.tenant.usage.currentMonth[`${metric}Generated`] || req.tenant.usage.currentMonth[`${metric}Used`],
                resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
                upgradeRequired: true
            });
        }
        
        // Add usage info to request
        req.usageInfo = {
            metric,
            remaining,
            limit: req.tenant.aiConfig.restrictions[`max${metric.charAt(0).toUpperCase() + metric.slice(1)}PerMonth`]
        };
        
        next();
    };
}

/**
 * Data isolation middleware - ensures data queries are scoped to tenant
 */
function enforceDataIsolation(req, res, next) {
    if (!req.tenant) {
        return res.status(400).json({
            success: false,
            error: 'Tenant context required for data access'
        });
    }
    
    // Add tenant filter to all database queries
    const originalQuery = req.query;
    req.query = {
        ...originalQuery,
        tenantId: req.tenantId
    };
    
    // Store original query for reference
    req.originalQuery = originalQuery;
    
    next();
}

/**
 * Dynamic configuration loader
 */
async function loadTenantConfig(req, res, next) {
    if (!req.tenant) {
        return res.status(400).json({
            success: false,
            error: 'Tenant context required'
        });
    }
    
    try {
        // Build tenant-specific configuration
        req.tenantConfig = {
            branding: req.tenant.branding,
            features: req.tenant.plan.features,
            limits: req.tenant.aiConfig.restrictions,
            integrations: req.tenant.integrations.filter(i => i.isActive),
            audienceSegments: req.tenant.audienceSegments,
            customFields: req.tenant.customFields,
            settings: req.tenant.settings,
            aiConfig: req.tenant.aiConfig
        };
        
        // Add computed properties
        req.tenantConfig.computed = {
            isTrialAccount: req.tenant.trial.isTrialActive,
            daysUntilTrialEnd: req.tenant.trial.isTrialActive 
                ? Math.ceil((req.tenant.trial.trialEndDate - new Date()) / (1000 * 60 * 60 * 24))
                : null,
            usagePercentages: {
                campaigns: Math.round((req.tenant.usage.currentMonth.campaignsGenerated / req.tenant.aiConfig.restrictions.maxCampaignsPerMonth) * 100),
                videos: Math.round((req.tenant.usage.currentMonth.videosGenerated / req.tenant.aiConfig.restrictions.maxVideosPerMonth) * 100),
                tokens: Math.round((req.tenant.usage.currentMonth.aiTokensUsed / req.tenant.aiConfig.restrictions.maxAITokensPerMonth) * 100)
            }
        };
        
        next();
    } catch (error) {
        console.error('Failed to load tenant configuration:', error);
        res.status(500).json({
            success: false,
            error: 'Configuration loading failed',
            details: error.message
        });
    }
}

/**
 * Audit logging middleware for tenant activities
 */
function auditLogger(action) {
    return (req, res, next) => {
        const originalSend = res.send;
        
        res.send = function(data) {
            // Log the activity
            if (req.tenant) {
                const auditLog = {
                    tenantId: req.tenantId,
                    userId: req.user?.id,
                    action: action,
                    resource: req.path,
                    method: req.method,
                    timestamp: new Date(),
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    success: res.statusCode < 400,
                    statusCode: res.statusCode
                };
                
                // In production, you'd send this to a logging service
                console.log('Audit Log:', JSON.stringify(auditLog));
                
                // Update tenant last activity
                req.tenant.lastActivity = new Date();
                req.tenant.save().catch(err => 
                    console.error('Failed to update tenant last activity:', err)
                );
            }
            
            originalSend.call(this, data);
        };
        
        next();
    };
}

/**
 * Tenant onboarding status middleware
 */
function checkOnboardingStatus(req, res, next) {
    if (!req.tenant) {
        return next();
    }
    
    // Skip onboarding check for onboarding endpoints
    if (req.path.includes('/onboarding') || req.path.includes('/setup')) {
        return next();
    }
    
    // If onboarding is not completed, redirect to onboarding
    if (!req.tenant.onboarding.isCompleted) {
        return res.status(202).json({
            success: false,
            error: 'Onboarding required',
            details: 'Please complete the setup process',
            redirectTo: '/onboarding',
            currentStep: req.tenant.onboarding.currentStep,
            completedSteps: req.tenant.onboarding.completedSteps
        });
    }
    
    next();
}

module.exports = {
    tenantContext,
    requireFeature,
    checkUsageLimit,
    enforceDataIsolation,
    loadTenantConfig,
    auditLogger,
    checkOnboardingStatus,
    TENANT_STRATEGIES
}; 