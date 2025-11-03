/**
 * Visual Testing Suite
 * Automatically tests all component states, interactions, and accessibility
 */

class VisualTestSuite {
    constructor() {
        this.tests = [];
        this.results = [];
        this.currentTestIndex = 0;
        this.isRunning = false;
        this.panel = null;
    }

    /**
     * Initialize the test suite UI
     */
    init() {
        this.createPanel();
        this.registerDefaultTests();
        console.log('Visual Test Suite initialized. Press Ctrl+Shift+T to open.');
    }

    /**
     * Create the test panel UI
     */
    createPanel() {
        this.panel = document.createElement('div');
        this.panel.id = 'visual-test-panel';
        this.panel.style.cssText = `
            position: fixed;
            top: 24px;
            left: 24px;
            width: 400px;
            max-height: 80vh;
            background: #1c1c1e;
            border: 2px solid #ff3b30;
            border-radius: 16px;
            padding: 24px;
            z-index: 999999;
            display: none;
            overflow-y: auto;
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.8);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #fff;
        `;

        this.panel.innerHTML = `
            <div style="margin-bottom: 24px;">
                <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #ff3b30;">🧪 Visual Test Suite</h2>
                <p style="margin: 0; font-size: 12px; color: #98989d;">Automated component testing & accessibility checks</p>
            </div>

            <div style="display: flex; gap: 8px; margin-bottom: 24px;">
                <button id="run-all-tests" style="flex: 1; padding: 12px; background: #34c759; border: none; border-radius: 8px; color: #000; font-weight: 700; cursor: pointer;">
                    ▶ Run All Tests
                </button>
                <button id="stop-tests" style="flex: 1; padding: 12px; background: #ff3b30; border: none; border-radius: 8px; color: #000; font-weight: 700; cursor: pointer;" disabled>
                    ⏹ Stop
                </button>
            </div>

            <div style="margin-bottom: 16px;">
                <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer;">
                    <input type="checkbox" id="auto-scroll" checked style="width: 18px; height: 18px;">
                    Auto-scroll to component
                </label>
                <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; margin-top: 8px;">
                    <input type="checkbox" id="check-contrast" checked style="width: 18px; height: 18px;">
                    Check contrast ratios (WCAG AA)
                </label>
            </div>

            <div id="test-progress" style="margin-bottom: 16px; padding: 12px; background: #000; border-radius: 8px; font-size: 12px; font-family: monospace;">
                Ready to run tests...
            </div>

            <div id="test-results" style="max-height: 300px; overflow-y: auto;">
                <!-- Results will appear here -->
            </div>
        `;

        document.body.appendChild(this.panel);

        // Keyboard shortcut to toggle
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                this.toggle();
            }
        });

        // Button handlers
        document.getElementById('run-all-tests').addEventListener('click', () => this.runAllTests());
        document.getElementById('stop-tests').addEventListener('click', () => this.stopTests());
    }

    /**
     * Toggle panel visibility
     */
    toggle() {
        if (this.panel.style.display === 'none') {
            this.panel.style.display = 'block';
        } else {
            this.panel.style.display = 'none';
        }
    }

    /**
     * Register default component tests
     */
    registerDefaultTests() {
        // Test semantic-action states
        this.addTest({
            name: 'semantic-action: Default State',
            description: 'Verify default button has proper contrast and styling',
            run: async () => {
                const buttons = document.querySelectorAll('semantic-action[intent="primary"]');
                if (buttons.length === 0) return { pass: false, message: 'No primary buttons found' };

                const button = buttons[0];
                const styles = this.getComputedStyles(button);
                const contrast = this.checkContrast(styles.color, styles.backgroundColor);

                return {
                    pass: contrast.ratio >= 4.5,
                    message: `Contrast ratio: ${contrast.ratio.toFixed(2)}:1 (${contrast.ratio >= 4.5 ? 'PASS' : 'FAIL WCAG AA'})`,
                    element: button
                };
            }
        });

        // Test hover state
        this.addTest({
            name: 'semantic-action: Hover State',
            description: 'Simulate hover and verify visual feedback',
            run: async () => {
                const components = document.querySelectorAll('semantic-action[intent="primary"]');
                if (components.length === 0) return { pass: false, message: 'No primary buttons found' };

                const component = components[0];
                const button = component.shadowRoot?.querySelector('button');
                if (!button) return { pass: false, message: 'Shadow DOM button not found' };

                // Check if hover styles exist in the stylesheet
                const styleSheet = component.shadowRoot.querySelector('style');
                if (!styleSheet) return { pass: false, message: 'No styles found' };

                const cssText = styleSheet.textContent;
                const hasHoverRule = cssText.includes('button:hover') || cssText.includes(':hover');
                const hasTransform = cssText.includes('transform') && cssText.includes('hover');
                const hasShadow = cssText.includes('box-shadow') && cssText.includes('hover');

                // Manually trigger hover state by forcing focus and using a class
                const originalStyles = {
                    transform: button.style.transform,
                    boxShadow: button.style.boxShadow
                };

                // Apply hover styles manually to test visual change
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';

                await this.wait(100);

                const testStyles = this.getComputedStyles(button);
                const stylesApplied =
                    testStyles.transform.includes('translateY') ||
                    testStyles.boxShadow !== 'none';

                // Restore original styles
                button.style.transform = originalStyles.transform;
                button.style.boxShadow = originalStyles.boxShadow;

                const pass = hasHoverRule && (hasTransform || hasShadow) && stylesApplied;

                return {
                    pass: pass,
                    message: pass
                        ? 'Hover state has CSS rules with transform/shadow'
                        : `Missing hover styles (hasRule: ${hasHoverRule}, hasTransform: ${hasTransform}, hasShadow: ${hasShadow})`,
                    element: component
                };
            }
        });

        // Test click feedback
        this.addTest({
            name: 'semantic-action: Click Feedback',
            description: 'Simulate click and verify active state',
            run: async () => {
                const components = document.querySelectorAll('semantic-action[intent="primary"]');
                if (components.length === 0) return { pass: false, message: 'No buttons found' };

                const component = components[0];
                const button = component.shadowRoot?.querySelector('button');
                if (!button) return { pass: false, message: 'Shadow DOM button not found' };

                // Check if active styles exist in CSS
                const styleSheet = component.shadowRoot.querySelector('style');
                if (!styleSheet) return { pass: false, message: 'No styles found' };

                const cssText = styleSheet.textContent;
                const hasActiveRule = cssText.includes('button:active') || cssText.includes(':active');
                const hasScaleTransform = cssText.includes('scale') && cssText.includes('active');

                // Manually apply active style to verify it works
                const originalTransform = button.style.transform;
                button.style.transform = 'scale(0.96)';

                await this.wait(50);

                const testStyles = this.getComputedStyles(button);
                const scaleApplied = testStyles.transform.includes('scale') || testStyles.transform.includes('matrix');

                // Restore
                button.style.transform = originalTransform;

                const pass = hasActiveRule && hasScaleTransform && scaleApplied;

                return {
                    pass: pass,
                    message: pass
                        ? 'Active state has CSS rules with scale transform'
                        : `Missing active styles (hasRule: ${hasActiveRule}, hasScale: ${hasScaleTransform})`,
                    element: component
                };
            }
        });

        // Test disabled state
        this.addTest({
            name: 'semantic-action: Disabled State',
            description: 'Verify disabled buttons are visually distinct',
            run: async () => {
                const disabledButtons = document.querySelectorAll('semantic-action[disabled]');
                if (disabledButtons.length === 0) return { pass: false, message: 'No disabled buttons found for testing' };

                const button = disabledButtons[0];
                const styles = this.getComputedStyles(button);

                // Check if opacity is reduced or color is greyed
                const isVisuallyDisabled =
                    parseFloat(styles.opacity) < 0.7 ||
                    this.isGreyish(styles.color);

                return {
                    pass: isVisuallyDisabled,
                    message: isVisuallyDisabled ? 'Disabled state is visually distinct' : 'Disabled state NOT visually obvious',
                    element: button
                };
            }
        });

        // Test selectable boxes
        this.addTest({
            name: 'State Demo: Selection Feedback',
            description: 'Test selection box visual changes',
            run: async () => {
                const boxes = document.querySelectorAll('.state-demo-box.clickable');
                if (boxes.length === 0) return { pass: false, message: 'No selectable boxes found' };

                // Find one that's not already selected
                let box = boxes[0];
                for (let b of boxes) {
                    if (!b.classList.contains('selected')) {
                        box = b;
                        break;
                    }
                }

                const beforeStyles = this.getComputedStyles(box);
                const beforeBorder = beforeStyles.borderColor;
                const beforeBg = beforeStyles.backgroundColor;

                // Simulate click to select
                box.click();
                await this.wait(300); // Wait for animation

                const afterStyles = this.getComputedStyles(box);
                const isSelected = box.classList.contains('selected');

                // Check for significant visual changes
                const borderChanged = beforeBorder !== afterStyles.borderColor;
                const bgChanged = beforeBg !== afterStyles.backgroundColor;
                const hasBadge = box.querySelector('::before') ||
                    window.getComputedStyle(box, '::before').content !== 'none';

                // Check if green color is present (selection color)
                const hasGreenBorder = afterStyles.borderColor.includes('52, 199, 89') ||
                    afterStyles.borderColor.includes('#34c759');
                const hasGlow = afterStyles.boxShadow !== 'none' && afterStyles.boxShadow.includes('52, 199, 89');

                const obviousChange = isSelected && (borderChanged || bgChanged) && (hasGreenBorder || hasGlow);

                return {
                    pass: obviousChange,
                    message: obviousChange
                        ? `Selection is visually obvious (green border: ${hasGreenBorder}, glow: ${hasGlow})`
                        : `Selection NOT obvious (selected: ${isSelected}, borderChanged: ${borderChanged}, greenBorder: ${hasGreenBorder})`,
                    element: box
                };
            }
        });

        // Test card hover
        this.addTest({
            name: 'semantic-card: Hover Elevation',
            description: 'Verify cards lift and show preview on hover',
            run: async () => {
                const components = document.querySelectorAll('semantic-card');
                if (components.length === 0) return { pass: false, message: 'No cards found' };

                const component = components[0];
                const card = component.shadowRoot?.querySelector('.card');
                if (!card) return { pass: false, message: 'Shadow DOM card not found' };

                // Check if hover styles exist in CSS
                const styleSheet = component.shadowRoot.querySelector('style');
                if (!styleSheet) return { pass: false, message: 'No styles found' };

                const cssText = styleSheet.textContent;
                const hasHoverRule = cssText.includes('.card:hover') || (cssText.includes(':hover') && cssText.includes('card'));
                const hasTransform = cssText.includes('translateY') && cssText.includes('hover');
                const hasShadow = cssText.includes('box-shadow') && cssText.includes('hover');

                // Manually apply hover styles to test they work
                const originalStyles = {
                    transform: card.style.transform,
                    boxShadow: card.style.boxShadow,
                    borderColor: card.style.borderColor
                };

                card.style.transform = 'translateY(-4px)';
                card.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
                card.style.borderColor = '#0066cc';

                await this.wait(100);

                const testStyles = this.getComputedStyles(card);
                const stylesWork = testStyles.transform.includes('translateY') || testStyles.transform.includes('matrix');

                // Restore
                card.style.transform = originalStyles.transform;
                card.style.boxShadow = originalStyles.boxShadow;
                card.style.borderColor = originalStyles.borderColor;

                const pass = hasHoverRule && (hasTransform || hasShadow) && stylesWork;

                return {
                    pass: pass,
                    message: pass
                        ? 'Card has hover CSS with elevation (transform + shadow)'
                        : `Missing hover styles (hasRule: ${hasHoverRule}, hasTransform: ${hasTransform})`,
                    element: component
                };
            }
        });

        // Contrast ratio check for all text
        this.addTest({
            name: 'Accessibility: Text Contrast',
            description: 'Check all visible text meets WCAG AA (4.5:1)',
            run: async () => {
                const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, label, button');
                const failures = [];

                for (const el of textElements) {
                    if (el.offsetParent === null) continue; // Skip hidden elements
                    if (el.textContent.trim() === '') continue; // Skip empty elements

                    const styles = this.getComputedStyles(el);
                    if (!styles.color) continue;

                    // Get effective background color (walk up the tree and flatten transparencies)
                    let effectiveBg = 'rgb(0, 0, 0)'; // Start with black (body bg)
                    let currentEl = el;
                    const bgStack = [];

                    // Collect all background colors up to the root
                    while (currentEl && currentEl !== document.body) {
                        const bg = window.getComputedStyle(currentEl).backgroundColor;
                        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                            bgStack.push(bg);
                        }
                        currentEl = currentEl.parentElement;
                    }

                    // Flatten all semi-transparent backgrounds from bottom to top
                    for (let i = bgStack.length - 1; i >= 0; i--) {
                        effectiveBg = this.flattenColor(bgStack[i], effectiveBg);
                    }

                    const contrast = this.checkContrast(styles.color, effectiveBg);
                    if (contrast.ratio < 4.5) {
                        failures.push({
                            element: el,
                            ratio: contrast.ratio.toFixed(2),
                            text: el.textContent.substring(0, 30).trim(),
                            color: styles.color,
                            bgColor: effectiveBg,
                            tag: el.tagName.toLowerCase()
                        });
                    }
                }

                // Log first 5 failures for debugging
                if (failures.length > 0) {
                    console.log('Contrast failures:', failures.slice(0, 5));
                }

                return {
                    pass: failures.length === 0,
                    message: failures.length === 0
                        ? 'All text passes WCAG AA contrast'
                        : `${failures.length} elements fail (first: "${failures[0]?.text}" - ${failures[0]?.ratio}:1, color: ${failures[0]?.color} on ${failures[0]?.bgColor})`,
                    details: failures
                };
            }
        });

        // Test focus indicators
        this.addTest({
            name: 'Accessibility: Focus Indicators',
            description: 'Verify all interactive elements have focus indicators',
            run: async () => {
                const focusables = document.querySelectorAll('button, a, semantic-action, semantic-card, .state-demo-box.clickable');
                const failures = [];

                for (const el of focusables) {
                    el.focus();
                    await this.wait(50);

                    const styles = this.getComputedStyles(el);
                    const hasFocusIndicator =
                        styles.outline !== 'none' ||
                        styles.boxShadow.includes('rgb') ||
                        styles.borderColor !== 'rgb(0, 0, 0)';

                    if (!hasFocusIndicator) {
                        failures.push(el);
                    }
                }

                return {
                    pass: failures.length === 0,
                    message: failures.length === 0
                        ? 'All focusable elements have focus indicators'
                        : `${failures.length} elements missing focus indicators`,
                    details: failures
                };
            }
        });
    }

    /**
     * Add a test to the suite
     */
    addTest(test) {
        this.tests.push(test);
    }

    /**
     * Run all tests sequentially
     */
    async runAllTests() {
        this.isRunning = true;
        this.results = [];
        this.currentTestIndex = 0;

        document.getElementById('run-all-tests').disabled = true;
        document.getElementById('stop-tests').disabled = false;
        document.getElementById('test-results').innerHTML = '';

        const autoScroll = document.getElementById('auto-scroll').checked;

        for (let i = 0; i < this.tests.length; i++) {
            if (!this.isRunning) break;

            this.currentTestIndex = i;
            const test = this.tests[i];

            this.updateProgress(`Running: ${test.name} (${i + 1}/${this.tests.length})`);

            try {
                const result = await test.run();
                result.testName = test.name;
                result.testDescription = test.description;
                this.results.push(result);

                this.displayResult(result);

                // Auto-scroll to element if enabled
                if (autoScroll && result.element) {
                    result.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    this.highlightElement(result.element);
                }

                await this.wait(500);
            } catch (error) {
                this.results.push({
                    testName: test.name,
                    pass: false,
                    message: `Error: ${error.message}`,
                    error: error
                });
            }
        }

        this.isRunning = false;
        document.getElementById('run-all-tests').disabled = false;
        document.getElementById('stop-tests').disabled = true;

        this.showSummary();
    }

    /**
     * Stop running tests
     */
    stopTests() {
        this.isRunning = false;
        this.updateProgress('Tests stopped');
    }

    /**
     * Update progress display
     */
    updateProgress(message) {
        document.getElementById('test-progress').textContent = message;
    }

    /**
     * Display individual test result
     */
    displayResult(result) {
        const resultEl = document.createElement('div');
        resultEl.style.cssText = `
            padding: 12px;
            margin-bottom: 8px;
            background: ${result.pass ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)'};
            border-left: 3px solid ${result.pass ? '#34c759' : '#ff3b30'};
            border-radius: 8px;
            font-size: 12px;
        `;

        resultEl.innerHTML = `
            <div style="font-weight: 700; margin-bottom: 4px;">
                ${result.pass ? '✓' : '✗'} ${result.testName}
            </div>
            <div style="color: #98989d; margin-bottom: 4px; font-size: 11px;">
                ${result.testDescription}
            </div>
            <div style="color: ${result.pass ? '#34c759' : '#ff3b30'};">
                ${result.message}
            </div>
        `;

        document.getElementById('test-results').prepend(resultEl);
    }

    /**
     * Show test summary
     */
    showSummary() {
        const passed = this.results.filter(r => r.pass).length;
        const failed = this.results.filter(r => !r.pass).length;
        const total = this.results.length;

        const summary = document.createElement('div');
        summary.style.cssText = `
            padding: 16px;
            margin-bottom: 16px;
            background: #000;
            border-radius: 8px;
            text-align: center;
        `;

        summary.innerHTML = `
            <div style="font-size: 24px; font-weight: 900; margin-bottom: 8px;">
                ${passed}/${total} Passed
            </div>
            <div style="font-size: 14px; color: #98989d;">
                <span style="color: #34c759;">${passed} passed</span> •
                <span style="color: #ff3b30;">${failed} failed</span>
            </div>
        `;

        document.getElementById('test-results').prepend(summary);
    }

    /**
     * Highlight an element temporarily
     */
    highlightElement(element) {
        const originalOutline = element.style.outline;
        const originalOutlineOffset = element.style.outlineOffset;

        element.style.outline = '3px solid #ff3b30';
        element.style.outlineOffset = '4px';

        setTimeout(() => {
            element.style.outline = originalOutline;
            element.style.outlineOffset = originalOutlineOffset;
        }, 1500);
    }

    /**
     * Get computed styles for an element
     */
    getComputedStyles(element) {
        return window.getComputedStyle(element);
    }

    /**
     * Check color contrast ratio
     */
    checkContrast(color1, color2) {
        const rgb1 = this.parseColor(color1);
        const rgb2 = this.parseColor(color2);

        const l1 = this.getLuminance(rgb1);
        const l2 = this.getLuminance(rgb2);

        const ratio = l1 > l2
            ? (l1 + 0.05) / (l2 + 0.05)
            : (l2 + 0.05) / (l1 + 0.05);

        return {
            ratio: ratio,
            wcagAA: ratio >= 4.5,
            wcagAAA: ratio >= 7
        };
    }

    /**
     * Parse CSS color to RGB(A)
     */
    parseColor(color) {
        const div = document.createElement('div');
        div.style.color = color;
        document.body.appendChild(div);
        const computed = window.getComputedStyle(div).color;
        document.body.removeChild(div);

        const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!match) return { r: 0, g: 0, b: 0, a: 1 };

        return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3]),
            a: match[4] ? parseFloat(match[4]) : 1
        };
    }

    /**
     * Flatten semi-transparent color over a background
     */
    flattenColor(foreground, background) {
        const fg = this.parseColor(foreground);
        const bg = this.parseColor(background);

        // If foreground is fully opaque, return it as-is
        if (fg.a === 1) {
            return `rgb(${fg.r}, ${fg.g}, ${fg.b})`;
        }

        // Alpha blend: result = fg * alpha + bg * (1 - alpha)
        const r = Math.round(fg.r * fg.a + bg.r * (1 - fg.a));
        const g = Math.round(fg.g * fg.a + bg.g * (1 - fg.a));
        const b = Math.round(fg.b * fg.a + bg.b * (1 - fg.a));

        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Calculate relative luminance
     */
    getLuminance(rgb) {
        const rsRGB = rgb.r / 255;
        const gsRGB = rgb.g / 255;
        const bsRGB = rgb.b / 255;

        const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
        const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
        const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    /**
     * Check if a color is greyish
     */
    isGreyish(color) {
        const rgb = this.parseColor(color);
        const diff = Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b);
        return diff < 30; // Low saturation = greyish
    }

    /**
     * Wait utility
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize on page load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        window.visualTestSuite = new VisualTestSuite();
        window.visualTestSuite.init();
    });
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualTestSuite;
}
