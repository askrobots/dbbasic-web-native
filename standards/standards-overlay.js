/**
 * DBBasic Usability Standards Overlay System
 *
 * Visual overlay system to show usability standards on demo pages.
 * Prevents GeoCities 2.0 by teaching standards visually.
 *
 * Version: 1.0
 * Author: Dan Quellhorst / dbbasic.com
 */

class StandardsOverlay {
    constructor() {
        this.activeOverlays = new Set();
        this.initialized = false;
        this.overlayContainer = null;
        this.appType = null;
    }

    /**
     * Detect what type of application this is
     * Returns: 'brochure', 'app', or 'social'
     */
    detectApplicationType() {
        if (this.appType) return this.appType; // Cache result

        let brochureScore = 0;
        let appScore = 0;
        let socialScore = 0;

        // Check for brochure/marketing indicators
        if (document.querySelector('.hero, [class*="hero"]')) brochureScore += 3;
        if (document.querySelector('.pricing, [class*="pricing"]')) brochureScore += 2;
        if (document.querySelector('.testimonial, [class*="testimonial"]')) brochureScore += 2;
        if (document.querySelector('.cta, [class*="cta"], .btn-primary')) brochureScore += 1;
        const navLinks = document.querySelectorAll('nav a, header a');
        if (navLinks.length >= 3 && navLinks.length <= 7) brochureScore += 1;

        // Check for app/dashboard indicators
        if (document.querySelector('aside, .sidebar, [class*="sidebar"]')) appScore += 3;
        if (document.querySelector('table, .data-table, [class*="table"]')) appScore += 2;
        if (document.querySelector('.dashboard, [class*="dashboard"]')) appScore += 3;
        if (document.querySelector('input[type="search"], .search')) appScore += 1;
        if (document.querySelectorAll('form').length > 1) appScore += 1;
        if (document.querySelector('.breadcrumb, [class*="breadcrumb"]')) appScore += 2;

        // Check for social/content indicators
        if (document.querySelector('.feed, .post, [class*="feed"], [class*="post"]')) socialScore += 3;
        if (document.querySelector('.comment, [class*="comment"]')) socialScore += 2;
        if (document.querySelector('.like, .share, [class*="reaction"]')) socialScore += 2;
        if (document.querySelector('.avatar, [class*="avatar"]')) socialScore += 1;
        if (document.querySelector('.infinite-scroll, [data-infinite-scroll]')) socialScore += 2;

        // Determine winner
        const max = Math.max(brochureScore, appScore, socialScore);
        if (max === 0) {
            this.appType = 'brochure'; // Default
        } else if (brochureScore === max) {
            this.appType = 'brochure';
        } else if (appScore === max) {
            this.appType = 'app';
        } else {
            this.appType = 'social';
        }

        console.log(`📱 Detected app type: ${this.appType} (scores: brochure=${brochureScore}, app=${appScore}, social=${socialScore})`);
        return this.appType;
    }

    /**
     * Get standards for the detected app type
     */
    getAppTypeStandards() {
        const type = this.detectApplicationType();

        const standards = {
            brochure: {
                name: 'Brochure/Marketing',
                density: 'Low (airy)',
                spacing: '64-96px sections',
                navigation: 'Simple top bar',
                interaction: 'Scroll + Click',
                goal: 'Convert visitors'
            },
            app: {
                name: 'App/Dashboard',
                density: 'High (dense)',
                spacing: '24-32px sections',
                navigation: 'Persistent sidebar',
                interaction: 'Keyboard + Click',
                goal: 'Complete tasks'
            },
            social: {
                name: 'Social/Content',
                density: 'Medium',
                spacing: '16-24px posts',
                navigation: 'Sticky top bar',
                interaction: 'Scroll + React',
                goal: 'Engage users'
            }
        };

        return standards[type];
    }

    /**
     * Initialize the overlay system
     */
    init() {
        if (this.initialized) return;

        // Create main overlay container
        this.overlayContainer = document.createElement('div');
        this.overlayContainer.id = 'standards-overlay-container';
        this.overlayContainer.className = 'standards-overlay-container';
        document.body.appendChild(this.overlayContainer);

        // Listen for window resize to update overlays
        window.addEventListener('resize', () => this.refreshActiveOverlays());

        this.initialized = true;
        console.log('📐 DBBasic Standards Overlay initialized');
    }

    /**
     * Toggle a specific overlay type
     */
    toggle(type) {
        if (this.activeOverlays.has(type)) {
            this.hide(type);
        } else {
            this.show(type);
        }
    }

    /**
     * Show a specific overlay type
     */
    show(type) {
        if (!this.initialized) this.init();

        // Remove existing overlay of this type
        this.hide(type);

        // Create new overlay
        let overlay;
        switch(type) {
            case 'grid':
                overlay = this.createGridOverlay();
                break;
            case 'touch':
                overlay = this.createTouchZonesOverlay();
                break;
            case 'spacing':
                overlay = this.createSpacingOverlay();
                break;
            case 'flow':
                overlay = this.createVisualFlowOverlay();
                break;
            case 'targets':
                overlay = this.createTouchTargetsOverlay();
                break;
            case 'boundaries':
                overlay = this.createContentBoundariesOverlay();
                break;
            default:
                console.warn(`Unknown overlay type: ${type}`);
                return;
        }

        if (overlay) {
            overlay.dataset.overlayType = type;
            this.overlayContainer.appendChild(overlay);
            this.activeOverlays.add(type);
            console.log(`✅ Showing ${type} overlay`);

            // Show app type badge if this is the first overlay
            this.updateAppTypeBadge();
        }
    }

    /**
     * Show/update app type badge
     */
    updateAppTypeBadge() {
        if (this.activeOverlays.size === 0) {
            // Remove badge if no overlays active
            const existing = document.getElementById('app-type-badge');
            if (existing) existing.remove();
            return;
        }

        // Get or create badge
        let badge = document.getElementById('app-type-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'app-type-badge';
            badge.style.cssText = `
                position: fixed;
                top: 24px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(17, 24, 39, 0.95);
                backdrop-filter: blur(10px);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-family: 'Inter', -apple-system, sans-serif;
                z-index: 10001;
                pointer-events: none;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            `;
            document.body.appendChild(badge);
        }

        const standards = this.getAppTypeStandards();
        badge.innerHTML = `
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.7; margin-bottom: 4px;">
                Application Type
            </div>
            <div style="font-size: 14px; font-weight: 700; margin-bottom: 8px;">
                ${standards.name}
            </div>
            <div style="font-size: 12px; opacity: 0.9; display: grid; grid-template-columns: auto auto; gap: 4px 12px; text-align: left;">
                <span style="opacity: 0.7;">Density:</span> <span>${standards.density}</span>
                <span style="opacity: 0.7;">Spacing:</span> <span>${standards.spacing}</span>
                <span style="opacity: 0.7;">Navigation:</span> <span>${standards.navigation}</span>
                <span style="opacity: 0.7;">Goal:</span> <span>${standards.goal}</span>
            </div>
        `;
    }

    /**
     * Hide a specific overlay type
     */
    hide(type) {
        const existing = this.overlayContainer?.querySelector(`[data-overlay-type="${type}"]`);
        if (existing) {
            existing.remove();
            this.activeOverlays.delete(type);
            console.log(`❌ Hiding ${type} overlay`);

            // Update app type badge
            this.updateAppTypeBadge();
        }
    }

    /**
     * Show all overlays
     */
    showAll() {
        ['grid', 'touch', 'spacing', 'flow', 'targets', 'boundaries'].forEach(type => {
            this.show(type);
        });
    }

    /**
     * Hide all overlays
     */
    hideAll() {
        this.activeOverlays.forEach(type => this.hide(type));
        // Badge will be removed by updateAppTypeBadge() in hide()
    }

    /**
     * Refresh all active overlays (on resize)
     */
    refreshActiveOverlays() {
        const active = Array.from(this.activeOverlays);
        active.forEach(type => {
            this.hide(type);
            this.show(type);
        });
    }

    /**
     * Create 12-column grid overlay
     */
    createGridOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'standards-overlay grid-overlay';

        const width = window.innerWidth;
        let cols, gutter, margin;

        // Responsive column count
        if (width < 768) {
            cols = 4;
            gutter = 16;
            margin = 16;
        } else if (width < 1024) {
            cols = 8;
            gutter = 24;
            margin = 24;
        } else {
            cols = 12;
            gutter = 24;
            margin = 48;
        }

        // Create grid container
        const grid = document.createElement('div');
        grid.className = 'grid-container';
        grid.style.cssText = `
            position: fixed;
            top: 0;
            left: ${margin}px;
            right: ${margin}px;
            height: 100vh;
            display: grid;
            grid-template-columns: repeat(${cols}, 1fr);
            gap: ${gutter}px;
            pointer-events: none;
            z-index: 10000;
        `;

        // Create columns
        for (let i = 0; i < cols; i++) {
            const col = document.createElement('div');
            col.className = 'grid-column';
            col.style.cssText = `
                background: rgba(99, 102, 241, 0.1);
                border-left: 1px dashed rgba(99, 102, 241, 0.3);
                border-right: 1px dashed rgba(99, 102, 241, 0.3);
            `;
            grid.appendChild(col);
        }

        overlay.appendChild(grid);

        // Add annotation
        const annotation = this.createAnnotation(
            `${cols}-Column Grid`,
            `Gutter: ${gutter}px | Margin: ${margin}px`,
            'top-left'
        );
        overlay.appendChild(annotation);

        return overlay;
    }

    /**
     * Create touch zones overlay (mobile)
     */
    createTouchZonesOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'standards-overlay touch-zones-overlay';

        const height = window.innerHeight;
        const greenZoneHeight = height / 3; // Bottom 1/3
        const yellowZoneHeight = height / 3; // Middle 1/3
        const redZoneHeight = height / 3; // Top 1/3

        // Red zone (hard to reach)
        const redZone = document.createElement('div');
        redZone.className = 'touch-zone red-zone';
        redZone.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: ${redZoneHeight}px;
            background: rgba(239, 68, 68, 0.1);
            border-bottom: 2px dashed rgba(239, 68, 68, 0.5);
            pointer-events: none;
            z-index: 10000;
        `;
        overlay.appendChild(redZone);

        const redAnnotation = this.createAnnotation(
            '🔴 Hard to Reach Zone',
            'Avoid primary actions',
            'top-left',
            redZone
        );
        redAnnotation.style.top = '20px';
        redAnnotation.style.left = '20px';
        overlay.appendChild(redAnnotation);

        // Yellow zone (reachable with stretch)
        const yellowZone = document.createElement('div');
        yellowZone.className = 'touch-zone yellow-zone';
        yellowZone.style.cssText = `
            position: fixed;
            top: ${redZoneHeight}px;
            left: 0;
            right: 0;
            height: ${yellowZoneHeight}px;
            background: rgba(245, 158, 11, 0.1);
            border-bottom: 2px dashed rgba(245, 158, 11, 0.5);
            pointer-events: none;
            z-index: 10000;
        `;
        overlay.appendChild(yellowZone);

        const yellowAnnotation = this.createAnnotation(
            '🟡 Reachable Zone',
            'Content & secondary actions',
            'top-left',
            yellowZone
        );
        yellowAnnotation.style.top = `${redZoneHeight + 20}px`;
        yellowAnnotation.style.left = '20px';
        overlay.appendChild(yellowAnnotation);

        // Green zone (thumb-friendly)
        const greenZone = document.createElement('div');
        greenZone.className = 'touch-zone green-zone';
        greenZone.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: ${greenZoneHeight}px;
            background: rgba(34, 197, 94, 0.1);
            border-top: 2px dashed rgba(34, 197, 94, 0.5);
            pointer-events: none;
            z-index: 10000;
        `;
        overlay.appendChild(greenZone);

        const greenAnnotation = this.createAnnotation(
            '🟢 Thumb-Friendly Zone',
            'Primary actions & navigation',
            'bottom-left',
            greenZone
        );
        greenAnnotation.style.bottom = '20px';
        greenAnnotation.style.left = '20px';
        overlay.appendChild(greenAnnotation);

        return overlay;
    }

    /**
     * Create spacing units overlay
     */
    createSpacingOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'standards-overlay spacing-overlay';

        // Find all major elements and annotate their spacing
        const sections = document.querySelectorAll('section, .hero, .features, .pricing, .testimonials, [class*="section"]');

        sections.forEach((section, index) => {
            if (index === 0) return; // Skip first section

            const prevSection = sections[index - 1];
            const spacing = section.offsetTop - (prevSection.offsetTop + prevSection.offsetHeight);

            if (spacing > 0) {
                // Create spacing indicator
                const spacingIndicator = document.createElement('div');
                spacingIndicator.className = 'spacing-indicator';
                spacingIndicator.style.cssText = `
                    position: absolute;
                    top: ${prevSection.offsetTop + prevSection.offsetHeight}px;
                    left: 20px;
                    width: 40px;
                    height: ${spacing}px;
                    border-left: 2px solid rgba(168, 85, 247, 0.6);
                    border-right: 2px solid rgba(168, 85, 247, 0.6);
                    border-top: 2px solid rgba(168, 85, 247, 0.6);
                    border-bottom: 2px solid rgba(168, 85, 247, 0.6);
                    pointer-events: none;
                    z-index: 10000;
                `;

                const label = document.createElement('div');
                label.className = 'spacing-label';
                label.textContent = `${spacing}px`;
                label.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50px;
                    transform: translateY(-50%);
                    background: rgba(168, 85, 247, 0.9);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 600;
                    white-space: nowrap;
                    font-family: 'Inter', -apple-system, sans-serif;
                `;
                spacingIndicator.appendChild(label);
                overlay.appendChild(spacingIndicator);
            }
        });

        // Add general annotation
        const annotation = this.createAnnotation(
            '📏 Spacing Units',
            'Measured in 8px increments',
            'top-right'
        );
        overlay.appendChild(annotation);

        return overlay;
    }

    /**
     * Create visual flow overlay (F-pattern or Z-pattern)
     */
    createVisualFlowOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'standards-overlay visual-flow-overlay';

        // Detect if this is a hero/marketing section (Z-pattern) or content (F-pattern)
        const hero = document.querySelector('.hero, [class*="hero"]');

        if (hero) {
            // Z-pattern for hero section
            const canvas = document.createElement('canvas');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                pointer-events: none;
                z-index: 10000;
            `;

            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 10]);

            // Draw Z pattern
            const startX = 100;
            const startY = 100;
            const endX = canvas.width - 100;
            const midY = canvas.height / 3;
            const endY = canvas.height / 2;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, startY); // Top horizontal
            ctx.lineTo(startX, midY); // Diagonal
            ctx.lineTo(endX, midY); // Bottom horizontal
            ctx.stroke();

            // Add arrow heads
            this.drawArrow(ctx, endX - 20, startY, 0);
            this.drawArrow(ctx, endX - 20, midY, 0);

            overlay.appendChild(canvas);

            const annotation = this.createAnnotation(
                '📐 Z-Pattern Flow',
                'Marketing/landing page scan pattern',
                'top-left'
            );
            overlay.appendChild(annotation);
        } else {
            // F-pattern for content
            const annotation = this.createAnnotation(
                '📐 F-Pattern Flow',
                'Content-heavy page scan pattern',
                'top-left'
            );
            overlay.appendChild(annotation);
        }

        return overlay;
    }

    /**
     * Create touch targets overlay (shows 44×44px minimum zones)
     */
    createTouchTargetsOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'standards-overlay touch-targets-overlay';

        // Find all interactive elements
        const interactiveElements = document.querySelectorAll(
            'button, a, input, [role="button"], [onclick], [tabindex="0"]'
        );

        let violations = 0;

        interactiveElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            const isMobile = window.innerWidth < 768;
            const minSize = isMobile ? 44 : 32;

            // Check if touch target is too small
            const isTooSmall = width < minSize || height < minSize;

            if (rect.top >= 0 && rect.top < window.innerHeight) { // Only show visible elements
                const highlighter = document.createElement('div');
                highlighter.className = 'touch-target-highlighter';
                highlighter.style.cssText = `
                    position: absolute;
                    top: ${window.scrollY + rect.top}px;
                    left: ${rect.left}px;
                    width: ${rect.width}px;
                    height: ${rect.height}px;
                    border: 2px solid ${isTooSmall ? '#dc2626' : '#22c55e'};
                    background: ${isTooSmall ? 'rgba(220, 38, 38, 0.1)' : 'rgba(34, 197, 94, 0.1)'};
                    pointer-events: none;
                    z-index: 10000;
                `;

                // Add size label
                const label = document.createElement('div');
                label.className = 'size-label';
                label.textContent = `${Math.round(width)}×${Math.round(height)}px`;
                label.style.cssText = `
                    position: absolute;
                    top: -24px;
                    left: 0;
                    background: ${isTooSmall ? '#dc2626' : '#22c55e'};
                    color: white;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 600;
                    white-space: nowrap;
                    font-family: 'Inter', -apple-system, sans-serif;
                `;
                highlighter.appendChild(label);
                overlay.appendChild(highlighter);

                if (isTooSmall) violations++;
            }
        });

        // Add summary annotation
        const annotation = this.createAnnotation(
            '🎯 Touch Targets',
            `Min: ${window.innerWidth < 768 ? '44×44px' : '32×32px'} | Violations: ${violations}`,
            'top-right'
        );
        overlay.appendChild(annotation);

        return overlay;
    }

    /**
     * Create content boundaries overlay (max-widths, safe areas)
     */
    createContentBoundariesOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'standards-overlay content-boundaries-overlay';

        // Show max-width containers
        const containers = document.querySelectorAll('.container, [class*="container"], main, article');

        containers.forEach(container => {
            const rect = container.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(container);
            const maxWidth = computedStyle.maxWidth;

            if (maxWidth && maxWidth !== 'none') {
                const boundary = document.createElement('div');
                boundary.className = 'content-boundary';
                boundary.style.cssText = `
                    position: absolute;
                    top: ${window.scrollY + rect.top}px;
                    left: ${rect.left}px;
                    width: ${rect.width}px;
                    height: ${rect.height}px;
                    border: 2px dashed rgba(124, 58, 237, 0.5);
                    pointer-events: none;
                    z-index: 10000;
                `;

                const label = document.createElement('div');
                label.textContent = `max-width: ${maxWidth}`;
                label.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(124, 58, 237, 0.9);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 600;
                    font-family: 'Inter', -apple-system, sans-serif;
                `;
                boundary.appendChild(label);
                overlay.appendChild(boundary);
            }
        });

        const annotation = this.createAnnotation(
            '📦 Content Boundaries',
            'Max-width containers for readability',
            'top-right'
        );
        overlay.appendChild(annotation);

        return overlay;
    }

    /**
     * Helper: Create annotation label
     */
    createAnnotation(title, description, position = 'top-left', parentElement = null) {
        const annotation = document.createElement('div');
        annotation.className = `standards-annotation ${position}`;
        annotation.innerHTML = `
            <div class="annotation-title">${title}</div>
            <div class="annotation-description">${description}</div>
        `;

        const positions = {
            'top-left': 'top: 20px; left: 20px;',
            'top-right': 'top: 20px; right: 20px;',
            'bottom-left': 'bottom: 20px; left: 20px;',
            'bottom-right': 'bottom: 20px; right: 20px;'
        };

        annotation.style.cssText = `
            position: fixed;
            ${positions[position] || positions['top-left']}
            background: rgba(17, 24, 39, 0.95);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: 'Inter', -apple-system, sans-serif;
            z-index: 10001;
            pointer-events: none;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        `;

        return annotation;
    }

    /**
     * Helper: Draw arrow on canvas
     */
    drawArrow(ctx, x, y, angle) {
        const headLength = 15;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-headLength, -headLength/2);
        ctx.lineTo(-headLength, headLength/2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(99, 102, 241, 0.6)';
        ctx.fill();
        ctx.restore();
    }
}

// Initialize global instance
window.standardsOverlay = new StandardsOverlay();

// Keyboard shortcut: Ctrl+Shift+S to toggle all overlays
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        if (window.standardsOverlay.activeOverlays.size > 0) {
            window.standardsOverlay.hideAll();
        } else {
            window.standardsOverlay.showAll();
        }
    }
});

console.log('📐 DBBasic Standards Overlay loaded. Use Ctrl+Shift+S to toggle all overlays.');
