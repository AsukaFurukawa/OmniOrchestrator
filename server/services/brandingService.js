/**
 * Dynamic Branding Service
 * Generates custom CSS, themes, and UI configurations for each tenant
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class BrandingService {
    constructor() {
        this.cssCache = new Map();
        this.themeCache = new Map();
    }

    /**
     * Generate custom CSS for a tenant based on their branding configuration
     */
    generateCustomCSS(tenant) {
        const branding = tenant.branding;
        const colors = branding.colors;
        const fonts = branding.fonts;
        
        // Create a cache key based on branding configuration
        const cacheKey = crypto.createHash('md5')
            .update(JSON.stringify(branding))
            .digest('hex');
        
        // Return cached CSS if available
        if (this.cssCache.has(cacheKey)) {
            return this.cssCache.get(cacheKey);
        }
        
        // Generate custom CSS
        const customCSS = `
        /* Custom CSS for ${branding.companyName} */
        :root {
            /* Brand Colors */
            --brand-primary: ${colors.primary};
            --brand-secondary: ${colors.secondary};
            --brand-accent: ${colors.accent};
            --brand-background: ${colors.background};
            --brand-text: ${colors.text};
            --brand-success: ${colors.success};
            --brand-warning: ${colors.warning};
            --brand-error: ${colors.error};
            
            /* Computed Colors with Alpha */
            --brand-primary-10: ${this.hexToRgbA(colors.primary, 0.1)};
            --brand-primary-20: ${this.hexToRgbA(colors.primary, 0.2)};
            --brand-primary-30: ${this.hexToRgbA(colors.primary, 0.3)};
            --brand-primary-50: ${this.hexToRgbA(colors.primary, 0.5)};
            --brand-primary-80: ${this.hexToRgbA(colors.primary, 0.8)};
            
            --brand-secondary-10: ${this.hexToRgbA(colors.secondary, 0.1)};
            --brand-secondary-20: ${this.hexToRgbA(colors.secondary, 0.2)};
            --brand-secondary-30: ${this.hexToRgbA(colors.secondary, 0.3)};
            
            /* Fonts */
            --brand-font-primary: '${fonts.primary}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            --brand-font-secondary: '${fonts.secondary}', Georgia, serif;
        }
        
        /* Override default gradients with brand colors */
        .premium-gradient-text {
            background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary), var(--brand-accent)) !important;
            background-size: 300% 300% !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
        }
        
        /* Custom neon buttons with brand colors */
        .neon-btn {
            background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%) !important;
            box-shadow: 
                0 4px 15px var(--brand-primary-30),
                0 0 20px var(--brand-primary-20) !important;
        }
        
        .neon-btn:hover {
            box-shadow: 
                0 8px 25px var(--brand-primary-50),
                0 0 40px var(--brand-primary-30) !important;
        }
        
        /* Holographic cards with brand colors */
        .holographic-card {
            border-image: linear-gradient(135deg, 
                var(--brand-primary), 
                var(--brand-secondary), 
                var(--brand-accent), 
                var(--brand-primary)) 1 !important;
        }
        
        .holographic-card::before {
            background: conic-gradient(from 0deg at 50% 50%, 
                transparent 0deg,
                var(--brand-primary-10) 60deg,
                var(--brand-secondary-10) 120deg,
                transparent 180deg,
                var(--brand-accent-10) 240deg,
                var(--brand-primary-10) 300deg,
                transparent 360deg) !important;
        }
        
        /* Navigation with brand colors */
        .nav-link:hover, .nav-link.active {
            background: linear-gradient(135deg, var(--brand-primary-30), var(--brand-secondary-30)) !important;
            box-shadow: 0 4px 15px var(--brand-primary-30) !important;
        }
        
        .nav-link::after {
            background: linear-gradient(90deg, var(--brand-primary), var(--brand-secondary)) !important;
        }
        
        /* Progress bars with brand colors */
        .neon-progress-bar {
            background: linear-gradient(90deg, var(--brand-primary), var(--brand-secondary)) !important;
        }
        
        /* Success/Warning/Error colors */
        .text-green-400, .text-success {
            color: var(--brand-success) !important;
        }
        
        .text-yellow-400, .text-warning {
            color: var(--brand-warning) !important;
        }
        
        .text-red-400, .text-error {
            color: var(--brand-error) !important;
        }
        
        /* Custom background gradient */
        body {
            background: linear-gradient(135deg, 
                var(--brand-background) 0%, 
                ${this.darkenColor(colors.background, 10)} 25%, 
                ${this.lightenColor(colors.background, 5)} 50%, 
                ${this.darkenColor(colors.background, 15)} 75%, 
                var(--brand-background) 100%) !important;
        }
        
        /* Font overrides */
        body, .font-primary {
            font-family: var(--brand-font-primary) !important;
        }
        
        .font-secondary {
            font-family: var(--brand-font-secondary) !important;
        }
        
        /* Company logo in navigation */
        .brand-logo {
            background-image: url('${branding.logo?.url || ''}');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
        }
        
        /* Custom CSS overrides */
        ${branding.customCSS || ''}
        `;
        
        // Cache the generated CSS
        this.cssCache.set(cacheKey, customCSS);
        
        return customCSS;
    }
    
    /**
     * Generate theme configuration for a tenant
     */
    generateThemeConfig(tenant) {
        const branding = tenant.branding;
        const cacheKey = `theme_${tenant.tenantId}`;
        
        if (this.themeCache.has(cacheKey)) {
            return this.themeCache.get(cacheKey);
        }
        
        const themeConfig = {
            name: `${branding.companyName} Theme`,
            colors: {
                primary: branding.colors.primary,
                secondary: branding.colors.secondary,
                accent: branding.colors.accent,
                background: branding.colors.background,
                text: branding.colors.text,
                success: branding.colors.success,
                warning: branding.colors.warning,
                error: branding.colors.error,
                
                // Generated shades
                primaryShades: this.generateColorShades(branding.colors.primary),
                secondaryShades: this.generateColorShades(branding.colors.secondary),
                accentShades: this.generateColorShades(branding.colors.accent)
            },
            fonts: {
                primary: branding.fonts.primary,
                secondary: branding.fonts.secondary,
                sizes: {
                    xs: '0.75rem',
                    sm: '0.875rem',
                    base: '1rem',
                    lg: '1.125rem',
                    xl: '1.25rem',
                    '2xl': '1.5rem',
                    '3xl': '1.875rem',
                    '4xl': '2.25rem',
                    '5xl': '3rem'
                }
            },
            spacing: {
                xs: '0.25rem',
                sm: '0.5rem',
                md: '1rem',
                lg: '1.5rem',
                xl: '2rem',
                '2xl': '3rem'
            },
            borderRadius: {
                sm: '0.375rem',
                md: '0.5rem',
                lg: '0.75rem',
                xl: '1rem',
                '2xl': '1.5rem',
                full: '9999px'
            },
            animations: {
                duration: {
                    fast: '150ms',
                    normal: '300ms',
                    slow: '500ms'
                },
                easing: {
                    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    in: 'cubic-bezier(0.4, 0, 1, 1)',
                    out: 'cubic-bezier(0, 0, 0.2, 1)',
                    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
                }
            }
        };
        
        this.themeCache.set(cacheKey, themeConfig);
        return themeConfig;
    }
    
    /**
     * Generate UI component configurations
     */
    generateComponentConfig(tenant) {
        const branding = tenant.branding;
        
        return {
            logo: {
                url: branding.logo?.url,
                alt: `${branding.companyName} Logo`,
                maxHeight: '40px',
                showInNav: !!branding.logo?.url
            },
            navigation: {
                showLogo: !!branding.logo?.url,
                companyName: branding.companyName,
                style: 'modern', // modern, classic, minimal
                position: 'top' // top, side
            },
            dashboard: {
                welcomeMessage: `Welcome back to ${branding.companyName}!`,
                showCompanyName: true,
                layout: 'grid', // grid, list, cards
                cardStyle: 'holographic' // flat, elevated, holographic
            },
            forms: {
                style: 'modern', // modern, classic, minimal
                validation: 'inline', // inline, summary
                submitButtonStyle: 'gradient' // solid, gradient, outline
            },
            notifications: {
                position: 'top-right', // top-left, top-right, bottom-left, bottom-right
                style: 'modern', // classic, modern, minimal
                duration: 4000
            },
            charts: {
                colorScheme: [
                    branding.colors.primary,
                    branding.colors.secondary,
                    branding.colors.accent,
                    branding.colors.success,
                    branding.colors.warning
                ],
                style: 'modern' // classic, modern, minimal
            }
        };
    }
    
    /**
     * Generate favicon and app icons
     */
    async generateAppIcons(tenant) {
        // In a real implementation, you'd generate different sizes of icons
        // based on the company logo or use a default branded template
        
        return {
            favicon: tenant.branding.favicon || '/favicon.ico',
            appleTouchIcon: tenant.branding.logo?.url || '/apple-touch-icon.png',
            icon192: tenant.branding.logo?.url || '/icon-192x192.png',
            icon512: tenant.branding.logo?.url || '/icon-512x512.png'
        };
    }
    
    /**
     * Generate SEO and meta tags
     */
    generateMetaTags(tenant) {
        const branding = tenant.branding;
        
        return {
            title: `${branding.companyName} - AI Marketing Platform`,
            description: `Transform your marketing with ${branding.companyName}'s AI-powered platform. Generate campaigns, create videos, and analyze performance with cutting-edge technology.`,
            keywords: `ai marketing, ${branding.companyName}, marketing automation, campaign generation, video creation, analytics`,
            ogTitle: `${branding.companyName} Marketing Dashboard`,
            ogDescription: `AI-powered marketing platform for ${branding.companyName}`,
            ogImage: branding.logo?.url || '/og-image.png',
            twitterCard: 'summary_large_image',
            themeColor: branding.colors.primary
        };
    }
    
    /**
     * Utility functions
     */
    
    hexToRgbA(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    darkenColor(hex, percent) {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    lightenColor(hex, percent) {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    generateColorShades(baseColor) {
        return {
            50: this.lightenColor(baseColor, 45),
            100: this.lightenColor(baseColor, 35),
            200: this.lightenColor(baseColor, 25),
            300: this.lightenColor(baseColor, 15),
            400: this.lightenColor(baseColor, 5),
            500: baseColor,
            600: this.darkenColor(baseColor, 5),
            700: this.darkenColor(baseColor, 15),
            800: this.darkenColor(baseColor, 25),
            900: this.darkenColor(baseColor, 35)
        };
    }
    
    /**
     * Clear cache for a specific tenant
     */
    clearTenantCache(tenantId) {
        // Clear CSS cache
        for (const [key, value] of this.cssCache.entries()) {
            if (key.includes(tenantId)) {
                this.cssCache.delete(key);
            }
        }
        
        // Clear theme cache
        this.themeCache.delete(`theme_${tenantId}`);
    }
    
    /**
     * Generate complete branding package for a tenant
     */
    async generateBrandingPackage(tenant) {
        const [css, theme, components, icons, meta] = await Promise.all([
            this.generateCustomCSS(tenant),
            this.generateThemeConfig(tenant),
            this.generateComponentConfig(tenant),
            this.generateAppIcons(tenant),
            this.generateMetaTags(tenant)
        ]);
        
        return {
            css,
            theme,
            components,
            icons,
            meta,
            cacheKey: crypto.createHash('md5')
                .update(JSON.stringify(tenant.branding))
                .digest('hex'),
            generatedAt: new Date().toISOString()
        };
    }
}

module.exports = new BrandingService(); 