/**
 * Semantic Web Components Library
 * Version: 1.0.0
 *
 * Intent-based, context-aware, modality-agnostic UI components
 * for building applications that work across any interaction method.
 */

// ============================================================================
// CONTEXT MANAGER
// ============================================================================

class ContextManager {
    constructor() {
        this.context = {
            modality: 'screen',
            environment: {
                noiseLevel: 0,
                viewerCount: 1,
                isPublic: false,
                lighting: 'normal'
            },
            user: {
                isBusy: false,
                inFocusMode: false,
                prefersReducedMotion: false
            },
            attention: {
                maxScreenSpace: 100,
                maxAudioTime: 10,
                maxCognitiveLoad: 3,
                usedScreenSpace: 0,
                usedAudioTime: 0,
                usedCognitiveLoad: 0
            }
        };

        this.components = new Set();
        this.listeners = new Set();
    }

    register(component) {
        this.components.add(component);
        this.notifyChange();
    }

    unregister(component) {
        this.components.delete(component);
        this.notifyChange();
    }

    updateContext(updates) {
        this.context = { ...this.context, ...updates };
        this.notifyChange();
    }

    setModality(modality) {
        this.context.modality = modality;
        this.notifyChange();
    }

    notifyChange() {
        this.allocateAttention();
        this.listeners.forEach(listener => listener(this.context));
    }

    allocateAttention() {
        // Get all components that need attention
        const needsAttention = Array.from(this.components)
            .filter(c => c.computeAttentionScore)
            .map(c => ({
                component: c,
                score: c.computeAttentionScore(this.context)
            }))
            .sort((a, b) => b.score - a.score);

        // Reset attention budget
        let screenUsed = 0;
        let audioUsed = 0;
        let cognitiveUsed = 0;

        // Allocate resources in priority order
        needsAttention.forEach(({ component, score }) => {
            const needs = component.getAttentionNeeds();

            const canAllocate =
                screenUsed + needs.screen <= this.context.attention.maxScreenSpace &&
                audioUsed + needs.audio <= this.context.attention.maxAudioTime &&
                cognitiveUsed + needs.cognitive <= this.context.attention.maxCognitiveLoad;

            if (canAllocate && score > 10) {
                component.setAttribute('attention-state', 'allocated');
                screenUsed += needs.screen;
                audioUsed += needs.audio;
                cognitiveUsed += needs.cognitive;
            } else {
                component.setAttribute('attention-state', 'deferred');
            }
        });

        this.context.attention.usedScreenSpace = screenUsed;
        this.context.attention.usedAudioTime = audioUsed;
        this.context.attention.usedCognitiveLoad = cognitiveUsed;
    }

    onChange(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }
}

// Global context manager
window.semanticContext = window.semanticContext || new ContextManager();

// ============================================================================
// BASE SEMANTIC COMPONENT
// ============================================================================

class SemanticComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        window.semanticContext.register(this);
        this.render();
        this.setupEventListeners();
    }

    disconnectedCallback() {
        window.semanticContext.unregister(this);
    }

    computeAttentionScore(context) {
        const urgency = this.getAttribute('urgency') || 'medium';
        const priority = this.getAttribute('priority') || 'passive-info';
        const weight = parseInt(this.getAttribute('attention-weight') || '50');

        const urgencyMultiplier = {
            'critical': 2.0,
            'high': 1.5,
            'medium': 1.0,
            'low': 0.5
        };

        let score = weight * urgencyMultiplier[urgency];

        // Context penalties
        if (context.user.isBusy && this.canDefer()) score *= 0.3;
        if (context.user.inFocusMode && urgency !== 'critical') score *= 0.5;
        if (context.environment.noiseLevel > 70 && context.modality.includes('voice')) score *= 0.7;

        return Math.round(score);
    }

    getAttentionNeeds() {
        return {
            screen: parseInt(this.getAttribute('screen-space') || '10'),
            audio: parseInt(this.getAttribute('audio-time') || '2'),
            cognitive: parseFloat(this.getAttribute('cognitive-load') || '0.5')
        };
    }

    canDefer() {
        return this.getAttribute('can-defer') !== 'false';
    }

    shouldHideInContext(context) {
        const sensitivity = this.getAttribute('sensitivity');
        if (sensitivity === 'private' && context.environment.viewerCount > 1) return true;
        if (sensitivity === 'private' && context.environment.isPublic) return true;
        if (this.getAttribute('urgency') === 'low' && context.user.inFocusMode) return true;
        return false;
    }

    emitIntent(intentType, detail = {}) {
        this.dispatchEvent(new CustomEvent('intent', {
            bubbles: true,
            composed: true,
            detail: { type: intentType, ...detail }
        }));
    }

    getStyles() {
        return `
            :host {
                display: block;
                box-sizing: border-box;
                max-width: 100%;
            }
            * {
                box-sizing: border-box;
            }

            /* Mobile responsive - removed font-size reduction to maintain touch target sizes */
        `;
    }

    getIntentColors() {
        const intent = this.getAttribute('intent') || 'secondary';
        const sentiment = this.getAttribute('sentiment') || 'neutral';

        // Base colors
        const colors = {
            bg: '#2c2c2e',
            border: '#38383a',
            borderHover: '#4d9fff',
            text: '#fff'
        };

        // Intent overrides
        if (intent === 'primary') {
            colors.bg = '#1c1c1e';
            colors.border = '#409cff';
            colors.borderHover = '#64b5ff';
        }

        // Sentiment overrides
        if (sentiment === 'positive') {
            colors.border = '#34c759';
            colors.borderHover = '#48d368';
        } else if (sentiment === 'negative') {
            colors.border = '#ff3b30';
            colors.borderHover = '#ff453a';
        } else if (sentiment === 'warning') {
            colors.border = '#ff9500';
            colors.borderHover = '#ffa624';
        }

        return colors;
    }
}

// ============================================================================
// ACTION COMPONENT
// ============================================================================

class SemanticAction extends SemanticComponent {
    static get observedAttributes() {
        return ['intent', 'sentiment', 'disabled'];
    }

    render() {
        const intent = this.getAttribute('intent') || 'secondary';
        const sentiment = this.getAttribute('sentiment') || 'neutral';
        const disabled = this.hasAttribute('disabled');

        this.shadowRoot.innerHTML = `
            <style>
                ${this.getStyles()}

                button {
                    min-height: 44px;
                    min-width: 88px;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    /* Support CSS custom properties for forced demo states (only when set) */
                    transform: var(--demo-transform);
                    box-shadow: var(--demo-box-shadow);
                    filter: var(--demo-filter);
                    outline: var(--demo-outline);
                    outline-offset: var(--demo-outline-offset);
                }

                button:focus-visible {
                    outline: 3px solid #4d9fff;
                    outline-offset: 2px;
                }

                /* Intent styles */
                button[data-intent="primary"] {
                    background: #0066cc; /* Darker blue for WCAG AA with white text (5.9:1) */
                    color: white;
                }

                button[data-intent="secondary"] {
                    background: #8e8e93;
                    color: white;
                }

                button[data-intent="tertiary"] {
                    background: transparent;
                    color: #409cff;
                    border: 2px solid #409cff;
                }

                /* Sentiment overrides */
                button[data-sentiment="constructive"] {
                    background: #34c759;
                }

                button[data-sentiment="destructive"] {
                    background: #ff3b30;
                }

                /* States */
                button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 3px 8px rgba(64, 156, 255, 0.6);
                    filter: brightness(1.2);
                }

                button:active:not(:disabled) {
                    transform: scale(0.96) translateY(1px);
                    box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.3);
                    filter: brightness(0.85);
                }

                button:disabled {
                    background: #3a3a3a !important;
                    color: #8f8f8f !important;
                    opacity: 1;
                    cursor: not-allowed;
                    border-color: #3a3a3a !important;
                }

                /* Long-press indicator */
                button.inspecting::after {
                    content: '';
                    position: absolute;
                    inset: -4px;
                    border: 3px solid #4d9fff;
                    border-radius: 10px;
                    animation: pulse 1s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }


                @media (prefers-reduced-motion: reduce) {
                    button {
                        transition: none;
                    }
                    button:hover:not(:disabled) {
                        transform: none;
                    }
                    button:active:not(:disabled) {
                        transform: none;
                    }
                }
            </style>
            <button
                data-intent="${intent}"
                data-sentiment="${sentiment}"
                ?disabled="${disabled}"
                part="button"
            >
                <slot></slot>
            </button>
        `;
    }

    setupEventListeners() {
        const button = this.shadowRoot.querySelector('button');
        let longPressTimer = null;

        // ACTIVATE intent
        button.addEventListener('click', (e) => {
            if (!this.hasAttribute('disabled')) {
                this.emitIntent('activate');
            }
        });

        // INSPECT intent (long-press)
        button.addEventListener('mousedown', () => {
            longPressTimer = setTimeout(() => {
                button.classList.add('inspecting');
                this.emitIntent('inspect');
            }, 500);
        });

        button.addEventListener('mouseup', () => {
            clearTimeout(longPressTimer);
            button.classList.remove('inspecting');
        });

        button.addEventListener('mouseleave', () => {
            clearTimeout(longPressTimer);
            button.classList.remove('inspecting');
        });

        // Keyboard support
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!this.hasAttribute('disabled')) {
                    this.emitIntent('activate');
                }
            }
        });
    }

    attributeChangedCallback() {
        if (this.shadowRoot.innerHTML) {
            this.render();
            this.setupEventListeners();
        }
    }
}

// ============================================================================
// CARD COMPONENT
// ============================================================================

class SemanticCard extends SemanticComponent {
    static get observedAttributes() {
        return ['intent', 'sentiment', 'media-url', 'media-alt'];
    }

    render() {
        const mediaUrl = this.getAttribute('media-url') || '';
        const mediaAlt = this.getAttribute('media-alt') || '';
        const colors = this.getIntentColors();

        this.shadowRoot.innerHTML = `
            <style>
                ${this.getStyles()}

                .card {
                    background: ${colors.bg};
                    border: 2px solid ${colors.border};
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s;
                    position: relative;
                    color: ${colors.text};
                }

                .card:hover {
                    border-color: ${colors.borderHover};
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                }

                .card.inspecting {
                    border-color: #4d9fff;
                    box-shadow: 0 0 0 4px rgba(77, 159, 255, 0.2);
                }

                .preview {
                    position: absolute;
                    bottom: 100%;
                    left: 0;
                    right: 0;
                    background: #2c2c2e;
                    border: 2px solid #0066cc;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 8px;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.3s;
                    pointer-events: none;
                    z-index: 10;
                }

                .card:hover .preview,
                .card.inspecting .preview {
                    opacity: 1;
                    transform: translateY(0);
                }

                .media {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                    display: block;
                }

                .media-placeholder {
                    width: 100%;
                    height: 200px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 48px;
                }

                .content {
                    padding: 16px;
                }

                .actions {
                    padding: 12px 16px;
                    background: #2c2c2e;
                    border-top: 1px solid #38383a;
                    display: flex;
                    gap: 8px;
                }

                ::slotted([slot="title"]) {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0 0 8px 0;
                }

                ::slotted([slot="description"]) {
                    color: #8a8a8a;
                    font-size: 14px;
                    margin: 0;
                }

                @media (prefers-reduced-motion: reduce) {
                    .card, .preview {
                        transition: none;
                    }
                    .card:hover {
                        transform: none;
                    }
                }
            </style>
            <div class="card" part="card" role="article" tabindex="0">
                <div class="preview" part="preview">
                    <slot name="preview">Preview content appears here</slot>
                </div>
                ${mediaUrl ?
                    `<img class="media" src="${mediaUrl}" alt="${mediaAlt}" part="media">` :
                    `<div class="media-placeholder" part="media-placeholder">
                        <slot name="media-icon">📄</slot>
                    </div>`
                }
                <div class="content" part="content">
                    <slot name="title"></slot>
                    <slot name="description"></slot>
                    <slot></slot>
                </div>
                <div class="actions" part="actions">
                    <slot name="actions"></slot>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const card = this.shadowRoot.querySelector('.card');
        let longPressTimer = null;

        // ACTIVATE intent (navigate)
        card.addEventListener('click', (e) => {
            if (!e.target.closest('[slot="actions"]')) {
                this.emitIntent('activate', { action: 'navigate' });
            }
        });

        // INSPECT intent (preview)
        card.addEventListener('mouseenter', () => {
            this.emitIntent('inspect', { action: 'preview' });
        });

        // Long-press for touch
        card.addEventListener('mousedown', (e) => {
            if (!e.target.closest('[slot="actions"]')) {
                longPressTimer = setTimeout(() => {
                    card.classList.add('inspecting');
                    this.emitIntent('inspect', { action: 'preview', method: 'long-press' });
                }, 500);
            }
        });

        card.addEventListener('mouseup', () => {
            clearTimeout(longPressTimer);
            setTimeout(() => card.classList.remove('inspecting'), 2000);
        });

        card.addEventListener('mouseleave', () => {
            clearTimeout(longPressTimer);
            card.classList.remove('inspecting');
        });

        // Keyboard
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.emitIntent('activate', { action: 'navigate' });
            }
        });
    }

    attributeChangedCallback() {
        if (this.shadowRoot.innerHTML) {
            this.render();
            this.setupEventListeners();
        }
    }
}

// ============================================================================
// FEEDBACK COMPONENT (Notifications)
// ============================================================================

class SemanticFeedback extends SemanticComponent {
    static get observedAttributes() {
        return ['urgency', 'type', 'auto-dismiss'];
    }

    render() {
        const urgency = this.getAttribute('urgency') || 'medium';
        const type = this.getAttribute('type') || 'notification';
        const autoDismiss = this.hasAttribute('auto-dismiss');

        this.shadowRoot.innerHTML = `
            <style>
                ${this.getStyles()}

                .feedback {
                    padding: 16px;
                    border-radius: 8px;
                    border-left: 4px solid;
                    background: #2c2c2e;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    animation: slideIn 0.3s;
                }

                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }

                .feedback[data-urgency="critical"] {
                    border-color: #ff3b30;
                    background: rgba(255, 59, 48, 0.1);
                }

                .feedback[data-urgency="high"] {
                    border-color: #ff9500;
                    background: rgba(255, 149, 0, 0.1);
                }

                .feedback[data-urgency="medium"] {
                    border-color: #0066cc;
                    background: rgba(0, 122, 255, 0.1);
                }

                .feedback[data-urgency="low"] {
                    border-color: #8e8e93;
                }

                .icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }

                .content {
                    flex: 1;
                }

                .dismiss {
                    background: none;
                    border: none;
                    color: #8a8a8a;
                    cursor: pointer;
                    font-size: 20px;
                    padding: 0;
                    width: 44px;
                    height: 44px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .dismiss:hover {
                    color: #fff;
                }

                :host([attention-state="deferred"]) {
                    opacity: 0.5;
                    /* Removed scale to maintain 44px minimum touch targets */
                    filter: grayscale(0.5);
                }

                :host([hidden]) {
                    display: none;
                }

                @media (prefers-reduced-motion: reduce) {
                    .feedback {
                        animation: none;
                    }
                }
            </style>
            <div class="feedback" data-urgency="${urgency}" data-type="${type}" role="alert" part="feedback">
                <div class="icon" part="icon">
                    <slot name="icon">${this.getIcon(urgency)}</slot>
                </div>
                <div class="content" part="content">
                    <slot></slot>
                </div>
                <button class="dismiss" aria-label="Dismiss" part="dismiss">×</button>
            </div>
        `;

        if (autoDismiss) {
            setTimeout(() => this.dismiss(), 5000);
        }
    }

    getIcon(urgency) {
        const icons = {
            'critical': '⚠️',
            'high': '❗',
            'medium': 'ℹ️',
            'low': '💡'
        };
        return icons[urgency] || icons.medium;
    }

    setupEventListeners() {
        const dismissBtn = this.shadowRoot.querySelector('.dismiss');
        dismissBtn.addEventListener('click', () => this.dismiss());
    }

    dismiss() {
        this.emitIntent('dismiss');
        this.remove();
    }

    attributeChangedCallback() {
        if (this.shadowRoot.innerHTML) {
            this.render();
            this.setupEventListeners();
        }
    }
}

// ============================================================================
// INPUT ADJUSTER COMPONENT
// ============================================================================

class SemanticAdjuster extends SemanticComponent {
    static get observedAttributes() {
        return ['intent', 'sentiment', 'value', 'min', 'max', 'step', 'label'];
    }

    constructor() {
        super();
        this._value = 50;
    }

    get value() {
        return this._value;
    }

    set value(val) {
        const min = parseFloat(this.getAttribute('min') || '0');
        const max = parseFloat(this.getAttribute('max') || '100');
        this._value = Math.max(min, Math.min(max, parseFloat(val)));
        this.render();
        this.emitIntent('adjust', { value: this._value });
    }

    render() {
        const label = this.getAttribute('label') || 'Value';
        const min = this.getAttribute('min') || '0';
        const max = this.getAttribute('max') || '100';
        const step = this.getAttribute('step') || '1';
        const colors = this.getIntentColors();

        this.shadowRoot.innerHTML = `
            <style>
                ${this.getStyles()}

                .adjuster {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .label {
                    font-size: 16px;
                    font-weight: 600;
                    color: ${colors.text};
                }

                .controls {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .value {
                    font-size: 32px;
                    font-weight: 700;
                    color: #409cff;
                    min-width: 80px;
                    text-align: center;
                }

                button {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: ${colors.bg};
                    border: 2px solid ${colors.border};
                    color: ${colors.text};
                    font-size: 24px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                button:hover {
                    background: ${colors.bgHover};
                    border-color: ${colors.borderHover};
                    transform: scale(1.1);
                }

                button:active {
                    transform: scale(0.95);
                }

                .slider {
                    flex: 1;
                    height: 8px;
                    background: #38383a;
                    border-radius: 4px;
                    position: relative;
                    cursor: pointer;
                }

                .slider-fill {
                    height: 100%;
                    background: #0066cc;
                    border-radius: 4px;
                    transition: width 0.2s;
                }

                .slider-thumb {
                    position: absolute;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    width: 24px;
                    height: 24px;
                    background: white;
                    border: 3px solid #0066cc;
                    border-radius: 50%;
                    cursor: grab;
                    transition: all 0.2s;
                }

                .slider-thumb:active {
                    cursor: grabbing;
                    transform: translate(-50%, -50%) scale(1.2);
                }

                @media (prefers-reduced-motion: reduce) {
                    button, .slider-fill, .slider-thumb {
                        transition: none;
                    }
                    button:hover {
                        transform: none;
                    }
                }
            </style>
            <div class="adjuster" part="adjuster">
                <label class="label" part="label">${label}</label>
                <div class="controls">
                    <button class="decrease" aria-label="Decrease" part="decrease">−</button>
                    <div class="value" part="value">${this._value}</div>
                    <button class="increase" aria-label="Increase" part="increase">+</button>
                </div>
                <div class="slider" part="slider">
                    <div class="slider-fill" style="width: ${this.getPercentage()}%"></div>
                    <div class="slider-thumb" style="left: ${this.getPercentage()}%"></div>
                </div>
            </div>
        `;
    }

    getPercentage() {
        const min = parseFloat(this.getAttribute('min') || '0');
        const max = parseFloat(this.getAttribute('max') || '100');
        return ((this._value - min) / (max - min)) * 100;
    }

    setupEventListeners() {
        const decreaseBtn = this.shadowRoot.querySelector('.decrease');
        const increaseBtn = this.shadowRoot.querySelector('.increase');
        const slider = this.shadowRoot.querySelector('.slider');
        const step = parseFloat(this.getAttribute('step') || '5');

        decreaseBtn.addEventListener('click', () => {
            this.value = this._value - step;
        });

        increaseBtn.addEventListener('click', () => {
            this.value = this._value + step;
        });

        let isDragging = false;

        const updateFromPosition = (clientX) => {
            const rect = slider.getBoundingClientRect();
            const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
            const min = parseFloat(this.getAttribute('min') || '0');
            const max = parseFloat(this.getAttribute('max') || '100');
            this.value = min + (percent / 100) * (max - min);
        };

        slider.addEventListener('mousedown', (e) => {
            isDragging = true;
            updateFromPosition(e.clientX);
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) updateFromPosition(e.clientX);
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Touch support
        slider.addEventListener('touchstart', (e) => {
            isDragging = true;
            updateFromPosition(e.touches[0].clientX);
        });

        document.addEventListener('touchmove', (e) => {
            if (isDragging) updateFromPosition(e.touches[0].clientX);
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'value' && newValue !== oldValue) {
            this._value = parseFloat(newValue);
        }
        if (this.shadowRoot.innerHTML) {
            this.render();
            this.setupEventListeners();
        }
    }
}

// ============================================================================
// INPUT COMPONENT
// ============================================================================

class SemanticInput extends SemanticComponent {
    static get observedAttributes() {
        return ['intent', 'sentiment', 'type', 'label', 'placeholder', 'value', 'required', 'disabled', 'valid', 'error'];
    }

    constructor() {
        super();
        this._value = '';
    }

    get value() {
        return this._value;
    }

    set value(val) {
        this._value = val;
        const input = this.shadowRoot.querySelector('input, textarea');
        if (input) input.value = val;
        this.emitIntent('input', { value: val });
    }

    render() {
        const type = this.getAttribute('type') || 'text';
        const label = this.getAttribute('label') || '';
        const placeholder = this.getAttribute('placeholder') || '';
        const required = this.hasAttribute('required');
        const disabled = this.hasAttribute('disabled');
        const valid = this.hasAttribute('valid');
        const error = this.getAttribute('error') || '';
        const colors = this.getIntentColors();

        const inputTypes = {
            'text': 'text',
            'email': 'email',
            'password': 'password',
            'number': 'number',
            'tel': 'tel',
            'url': 'url',
            'search': 'search'
        };

        const isTextarea = type === 'textarea';
        const inputType = inputTypes[type] || 'text';

        this.shadowRoot.innerHTML = `
            <style>
                ${this.getStyles()}

                .input-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                label {
                    font-size: 14px;
                    font-weight: 600;
                    color: ${colors.text};
                }

                input, textarea {
                    min-height: 44px;
                    padding: 12px 16px;
                    background: ${colors.bg};
                    border: 2px solid ${colors.border};
                    border-radius: 8px;
                    color: ${colors.text};
                    font-size: 16px;
                    font-family: inherit;
                    transition: all 0.2s;
                }

                textarea {
                    min-height: 120px;
                    resize: vertical;
                }

                input:focus, textarea:focus {
                    outline: 3px solid #4d9fff;
                    outline-offset: 2px;
                    border-color: #0066cc;
                    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15);
                }

                input::placeholder, textarea::placeholder {
                    color: #8a8a8a;
                }

                input:disabled, textarea:disabled {
                    background: #1a1a1a !important;
                    border-color: #2a2a2a !important;
                    color: #8a8a8a !important;
                    cursor: not-allowed;
                    opacity: 1;
                }

                :host([valid]) input, :host([valid]) textarea {
                    border-color: #34c759;
                }

                :host([error]) input, :host([error]) textarea {
                    border-color: #ff3b30;
                }

                .error-message {
                    font-size: 13px;
                    color: #ff3b30;
                    margin-top: -4px;
                }

                .voice-hint {
                    font-size: 12px;
                    color: #8a8a8a;
                    display: none;
                }

                :host([data-modality="voice-screen"]) .voice-hint,
                :host([data-modality="voice-only"]) .voice-hint {
                    display: block;
                }
            </style>
            <div class="input-wrapper" part="wrapper">
                ${label ? `<label part="label">${label}${required ? ' *' : ''}</label>` : ''}
                ${isTextarea ?
                    `<textarea
                        part="input"
                        placeholder="${placeholder}"
                        ?required="${required}"
                        ?disabled="${disabled}"
                    ></textarea>` :
                    `<input
                        part="input"
                        type="${inputType}"
                        placeholder="${placeholder}"
                        ?required="${required}"
                        ?disabled="${disabled}"
                    />`
                }
                <div class="voice-hint" part="voice-hint">
                    Say "Type ${label || 'input'}" to dictate
                </div>
                ${error ? `<div class="error-message">${error}</div>` : ''}
            </div>
        `;
    }

    setupEventListeners() {
        const input = this.shadowRoot.querySelector('input, textarea');

        input.addEventListener('input', (e) => {
            this._value = e.target.value;
            this.emitIntent('input', { value: this._value });
        });

        input.addEventListener('change', (e) => {
            this.emitIntent('change', { value: this._value });
        });

        input.addEventListener('focus', () => {
            this.emitIntent('focus');
        });

        input.addEventListener('blur', () => {
            this.emitIntent('blur', { value: this._value });
        });
    }

    attributeChangedCallback() {
        if (this.shadowRoot.innerHTML) {
            this.render();
            this.setupEventListeners();
        }
    }
}

// ============================================================================
// MODAL COMPONENT
// ============================================================================

class SemanticModal extends SemanticComponent {
    static get observedAttributes() {
        return ['open', 'urgency', 'dismissible'];
    }

    render() {
        const urgency = this.getAttribute('urgency') || 'medium';
        const dismissible = this.getAttribute('dismissible') !== 'false';

        this.shadowRoot.innerHTML = `
            <style>
                ${this.getStyles()}

                :host {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 9999;
                    align-items: center;
                    justify-content: center;
                }

                :host([open]) {
                    display: flex;
                }

                .backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    animation: fadeIn 0.2s;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                }

                .modal {
                    position: relative;
                    background: #1c1c1e;
                    border-radius: 16px;
                    max-width: 90vw;
                    max-height: 90vh;
                    overflow: auto;
                    animation: slideUp 0.3s;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(50px);
                        opacity: 0;
                    }
                }

                .modal[data-urgency="critical"] {
                    border: 3px solid #ff3b30;
                }

                .header {
                    padding: 24px;
                    border-bottom: 1px solid #38383a;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: #8a8a8a;
                    font-size: 32px;
                    cursor: pointer;
                    padding: 0;
                    min-width: 44px;
                    min-height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.2s;
                }

                .close-btn:hover {
                    background: #38383a;
                    color: #fff;
                }

                .close-btn:focus-visible {
                    outline: 3px solid #4d9fff;
                    outline-offset: 2px;
                }

                .content {
                    padding: 24px;
                }

                .actions {
                    padding: 24px;
                    border-top: 1px solid #38383a;
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }

                /* Mobile responsive - fullscreen on small screens */
                @media (max-width: 640px) {
                    .modal {
                        max-width: 100vw;
                        max-height: 100vh;
                        border-radius: 0;
                        width: 100%;
                        height: 100%;
                    }

                    .header, .content, .actions {
                        padding: 20px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .backdrop, .modal {
                        animation: none;
                    }
                }
            </style>
            <div class="backdrop" part="backdrop"></div>
            <div class="modal" data-urgency="${urgency}" part="modal" role="dialog" aria-modal="true">
                <div class="header" part="header">
                    <slot name="header"></slot>
                    ${dismissible ? '<button class="close-btn" aria-label="Close" part="close">×</button>' : ''}
                </div>
                <div class="content" part="content">
                    <slot></slot>
                </div>
                <div class="actions" part="actions">
                    <slot name="actions"></slot>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const backdrop = this.shadowRoot.querySelector('.backdrop');
        const closeBtn = this.shadowRoot.querySelector('.close-btn');
        const dismissible = this.getAttribute('dismissible') !== 'false';

        if (dismissible) {
            backdrop?.addEventListener('click', () => this.close());
            closeBtn?.addEventListener('click', () => this.close());

            // ESC key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.hasAttribute('open')) {
                    this.close();
                }
            });
        }
    }

    open() {
        this.setAttribute('open', '');
        this.emitIntent('open');
        // Trap focus
        const firstFocusable = this.shadowRoot.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        firstFocusable?.focus();
    }

    close() {
        this.removeAttribute('open');
        this.emitIntent('close');
    }

    attributeChangedCallback(name) {
        if (name === 'open' && this.shadowRoot.innerHTML) {
            if (this.hasAttribute('open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
        if (this.shadowRoot.innerHTML) {
            this.render();
            this.setupEventListeners();
        }
    }
}

// ============================================================================
// NAVIGATOR COMPONENT
// ============================================================================

class SemanticNavigator extends SemanticComponent {
    static get observedAttributes() {
        return ['type', 'current'];
    }

    render() {
        const type = this.getAttribute('type') || 'tabs';
        const current = this.getAttribute('current') || '';

        this.shadowRoot.innerHTML = `
            <style>
                ${this.getStyles()}

                .navigator {
                    display: flex;
                    gap: 4px;
                }

                .navigator[data-type="tabs"] {
                    flex-direction: row;
                    border-bottom: 2px solid #38383a;
                }

                .navigator[data-type="menu"] {
                    flex-direction: column;
                }

                ::slotted(*) {
                    display: flex;
                    align-items: center;
                    padding: 12px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #8a8a8a;
                    text-decoration: none;
                    user-select: none;
                }

                ::slotted(:hover) {
                    background: #2c2c2e;
                    color: #fff;
                }

                ::slotted([aria-current="page"]),
                ::slotted(.current) {
                    background: #0066cc;
                    color: #fff;
                    font-weight: 600;
                }

                ::slotted(:focus-visible) {
                    outline: 3px solid #4d9fff;
                    outline-offset: 2px;
                }
            </style>
            <nav class="navigator" data-type="${type}" part="navigator" role="navigation">
                <slot></slot>
            </nav>
        `;
    }

    setupEventListeners() {
        this.addEventListener('click', (e) => {
            const target = e.target;
            if (target.hasAttribute('data-nav-id')) {
                this.emitIntent('navigate', {
                    id: target.getAttribute('data-nav-id'),
                    href: target.getAttribute('href')
                });
            }
        });
    }

    attributeChangedCallback() {
        if (this.shadowRoot.innerHTML) {
            this.render();
            this.setupEventListeners();
        }
    }
}

// ============================================================================
// LIST COMPONENT
// ============================================================================

class SemanticList extends SemanticComponent {
    static get observedAttributes() {
        return ['type', 'selectable'];
    }

    render() {
        const type = this.getAttribute('type') || 'default';
        const selectable = this.hasAttribute('selectable');

        this.shadowRoot.innerHTML = `
            <style>
                ${this.getStyles()}

                .list {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                ::slotted(*) {
                    padding: 18px 16px;
                    min-height: 44px;
                    display: flex;
                    align-items: center;
                    background: #1c1c1e;
                    border: 1px solid #38383a;
                    border-radius: 8px;
                    transition: all 0.2s;
                }

                :host([selectable]) ::slotted(*) {
                    cursor: pointer;
                    user-select: none;
                }

                :host([selectable]) ::slotted(:hover) {
                    background: #2c2c2e;
                    border-color: #0066cc;
                    transform: translateX(4px);
                }

                :host([selectable]) ::slotted([aria-selected="true"]),
                :host([selectable]) ::slotted(.selected) {
                    background: rgba(0, 122, 255, 0.1);
                    border-color: #0066cc;
                }

                ::slotted(:focus-visible) {
                    outline: 3px solid #4d9fff;
                    outline-offset: 2px;
                }

                .list[data-type="compact"] ::slotted(*) {
                    padding: 12px;
                }

                .list[data-type="dense"] ::slotted(*) {
                    padding: 8px 12px;
                    border-radius: 4px;
                }
            </style>
            <div class="list" data-type="${type}" part="list" role="list">
                <slot></slot>
            </div>
        `;
    }

    setupEventListeners() {
        if (this.hasAttribute('selectable')) {
            this.addEventListener('click', (e) => {
                const item = e.target.closest('[data-item-id]');
                if (item) {
                    // Toggle selection
                    const isSelected = item.getAttribute('aria-selected') === 'true';
                    item.setAttribute('aria-selected', !isSelected);

                    this.emitIntent('select', {
                        id: item.getAttribute('data-item-id'),
                        selected: !isSelected
                    });
                }
            });

            // Keyboard navigation
            this.addEventListener('keydown', (e) => {
                const items = Array.from(this.querySelectorAll('[data-item-id]'));
                const current = this.querySelector('[aria-selected="true"]');
                const currentIndex = items.indexOf(current);

                if (e.key === 'ArrowDown' && currentIndex < items.length - 1) {
                    e.preventDefault();
                    items[currentIndex + 1].focus();
                } else if (e.key === 'ArrowUp' && currentIndex > 0) {
                    e.preventDefault();
                    items[currentIndex - 1].focus();
                } else if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.target.click();
                }
            });
        }
    }

    attributeChangedCallback() {
        if (this.shadowRoot.innerHTML) {
            this.render();
            this.setupEventListeners();
        }
    }
}

// ============================================================================
// MENU COMPONENT
// ============================================================================

class SemanticMenu extends SemanticComponent {
    static get observedAttributes() {
        return ['open', 'anchor'];
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                ${this.getStyles()}

                :host {
                    position: absolute;
                    display: none;
                    z-index: 10000;
                }

                :host([open]) {
                    display: block;
                }

                .menu {
                    background: #2c2c2e;
                    border: 1px solid #38383a;
                    border-radius: 12px;
                    padding: 8px;
                    min-width: 200px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                    animation: scaleIn 0.15s;
                }

                @keyframes scaleIn {
                    from {
                        transform: scale(0.95);
                        opacity: 0;
                    }
                }

                ::slotted(*) {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    min-height: 44px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.15s;
                    color: #fff;
                    text-decoration: none;
                    user-select: none;
                }

                ::slotted(:hover) {
                    background: #0066cc;
                    transform: translateX(2px);
                }

                ::slotted(:focus-visible) {
                    outline: 2px solid #4d9fff;
                    outline-offset: 2px;
                }

                ::slotted([disabled]) {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                ::slotted([disabled]):hover {
                    background: transparent;
                }

                .divider {
                    height: 1px;
                    background: #38383a;
                    margin: 4px 0;
                }

                @media (prefers-reduced-motion: reduce) {
                    .menu {
                        animation: none;
                    }
                }
            </style>
            <div class="menu" part="menu" role="menu">
                <slot></slot>
            </div>
        `;
    }

    setupEventListeners() {
        this.addEventListener('click', (e) => {
            const item = e.target.closest('[data-menu-id]');
            if (item && !item.hasAttribute('disabled')) {
                this.emitIntent('select', {
                    id: item.getAttribute('data-menu-id')
                });
                this.close();
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.hasAttribute('open') && !this.contains(e.target)) {
                this.close();
            }
        });

        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.hasAttribute('open')) {
                this.close();
            }
        });
    }

    open(x, y) {
        this.style.left = x + 'px';
        this.style.top = y + 'px';
        this.setAttribute('open', '');
        this.emitIntent('open');

        // Focus first item
        const firstItem = this.querySelector('[data-menu-id]:not([disabled])');
        firstItem?.focus();
    }

    close() {
        this.removeAttribute('open');
        this.emitIntent('close');
    }

    attributeChangedCallback() {
        if (this.shadowRoot.innerHTML) {
            this.render();
            this.setupEventListeners();
        }
    }
}

// ============================================================================
// TABS COMPONENT
// ============================================================================

class SemanticTabs extends SemanticComponent {
    static get observedAttributes() {
        return ['selected'];
    }

    constructor() {
        super();
        this.tabs = [];
        this.panels = [];
    }

    render() {
        const selected = parseInt(this.getAttribute('selected') || '0');

        this.shadowRoot.innerHTML = `
            <style>
                ${this.getStyles()}

                :host {
                    display: block;
                }

                .tabs-container {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }

                .tab-list {
                    display: flex;
                    gap: 0;
                    border-bottom: 2px solid #38383a;
                    background: #1c1c1e;
                }

                .tab {
                    min-height: 44px;
                    min-width: 88px;
                    padding: 12px 24px;
                    border: none;
                    background: transparent;
                    color: #8e8e93;
                    font-size: 15px;
                    font-weight: 600;
                    font-family: inherit;
                    cursor: pointer;
                    border-bottom: 3px solid transparent;
                    transition: all 0.2s;
                    position: relative;
                    /* Support CSS custom properties for forced demo states */
                    transform: var(--demo-transform);
                    box-shadow: var(--demo-box-shadow);
                    filter: var(--demo-filter);
                    outline: var(--demo-outline);
                    outline-offset: var(--demo-outline-offset);
                }

                .tab:hover:not(:disabled):not([aria-selected="true"]) {
                    color: #ffffff;
                    background: rgba(255, 255, 255, 0.05);
                }

                .tab[aria-selected="true"] {
                    color: #409cff;
                    border-bottom-color: #409cff;
                    background: rgba(64, 156, 255, 0.1);
                }

                .tab:focus-visible {
                    outline: 3px solid #4d9fff;
                    outline-offset: -3px;
                }

                .tab:disabled {
                    color: #48484a;
                    cursor: not-allowed;
                    opacity: 0.5;
                }

                .tab-panels {
                    padding: 20px 0;
                }

                .tab-panel {
                    display: none;
                }

                .tab-panel[aria-hidden="false"] {
                    display: block;
                }

                @media (prefers-reduced-motion: reduce) {
                    .tab {
                        transition: none;
                    }
                }
            </style>
            <div class="tabs-container" role="tablist">
                <div class="tab-list"></div>
                <div class="tab-panels"></div>
            </div>
        `;
    }

    setupEventListeners() {
        // Use setTimeout to ensure child elements are fully initialized
        setTimeout(() => {
            this.collectTabsAndPanels();
            this.renderTabs();
            this.selectTab(parseInt(this.getAttribute('selected') || '0'));
        }, 0);
    }

    collectTabsAndPanels() {
        // Collect tab-item and tab-panel elements from light DOM
        this.tabs = Array.from(this.querySelectorAll('tab-item'));
        this.panels = Array.from(this.querySelectorAll('tab-panel'));
    }

    renderTabs() {
        const tabList = this.shadowRoot.querySelector('.tab-list');
        const panelsContainer = this.shadowRoot.querySelector('.tab-panels');

        tabList.innerHTML = '';
        panelsContainer.innerHTML = '';

        this.tabs.forEach((tabItem, index) => {
            const button = document.createElement('button');
            button.className = 'tab';
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-controls', `panel-${index}`);
            button.setAttribute('aria-selected', 'false');
            button.setAttribute('tabindex', '-1');
            button.setAttribute('id', `tab-${index}`);
            button.textContent = tabItem.getAttribute('label') || `Tab ${index + 1}`;

            if (tabItem.hasAttribute('disabled')) {
                button.disabled = true;
            }

            if (tabItem.hasAttribute('badge')) {
                const badge = document.createElement('span');
                badge.textContent = tabItem.getAttribute('badge');
                badge.style.cssText = 'background: #ff3b30; color: white; padding: 2px 6px; border-radius: 10px; font-size: 11px; margin-left: 8px;';
                button.appendChild(badge);
            }

            button.addEventListener('click', () => {
                if (!button.disabled) {
                    this.selectTab(index);
                }
            });

            tabList.appendChild(button);
        });

        this.panels.forEach((panel, index) => {
            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('aria-labelledby', `tab-${index}`);
            panel.setAttribute('id', `panel-${index}`);
            panel.setAttribute('aria-hidden', 'true');
            panel.className = 'tab-panel';
            panelsContainer.appendChild(panel);
        });

        // Keyboard navigation
        tabList.addEventListener('keydown', (e) => {
            const tabs = Array.from(tabList.querySelectorAll('.tab:not(:disabled)'));
            const currentIndex = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');

            let nextIndex = currentIndex;

            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    nextIndex = (currentIndex + 1) % tabs.length;
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                    break;
                case 'Home':
                    e.preventDefault();
                    nextIndex = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    nextIndex = tabs.length - 1;
                    break;
            }

            if (nextIndex !== currentIndex) {
                const allTabs = Array.from(tabList.querySelectorAll('.tab'));
                const targetIndex = allTabs.indexOf(tabs[nextIndex]);
                this.selectTab(targetIndex);
                tabs[nextIndex].focus();
            }
        });
    }

    selectTab(index) {
        const tabList = this.shadowRoot.querySelector('.tab-list');
        const tabs = Array.from(tabList.querySelectorAll('.tab'));
        const panels = Array.from(this.shadowRoot.querySelectorAll('.tab-panel'));

        tabs.forEach((tab, i) => {
            const isSelected = i === index;
            tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
            tab.setAttribute('tabindex', isSelected ? '0' : '-1');
        });

        panels.forEach((panel, i) => {
            panel.setAttribute('aria-hidden', i === index ? 'false' : 'true');
        });

        this.setAttribute('selected', index.toString());
        this.emitIntent('tab-change', { index, tab: this.tabs[index] });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'selected' && this.shadowRoot.innerHTML && oldValue !== newValue) {
            this.selectTab(parseInt(newValue || '0'));
        }
    }
}

// ============================================================================
// DISCLOSURE COMPONENT (Accordion/Collapsible)
// ============================================================================

class SemanticDisclosure extends SemanticComponent {
    static get observedAttributes() {
        return ['open', 'mode'];
    }

    constructor() {
        super();
        this.items = [];
    }

    getCSS() {
        return `
            .disclosure-container {
                display: flex;
                flex-direction: column;
                gap: 0;
                background: #1c1c1e;
                border-radius: 12px;
                overflow: hidden;
            }

            .disclosure-item {
                border-bottom: 1px solid #38383a;
            }

            .disclosure-item:last-child {
                border-bottom: none;
            }

            .disclosure-header {
                all: unset;
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                padding: 16px;
                background: transparent;
                color: #fff;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                transition: background 0.15s ease;
                box-sizing: border-box;
                min-height: 44px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .disclosure-header:hover {
                background: rgba(255, 255, 255, 0.05);
            }

            .disclosure-header:active {
                background: rgba(255, 255, 255, 0.08);
            }

            .disclosure-header:focus-visible {
                outline: 3px solid #4d9fff;
                outline-offset: -3px;
            }

            .disclosure-icon {
                font-size: 14px;
                color: #8e8e93;
                transition: transform 0.2s ease;
                user-select: none;
            }

            .disclosure-icon.open {
                transform: rotate(90deg);
            }

            .disclosure-content {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease, padding 0.3s ease;
                padding: 0 16px;
                box-sizing: border-box;
            }

            .disclosure-content.open {
                max-height: 2000px;
                padding: 0 16px 16px 16px;
            }

            .disclosure-content-inner {
                color: #ababab;
                font-size: 14px;
                line-height: 1.6;
            }
        `;
    }

    getHTML() {
        return `<div class="disclosure-container" role="region"></div>`;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                ${this.getCSS()}
            </style>
            ${this.getHTML()}
        `;
    }

    setupEventListeners() {
        setTimeout(() => {
            this.collectItems();
            this.renderItems();
            this.setupMode();
        }, 0);
    }

    collectItems() {
        this.items = Array.from(this.querySelectorAll('disclosure-item'));
    }

    renderItems() {
        const container = this.shadowRoot.querySelector('.disclosure-container');

        this.items.forEach((item, index) => {
            const header = item.getAttribute('header') || `Item ${index + 1}`;
            const open = item.hasAttribute('open');
            const disabled = item.hasAttribute('disabled');

            const itemEl = document.createElement('div');
            itemEl.className = 'disclosure-item';
            itemEl.setAttribute('data-index', index);

            const headerButton = document.createElement('button');
            headerButton.className = 'disclosure-header';
            headerButton.setAttribute('role', 'button');
            headerButton.setAttribute('aria-expanded', open ? 'true' : 'false');
            headerButton.setAttribute('aria-controls', `disclosure-content-${index}`);

            if (disabled) {
                headerButton.disabled = true;
                headerButton.style.opacity = '0.4';
                headerButton.style.cursor = 'not-allowed';
            }

            const headerText = document.createElement('span');
            headerText.textContent = header;

            const icon = document.createElement('span');
            icon.className = `disclosure-icon ${open ? 'open' : ''}`;
            icon.textContent = '▶';
            icon.setAttribute('aria-hidden', 'true');

            headerButton.appendChild(headerText);
            headerButton.appendChild(icon);

            const content = document.createElement('div');
            content.className = `disclosure-content ${open ? 'open' : ''}`;
            content.id = `disclosure-content-${index}`;
            content.setAttribute('role', 'region');
            content.setAttribute('aria-labelledby', `disclosure-header-${index}`);

            const contentInner = document.createElement('div');
            contentInner.className = 'disclosure-content-inner';
            contentInner.innerHTML = item.innerHTML;

            content.appendChild(contentInner);

            itemEl.appendChild(headerButton);
            itemEl.appendChild(content);

            container.appendChild(itemEl);

            if (!disabled) {
                headerButton.addEventListener('click', () => {
                    this.toggleItem(index);
                });
            }
        });
    }

    setupMode() {
        const mode = this.getAttribute('mode') || 'multiple';
        this.mode = mode;
    }

    toggleItem(index) {
        const container = this.shadowRoot.querySelector('.disclosure-container');
        const items = container.querySelectorAll('.disclosure-item');
        const item = items[index];
        const content = item.querySelector('.disclosure-content');
        const icon = item.querySelector('.disclosure-icon');
        const button = item.querySelector('.disclosure-header');
        const isOpen = content.classList.contains('open');

        if (this.mode === 'single' && !isOpen) {
            // Close all other items
            items.forEach((otherItem, otherIndex) => {
                if (otherIndex !== index) {
                    const otherContent = otherItem.querySelector('.disclosure-content');
                    const otherIcon = otherItem.querySelector('.disclosure-icon');
                    const otherButton = otherItem.querySelector('.disclosure-header');
                    otherContent.classList.remove('open');
                    otherIcon.classList.remove('open');
                    otherButton.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Toggle current item
        if (isOpen) {
            content.classList.remove('open');
            icon.classList.remove('open');
            button.setAttribute('aria-expanded', 'false');
            this.items[index].removeAttribute('open');
        } else {
            content.classList.add('open');
            icon.classList.add('open');
            button.setAttribute('aria-expanded', 'true');
            this.items[index].setAttribute('open', '');
        }

        // Emit event
        this.dispatchEvent(new CustomEvent('disclosure-change', {
            detail: {
                index,
                open: !isOpen,
                item: this.items[index]
            }
        }));
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'mode' && this.shadowRoot.innerHTML && oldValue !== newValue) {
            this.setupMode();
        }
    }
}

// ============================================================================
// PROGRESS COMPONENT (Spinner & Progress Bar)
// ============================================================================

class SemanticProgress extends SemanticComponent {
    static get observedAttributes() {
        return ['value', 'max', 'type', 'size'];
    }

    getCSS() {
        return `
            .progress-container {
                display: inline-flex;
                align-items: center;
                gap: 12px;
            }

            /* Spinner styles */
            .spinner {
                display: inline-block;
                border-radius: 50%;
                border-style: solid;
                animation: spin 1s linear infinite;
            }

            .spinner.small {
                width: 16px;
                height: 16px;
                border-width: 2px;
            }

            .spinner.medium {
                width: 24px;
                height: 24px;
                border-width: 3px;
            }

            .spinner.large {
                width: 48px;
                height: 48px;
                border-width: 4px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Progress bar styles */
            .progress-bar-container {
                width: 200px;
                height: 8px;
                background: #38383a;
                border-radius: 8px;
                overflow: hidden;
                position: relative;
            }

            .progress-bar-container.small {
                height: 4px;
                width: 100px;
            }

            .progress-bar-container.medium {
                height: 8px;
                width: 200px;
            }

            .progress-bar-container.large {
                height: 12px;
                width: 300px;
            }

            .progress-bar-fill {
                height: 100%;
                background: var(--progress-color, #409cff);
                border-radius: 8px;
                transition: width 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .progress-bar-fill.indeterminate {
                width: 30% !important;
                animation: indeterminate 1.5s ease-in-out infinite;
            }

            @keyframes indeterminate {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(250%); }
                100% { transform: translateX(-100%); }
            }

            .progress-label {
                font-size: 14px;
                color: #ababab;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            /* Intent colors */
            .intent-primary { --progress-color: #409cff; }
            .intent-success { --progress-color: #30d158; }
            .intent-warning { --progress-color: #ff9f0a; }
            .intent-danger { --progress-color: #ff3b30; }
        `;
    }

    getHTML() {
        const type = this.getAttribute('type') || 'spinner';
        const size = this.getAttribute('size') || 'medium';
        const label = this.getAttribute('label') || '';
        const intent = this.getAttribute('intent') || 'primary';
        const value = parseFloat(this.getAttribute('value') || '0');
        const max = parseFloat(this.getAttribute('max') || '100');
        const isIndeterminate = !this.hasAttribute('value');

        if (type === 'spinner') {
            const borderColor = this.getIntentColor(intent);
            return `
                <div class="progress-container">
                    <div class="spinner ${size}" style="border-color: ${borderColor} transparent transparent transparent;"></div>
                    ${label ? `<span class="progress-label">${label}</span>` : ''}
                </div>
            `;
        } else {
            // Progress bar
            const percentage = isIndeterminate ? 0 : Math.min(100, (value / max) * 100);
            return `
                <div class="progress-container">
                    <div class="progress-bar-container ${size}">
                        <div class="progress-bar-fill intent-${intent} ${isIndeterminate ? 'indeterminate' : ''}"
                             style="width: ${percentage}%"
                             role="progressbar"
                             aria-valuenow="${value}"
                             aria-valuemin="0"
                             aria-valuemax="${max}">
                        </div>
                    </div>
                    ${label ? `<span class="progress-label">${label}</span>` : ''}
                </div>
            `;
        }
    }

    getIntentColor(intent) {
        const colors = {
            primary: '#409cff',
            success: '#30d158',
            warning: '#ff9f0a',
            danger: '#ff3b30'
        };
        return colors[intent] || colors.primary;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                ${this.getCSS()}
            </style>
            ${this.getHTML()}
        `;
    }

    setupEventListeners() {
        // No event listeners needed for progress component
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (this.shadowRoot.innerHTML && oldValue !== newValue) {
            this.render();
        }
    }
}

// ============================================================================
// BADGE COMPONENT (Notification indicators, status badges, counts)
// ============================================================================

class SemanticBadge extends SemanticComponent {
    static get observedAttributes() {
        return ['intent', 'variant', 'size', 'pulse'];
    }

    getCSS() {
        return `
            .badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-weight: 600;
                border-radius: 12px;
                white-space: nowrap;
                box-sizing: border-box;
                position: relative;
            }

            /* Sizes */
            .badge.small {
                height: 16px;
                padding: 0 6px;
                font-size: 11px;
                min-width: 16px;
            }

            .badge.medium {
                height: 20px;
                padding: 0 8px;
                font-size: 12px;
                min-width: 20px;
            }

            .badge.large {
                height: 24px;
                padding: 0 10px;
                font-size: 14px;
                min-width: 24px;
            }

            /* Dot variant (for notification indicators) */
            .badge.dot {
                width: 8px;
                height: 8px;
                min-width: 8px;
                padding: 0;
                border-radius: 50%;
            }

            .badge.dot.medium {
                width: 10px;
                height: 10px;
                min-width: 10px;
            }

            .badge.dot.large {
                width: 12px;
                height: 12px;
                min-width: 12px;
            }

            /* Intent colors - filled variant */
            .badge.filled.intent-primary {
                background: #409cff;
                color: #fff;
            }

            .badge.filled.intent-success {
                background: #30d158;
                color: #fff;
            }

            .badge.filled.intent-warning {
                background: #ff9f0a;
                color: #000;
            }

            .badge.filled.intent-danger {
                background: #ff3b30;
                color: #fff;
            }

            .badge.filled.intent-neutral {
                background: #8e8e93;
                color: #fff;
            }

            /* Intent colors - outline variant */
            .badge.outline.intent-primary {
                background: transparent;
                color: #409cff;
                border: 1px solid #409cff;
            }

            .badge.outline.intent-success {
                background: transparent;
                color: #30d158;
                border: 1px solid #30d158;
            }

            .badge.outline.intent-warning {
                background: transparent;
                color: #ff9f0a;
                border: 1px solid #ff9f0a;
            }

            .badge.outline.intent-danger {
                background: transparent;
                color: #ff3b30;
                border: 1px solid #ff3b30;
            }

            .badge.outline.intent-neutral {
                background: transparent;
                color: #8e8e93;
                border: 1px solid #8e8e93;
            }

            /* Intent colors - subtle variant */
            .badge.subtle.intent-primary {
                background: rgba(64, 156, 255, 0.15);
                color: #409cff;
            }

            .badge.subtle.intent-success {
                background: rgba(48, 209, 88, 0.15);
                color: #30d158;
            }

            .badge.subtle.intent-warning {
                background: rgba(255, 159, 10, 0.15);
                color: #ff9f0a;
            }

            .badge.subtle.intent-danger {
                background: rgba(255, 59, 48, 0.15);
                color: #ff3b30;
            }

            .badge.subtle.intent-neutral {
                background: rgba(142, 142, 147, 0.15);
                color: #8e8e93;
            }

            /* Pulse animation */
            .badge.pulse::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border-radius: inherit;
                background: inherit;
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                z-index: -1;
            }

            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                    transform: scale(1);
                }
                50% {
                    opacity: 0.5;
                    transform: scale(1.1);
                }
            }
        `;
    }

    getHTML() {
        const intent = this.getAttribute('intent') || 'primary';
        const variant = this.getAttribute('variant') || 'filled';
        const size = this.getAttribute('size') || 'medium';
        const pulse = this.hasAttribute('pulse');
        const content = this.textContent.trim();

        // If variant is dot, don't show content
        const displayContent = variant === 'dot' ? '' : content;

        return `
            <span class="badge ${variant} ${size} intent-${intent} ${pulse ? 'pulse' : ''}" role="status" aria-label="${content || 'notification'}">
                ${displayContent}
            </span>
        `;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                ${this.getCSS()}
            </style>
            ${this.getHTML()}
        `;
    }

    setupEventListeners() {
        // No event listeners needed for badge component
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (this.shadowRoot.innerHTML && oldValue !== newValue) {
            this.render();
        }
    }
}

// ============================================================================
// POPOVER COMPONENT (Tooltips, popovers, contextual overlays)
// ============================================================================

class SemanticPopover extends SemanticComponent {
    static get observedAttributes() {
        return ['open', 'position', 'trigger'];
    }

    constructor() {
        super();
        this.isOpen = false;
        this.triggerElement = null;
    }

    getCSS() {
        return `
            :host {
                position: relative;
                display: inline-block;
            }

            .popover-trigger {
                display: inline-block;
                cursor: pointer;
            }

            .popover-content {
                position: absolute;
                background: #2c2c2e;
                border: 1px solid #48484a;
                border-radius: 8px;
                padding: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                z-index: 1000;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease, transform 0.2s ease;
                min-width: 150px;
                max-width: 300px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                color: #fff;
                line-height: 1.5;
            }

            .popover-content.open {
                opacity: 1;
                pointer-events: auto;
            }

            /* Positions */
            .popover-content.top {
                bottom: calc(100% + 8px);
                left: 50%;
                transform: translateX(-50%) translateY(4px);
            }

            .popover-content.top.open {
                transform: translateX(-50%) translateY(0);
            }

            .popover-content.bottom {
                top: calc(100% + 8px);
                left: 50%;
                transform: translateX(-50%) translateY(-4px);
            }

            .popover-content.bottom.open {
                transform: translateX(-50%) translateY(0);
            }

            .popover-content.left {
                right: calc(100% + 8px);
                top: 50%;
                transform: translateY(-50%) translateX(4px);
            }

            .popover-content.left.open {
                transform: translateY(-50%) translateX(0);
            }

            .popover-content.right {
                left: calc(100% + 8px);
                top: 50%;
                transform: translateY(-50%) translateX(-4px);
            }

            .popover-content.right.open {
                transform: translateY(-50%) translateX(0);
            }

            /* Arrow */
            .popover-arrow {
                position: absolute;
                width: 8px;
                height: 8px;
                background: #2c2c2e;
                border: 1px solid #48484a;
                transform: rotate(45deg);
            }

            .popover-content.top .popover-arrow {
                bottom: -5px;
                left: 50%;
                margin-left: -4px;
                border-top: none;
                border-left: none;
            }

            .popover-content.bottom .popover-arrow {
                top: -5px;
                left: 50%;
                margin-left: -4px;
                border-bottom: none;
                border-right: none;
            }

            .popover-content.left .popover-arrow {
                right: -5px;
                top: 50%;
                margin-top: -4px;
                border-left: none;
                border-bottom: none;
            }

            .popover-content.right .popover-arrow {
                left: -5px;
                top: 50%;
                margin-top: -4px;
                border-right: none;
                border-top: none;
            }

            .popover-title {
                font-weight: 600;
                margin-bottom: 4px;
                color: #fff;
            }

            .popover-body {
                color: #ababab;
            }

            /* Mobile responsive */
            @media (max-width: 640px) {
                .popover-content {
                    max-width: calc(100vw - 32px);
                    font-size: 13px;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .popover-content {
                    transition: none;
                }
            }
        `;
    }

    getHTML() {
        const position = this.getAttribute('position') || 'top';
        const title = this.getAttribute('title') || '';
        const content = this.getAttribute('content') || '';

        return `
            <div class="popover-trigger">
                <slot name="trigger"></slot>
            </div>
            <div class="popover-content ${position} ${this.isOpen ? 'open' : ''}" role="tooltip">
                <div class="popover-arrow"></div>
                ${title ? `<div class="popover-title">${title}</div>` : ''}
                <div class="popover-body">
                    ${content}
                    <slot name="content"></slot>
                </div>
            </div>
        `;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                ${this.getCSS()}
            </style>
            ${this.getHTML()}
        `;
    }

    setupEventListeners() {
        const trigger = this.getAttribute('trigger') || 'hover';
        const triggerEl = this.shadowRoot.querySelector('.popover-trigger');
        const contentEl = this.shadowRoot.querySelector('.popover-content');

        if (!triggerEl || !contentEl) return;

        if (trigger === 'hover') {
            triggerEl.addEventListener('mouseenter', () => this.show());
            triggerEl.addEventListener('mouseleave', () => this.hide());
            contentEl.addEventListener('mouseenter', () => this.show());
            contentEl.addEventListener('mouseleave', () => this.hide());
        } else if (trigger === 'click') {
            triggerEl.addEventListener('click', () => this.toggle());
            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.contains(e.target)) {
                    this.hide();
                }
            });
        } else if (trigger === 'focus') {
            triggerEl.addEventListener('focusin', () => this.show());
            triggerEl.addEventListener('focusout', () => this.hide());
        }
    }

    show() {
        this.isOpen = true;
        const contentEl = this.shadowRoot.querySelector('.popover-content');
        if (contentEl) {
            contentEl.classList.add('open');
        }
        this.dispatchEvent(new CustomEvent('popover-show'));
    }

    hide() {
        this.isOpen = false;
        const contentEl = this.shadowRoot.querySelector('.popover-content');
        if (contentEl) {
            contentEl.classList.remove('open');
        }
        this.dispatchEvent(new CustomEvent('popover-hide'));
    }

    toggle() {
        if (this.isOpen) {
            this.hide();
        } else {
            this.show();
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'open' && this.shadowRoot.innerHTML) {
            if (newValue !== null) {
                this.show();
            } else {
                this.hide();
            }
        } else if (this.shadowRoot.innerHTML && oldValue !== newValue) {
            this.render();
            this.setupEventListeners();
        }
    }
}

// ============================================================================
// BREADCRUMB COMPONENT (Navigation hierarchy)
// ============================================================================

class SemanticBreadcrumb extends SemanticComponent {
    static get observedAttributes() {
        return ['separator'];
    }

    getCSS() {
        return `
            .breadcrumb-container {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 8px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                padding: 12px 0;
            }

            .breadcrumb-item {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #8e8e93;
                text-decoration: none;
                transition: color 0.15s ease;
                min-height: 44px;
                padding: 8px 12px;
                border-radius: 6px;
            }

            .breadcrumb-item:hover {
                color: #409cff;
                background: rgba(64, 156, 255, 0.1);
            }

            .breadcrumb-item.active {
                color: #fff;
                font-weight: 500;
                pointer-events: none;
                background: transparent;
            }

            .breadcrumb-separator {
                color: #48484a;
                user-select: none;
                font-size: 12px;
                padding: 0 4px;
            }

            /* Link styles */
            a.breadcrumb-item {
                cursor: pointer;
            }

            a.breadcrumb-item:focus-visible {
                outline: 2px solid #409cff;
                outline-offset: 2px;
                border-radius: 6px;
            }

            /* Mobile responsive */
            @media (max-width: 640px) {
                .breadcrumb-container {
                    font-size: 13px;
                }

                .breadcrumb-item {
                    padding: 10px 14px;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .breadcrumb-item {
                    transition: none;
                }
            }
        `;
    }

    getHTML() {
        return `
            <nav class="breadcrumb-container" aria-label="Breadcrumb">
                <slot></slot>
            </nav>
        `;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                ${this.getCSS()}
            </style>
            ${this.getHTML()}
        `;
    }

    setupEventListeners() {
        setTimeout(() => {
            this.renderBreadcrumbs();
        }, 0);
    }

    renderBreadcrumbs() {
        const separator = this.getAttribute('separator') || '/';
        const items = Array.from(this.querySelectorAll('breadcrumb-item'));
        const container = this.shadowRoot.querySelector('.breadcrumb-container');

        // Clear existing content
        container.innerHTML = '';

        items.forEach((item, index) => {
            const isLast = index === items.length - 1;
            const href = item.getAttribute('href');
            const active = item.hasAttribute('active') || isLast;

            // Create breadcrumb element
            let breadcrumbEl;
            if (href && !active) {
                breadcrumbEl = document.createElement('a');
                breadcrumbEl.href = href;
                breadcrumbEl.addEventListener('click', (e) => {
                    // Allow custom handling
                    const event = new CustomEvent('breadcrumb-click', {
                        detail: { href, index, item },
                        cancelable: true
                    });
                    if (!this.dispatchEvent(event)) {
                        e.preventDefault();
                    }
                });
            } else {
                breadcrumbEl = document.createElement('span');
            }

            breadcrumbEl.className = `breadcrumb-item ${active ? 'active' : ''}`;
            breadcrumbEl.textContent = item.textContent.trim();

            if (active) {
                breadcrumbEl.setAttribute('aria-current', 'page');
            }

            container.appendChild(breadcrumbEl);

            // Add separator if not last item
            if (!isLast) {
                const sep = document.createElement('span');
                sep.className = 'breadcrumb-separator';
                sep.textContent = separator;
                sep.setAttribute('aria-hidden', 'true');
                container.appendChild(sep);
            }
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (this.shadowRoot.innerHTML && oldValue !== newValue) {
            this.renderBreadcrumbs();
        }
    }
}

// ============================================================================
// CHILD ELEMENTS (for use within parent components)
// ============================================================================

class NavItem extends HTMLElement {
    connectedCallback() {
        const icon = this.getAttribute('icon') || '';
        const active = this.hasAttribute('active');
        const href = this.getAttribute('href') || '#';

        this.style.display = 'flex';
        this.style.alignItems = 'center';
        this.style.gap = '8px';
        this.setAttribute('role', 'link');
        this.setAttribute('tabindex', '0');

        if (active) {
            this.setAttribute('aria-current', 'page');
            this.classList.add('current');
        }

        if (icon) {
            const iconSpan = document.createElement('span');
            iconSpan.textContent = icon;
            iconSpan.style.fontSize = '18px';
            this.insertBefore(iconSpan, this.firstChild);
        }
    }
}

class ListItem extends HTMLElement {
    connectedCallback() {
        const selected = this.hasAttribute('selected');
        const value = this.getAttribute('value') || '';

        this.style.display = 'block';
        this.setAttribute('role', 'option');
        this.setAttribute('tabindex', '0');
        this.setAttribute('data-value', value);

        if (selected) {
            this.setAttribute('aria-selected', 'true');
            this.classList.add('selected');
        }
    }
}

class MenuItem extends HTMLElement {
    connectedCallback() {
        const icon = this.getAttribute('icon') || '';
        const shortcut = this.getAttribute('shortcut') || '';
        const intent = this.getAttribute('intent') || '';

        this.style.display = 'flex';
        this.style.alignItems = 'center';
        this.style.justifyContent = 'space-between';
        this.style.gap = '12px';
        this.setAttribute('role', 'menuitem');
        this.setAttribute('tabindex', '0');

        if (intent === 'destructive') {
            this.style.color = '#ff3b30';
        }

        const content = this.innerHTML;
        this.innerHTML = `
            ${icon ? `<span style="font-size: 16px;">${icon}</span>` : ''}
            <span style="flex: 1;">${content}</span>
            ${shortcut ? `<span style="font-size: 12px; color: #8a8a8a;">${shortcut}</span>` : ''}
        `;
    }
}

class MenuDivider extends HTMLElement {
    connectedCallback() {
        this.style.height = '1px';
        this.style.background = '#38383a';
        this.style.margin = '4px 0';
        this.setAttribute('role', 'separator');
    }
}

class CardTitle extends HTMLElement {
    connectedCallback() {
        this.style.display = 'block';
        this.style.fontSize = '18px';
        this.style.fontWeight = '600';
        this.style.color = '#fff';
    }
}

class CardDescription extends HTMLElement {
    connectedCallback() {
        this.style.display = 'block';
        this.style.fontSize = '14px';
        this.style.color = '#ababab';
    }
}

class TabItem extends HTMLElement {
    connectedCallback() {
        // Tab item is just a marker element, actual rendering happens in SemanticTabs
        this.style.display = 'none';
    }
}

class TabPanel extends HTMLElement {
    connectedCallback() {
        // Tab panel will be moved into shadow DOM by SemanticTabs
        // No styling needed here
    }
}

class DisclosureItem extends HTMLElement {
    connectedCallback() {
        // Disclosure item is just a marker element, actual rendering happens in SemanticDisclosure
        this.style.display = 'none';
    }
}

class BreadcrumbItem extends HTMLElement {
    connectedCallback() {
        // Breadcrumb item is just a marker element, actual rendering happens in SemanticBreadcrumb
        this.style.display = 'none';
    }
}

// ============================================================================
// LAYOUT COMPONENTS (Phase 2)
// ============================================================================

/**
 * SemanticStack - Vertical or horizontal stacking with consistent spacing
 *
 * Attributes:
 * - direction: "vertical" | "horizontal" (default: "vertical")
 * - spacing: "1" | "2" | "3" | "4" | "6" | "8" (default: "4")
 * - align: "start" | "center" | "end" | "stretch" (default: "stretch")
 * - justify: "start" | "center" | "end" | "between" | "around" (default: "start")
 * - wrap: boolean (default: false)
 */
class SemanticStack extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['direction', 'spacing', 'align', 'justify', 'wrap'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        if (this.shadowRoot.innerHTML) {
            this.render();
        }
    }

    render() {
        const direction = this.getAttribute('direction') || 'vertical';
        const spacing = this.getAttribute('spacing') || '4';
        const align = this.getAttribute('align') || 'stretch';
        const justify = this.getAttribute('justify') || 'start';
        const wrap = this.hasAttribute('wrap');

        const spacingMap = {
            '1': '4px',
            '2': '8px',
            '3': '12px',
            '4': '16px',
            '6': '24px',
            '8': '32px'
        };

        const alignMap = {
            'start': 'flex-start',
            'center': 'center',
            'end': 'flex-end',
            'stretch': 'stretch'
        };

        const justifyMap = {
            'start': 'flex-start',
            'center': 'center',
            'end': 'flex-end',
            'between': 'space-between',
            'around': 'space-around'
        };

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-direction: ${direction === 'horizontal' ? 'row' : 'column'};
                    gap: ${spacingMap[spacing] || '16px'};
                    align-items: ${alignMap[align] || 'stretch'};
                    justify-content: ${justifyMap[justify] || 'flex-start'};
                    ${wrap ? 'flex-wrap: wrap;' : ''}
                    width: 100%;
                }

                /* Accessibility: make stack keyboard navigable if it contains focusable items */
                :host(:focus-within) {
                    outline: 2px solid transparent;
                }

                /* Reduced motion support */
                @media (prefers-reduced-motion: reduce) {
                    :host {
                        transition: none;
                    }
                }
            </style>
            <slot></slot>
        `;
    }
}

/**
 * SemanticGrid - Responsive grid layouts with automatic columns
 *
 * Attributes:
 * - cols: "1" | "2" | "3" | "4" | "auto-fit" | "auto-fill" (default: "auto-fit")
 * - gap: "1" | "2" | "3" | "4" | "6" | "8" (default: "4")
 * - min-width: minimum column width for auto layouts (default: "250px")
 * - responsive: boolean - automatically adjust columns on mobile (default: true)
 */
class SemanticGrid extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['cols', 'gap', 'min-width', 'responsive'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        if (this.shadowRoot.innerHTML) {
            this.render();
        }
    }

    render() {
        const cols = this.getAttribute('cols') || 'auto-fit';
        const gap = this.getAttribute('gap') || '4';
        const minWidth = this.getAttribute('min-width') || '250px';
        const responsive = this.hasAttribute('responsive') !== false;

        const spacingMap = {
            '1': '4px',
            '2': '8px',
            '3': '12px',
            '4': '16px',
            '6': '24px',
            '8': '32px'
        };

        let gridTemplate;
        if (cols === 'auto-fit' || cols === 'auto-fill') {
            gridTemplate = `repeat(${cols}, minmax(${minWidth}, 1fr))`;
        } else {
            gridTemplate = `repeat(${cols}, minmax(0, 1fr))`;
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: grid;
                    grid-template-columns: ${gridTemplate};
                    gap: ${spacingMap[gap] || '16px'};
                    width: 100%;
                    box-sizing: border-box;
                }

                ${responsive ? `
                /* Mobile responsive - stack on small screens */
                @media (max-width: 640px) {
                    :host {
                        grid-template-columns: 1fr;
                    }
                }
                ` : ''}

                /* Accessibility */
                :host(:focus-within) {
                    outline: 2px solid transparent;
                }

                /* Reduced motion support */
                @media (prefers-reduced-motion: reduce) {
                    :host {
                        transition: none;
                    }
                }

                /* Ensure grid items can grow to fill available space */
                ::slotted(*) {
                    min-width: 0;
                }
            </style>
            <slot></slot>
        `;
    }
}

/**
 * SemanticContainer - Max-width containers with responsive padding
 *
 * Attributes:
 * - size: "small" | "medium" | "large" | "xlarge" | "full" (default: "large")
 * - padding: boolean - add responsive padding (default: true)
 */
class SemanticContainer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['size', 'padding'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        if (this.shadowRoot.innerHTML) {
            this.render();
        }
    }

    render() {
        const size = this.getAttribute('size') || 'large';
        const padding = this.hasAttribute('padding') !== false;

        const sizeMap = {
            'small': '640px',
            'medium': '768px',
            'large': '1024px',
            'xlarge': '1280px',
            'full': '100%'
        };

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    max-width: ${sizeMap[size] || '1024px'};
                    margin-left: auto;
                    margin-right: auto;
                    width: 100%;
                    ${padding ? 'padding: 0 20px;' : ''}
                }

                /* Ensure semantic-grid children fill width */
                ::slotted(semantic-grid) {
                    width: 100%;
                    box-sizing: border-box;
                }

                ${padding ? `
                /* Responsive padding */
                @media (min-width: 640px) {
                    :host {
                        padding: 0 24px;
                    }
                }

                @media (min-width: 1024px) {
                    :host {
                        padding: 0 32px;
                    }
                }
                ` : ''}

                /* Accessibility: container as landmark */
                :host {
                    role: region;
                }
            </style>
            <slot></slot>
        `;
    }
}

customElements.define('semantic-action', SemanticAction);
customElements.define('semantic-card', SemanticCard);
customElements.define('semantic-feedback', SemanticFeedback);
customElements.define('semantic-adjuster', SemanticAdjuster);
customElements.define('semantic-input', SemanticInput);
customElements.define('semantic-modal', SemanticModal);
customElements.define('semantic-navigator', SemanticNavigator);
customElements.define('semantic-list', SemanticList);
customElements.define('semantic-menu', SemanticMenu);
customElements.define('semantic-tabs', SemanticTabs);
customElements.define('semantic-disclosure', SemanticDisclosure);
customElements.define('semantic-progress', SemanticProgress);
customElements.define('semantic-badge', SemanticBadge);
customElements.define('semantic-popover', SemanticPopover);
customElements.define('semantic-breadcrumb', SemanticBreadcrumb);
customElements.define('semantic-stack', SemanticStack);
customElements.define('semantic-grid', SemanticGrid);
customElements.define('semantic-container', SemanticContainer);

// Child elements
customElements.define('nav-item', NavItem);
customElements.define('list-item', ListItem);
customElements.define('menu-item', MenuItem);
customElements.define('menu-divider', MenuDivider);
customElements.define('card-title', CardTitle);
customElements.define('card-description', CardDescription);
customElements.define('tab-item', TabItem);
customElements.define('tab-panel', TabPanel);
customElements.define('disclosure-item', DisclosureItem);
customElements.define('breadcrumb-item', BreadcrumbItem);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SemanticAction,
        SemanticCard,
        SemanticFeedback,
        SemanticAdjuster,
        SemanticInput,
        SemanticModal,
        SemanticNavigator,
        SemanticList,
        SemanticMenu,
        ContextManager
    };
}
