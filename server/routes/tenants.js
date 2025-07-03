const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');
const brandingService = require('../services/brandingService');

/**
 * GET /api/tenants/branding/css
 * Get custom CSS for the tenant - this is the magic that makes each company unique! 🎨
 */
router.get('/branding/css', async (req, res) => {
    try {
        // Extract tenant ID from various sources
        const tenantId = req.get('X-Tenant-ID') || req.query.tenantId || 'demo-company';
        
        // Load tenant
        const tenant = await Tenant.findOne({ tenantId }) || createDemoTenant(tenantId);
        
        // Generate custom CSS
        const customCSS = brandingService.generateCustomCSS(tenant);
        
        res.setHeader('Content-Type', 'text/css');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.send(customCSS);
    } catch (error) {
        console.error('Error generating custom CSS:', error);
        res.status(500).send('/* Error generating custom CSS */');
    }
});

/**
 * GET /api/tenants/current
 * Get current tenant configuration
 */
router.get('/current', async (req, res) => {
    try {
        const tenantId = req.get('X-Tenant-ID') || req.query.tenantId || 'demo-company';
        
        let tenant = await Tenant.findOne({ tenantId });
        if (!tenant) {
            tenant = createDemoTenant(tenantId);
        }
        
        res.json({
            success: true,
            data: {
                tenantId: tenant.tenantId,
                companyName: tenant.companyName,
                branding: tenant.branding,
                features: tenant.plan?.features || ['campaigns', 'videos', 'analytics'],
                usage: tenant.usage || { currentMonth: { campaignsGenerated: 12, videosGenerated: 3 } }
            }
        });
    } catch (error) {
        console.error('Error fetching tenant:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch tenant' });
    }
});

/**
 * Create demo tenant for testing different company configurations
 */
function createDemoTenant(tenantId) {
    // Different demo companies with unique branding
    const demoCompanies = {
        'tech-startup': {
            tenantId: 'tech-startup',
            companyName: 'TechFlow Solutions',
            industry: 'Technology',
            branding: {
                companyName: 'TechFlow Solutions',
                colors: {
                    primary: '#3b82f6',    // Blue
                    secondary: '#8b5cf6',  // Purple
                    accent: '#06d6a0',     // Teal
                    background: '#0f172a', // Dark blue
                    text: '#ffffff'
                },
                fonts: { primary: 'Inter', secondary: 'Inter' }
            }
        },
        'healthcare-corp': {
            tenantId: 'healthcare-corp',
            companyName: 'MediCare Plus',
            industry: 'Healthcare',
            branding: {
                companyName: 'MediCare Plus',
                colors: {
                    primary: '#10b981',    // Green
                    secondary: '#3b82f6',  // Blue
                    accent: '#f59e0b',     // Orange
                    background: '#064e3b', // Dark green
                    text: '#ffffff'
                },
                fonts: { primary: 'Inter', secondary: 'Inter' }
            }
        },
        'ecommerce-brand': {
            tenantId: 'ecommerce-brand',
            companyName: 'ShopSphere',
            industry: 'E-commerce',
            branding: {
                companyName: 'ShopSphere',
                colors: {
                    primary: '#ec4899',    // Pink
                    secondary: '#8b5cf6',  // Purple
                    accent: '#f59e0b',     // Orange
                    background: '#1f1123', // Dark purple
                    text: '#ffffff'
                },
                fonts: { primary: 'Inter', secondary: 'Inter' }
            }
        },
        'demo-company': {
            tenantId: 'demo-company',
            companyName: 'OmniOrchestrator Demo',
            industry: 'Technology',
            branding: {
                companyName: 'OmniOrchestrator Demo',
                colors: {
                    primary: '#667eea',
                    secondary: '#764ba2',
                    accent: '#f093fb',
                    background: '#0f0f23',
                    text: '#ffffff'
                },
                fonts: { primary: 'Inter', secondary: 'Inter' }
            }
        }
    };
    
    return demoCompanies[tenantId] || demoCompanies['demo-company'];
}

module.exports = router; 