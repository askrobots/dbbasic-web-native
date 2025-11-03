/**
 * Semantic Components v1.0.0
 * semantic-components.js
 *
 * Intent-based, context-aware, modality-agnostic web components
 * https://semantic-components.dev
 *
 * Copyright (c) 2025 Semantic Components Team
 * Released under the MIT License
 */

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
            }
            * {
                box-sizing: border-box;
            }
        `;
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
                }

                button:focus-visible {
                    outline: 3px solid #4d9fff;
                    outline-offset: 2px;
                }

                /* Intent styles */
                button[data-intent="primary"] {
                    background: #007aff;
                    color: white;
                }

                button[data-intent="secondary"] {
                    background: #8e8e93;
                    color: white;
                }

                button[data-intent="tertiary"] {
                    background: transparent;
                    color: #007aff;
                    border: 2px solid #007aff;
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
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                button:active:not(:disabled) {
                    transform: scale(0.96);
                }

                button:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
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
        return ['media-url', 'media-alt'];
    }

    render() {
        const mediaUrl = this.getAttribute('media-url') || '';
        const mediaAlt = this.getAttribute('media-alt') || '';

        this.shadowRoot.innerHTML = `
            <style>
                ${this.getStyles()}

                .card {
                    background: #1c1c1e;
                    border: 2px solid #38383a;
                    border-radius: 12px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.3s;
                    position: relative;
                }

                .card:hover {
                    border-color: #007aff;
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
                    border: 2px solid #007aff;
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
                    color: #98989d;
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
                    border-color: #007aff;
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
                    color: #98989d;
                    cursor: pointer;
                    font-size: 20px;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                }

                .dismiss:hover {
                    color: #fff;
                }

                :host([attention-state="deferred"]) {
                    opacity: 0.5;
                    transform: scale(0.95);
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
        return ['value', 'min', 'max', 'step', 'label'];
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
                    color: #fff;
                }

                .controls {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .value {
                    font-size: 32px;
                    font-weight: 700;
                    color: #007aff;
                    min-width: 80px;
                    text-align: center;
                }

                button {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: #2c2c2e;
                    border: 2px solid #38383a;
                    color: #fff;
                    font-size: 24px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                button:hover {
                    background: #007aff;
                    border-color: #007aff;
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
                    background: #007aff;
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
                    border: 3px solid #007aff;
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
        return ['type', 'label', 'placeholder', 'value', 'required', 'disabled'];
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
                    color: #fff;
                }

                input, textarea {
                    min-height: 44px;
                    padding: 12px 16px;
                    background: #1c1c1e;
                    border: 2px solid #38383a;
                    border-radius: 8px;
                    color: #fff;
                    font-size: 16px;
                    font-family: inherit;
                    transition: all 0.2s;
                }

                textarea {
                    min-height: 120px;
                    resize: vertical;
                }

                input:focus, textarea:focus {
                    outline: none;
                    border-color: #007aff;
                    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
                }

                input::placeholder, textarea::placeholder {
                    color: #98989d;
                }

                input:disabled, textarea:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .voice-hint {
                    font-size: 12px;
                    color: #98989d;
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
                    color: #98989d;
                    font-size: 32px;
                    cursor: pointer;
                    padding: 0;
                    width: 32px;
                    height: 32px;
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
        const type = this.getAttribute('type') || 'horizontal';
        const current = this.getAttribute('current') || '';

        this.shadowRoot.innerHTML = `
            <style>
                ${this.getStyles()}

                .navigator {
                    display: flex;
                    gap: 4px;
                }

                .navigator[data-type="horizontal"] {
                    flex-direction: row;
                }

                .navigator[data-type="vertical"] {
                    flex-direction: column;
                }

                ::slotted(*) {
                    display: flex;
                    align-items: center;
                    padding: 12px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #98989d;
                    text-decoration: none;
                    user-select: none;
                }

                ::slotted(:hover) {
                    background: #2c2c2e;
                    color: #fff;
                }

                ::slotted([aria-current="page"]),
                ::slotted(.current) {
                    background: #007aff;
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
                    padding: 16px;
                    background: #1c1c1e;
                    border: 1px solid #38383a;
                    border-radius: 8px;
                    transition: all 0.2s;
                }

                :host([selectable]) ::slotted(*) {
                    cursor: pointer;
                }

                :host([selectable]) ::slotted(:hover) {
                    background: #2c2c2e;
                    border-color: #007aff;
                }

                :host([selectable]) ::slotted([aria-selected="true"]),
                :host([selectable]) ::slotted(.selected) {
                    background: rgba(0, 122, 255, 0.1);
                    border-color: #007aff;
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
                    padding: 10px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.15s;
                    color: #fff;
                    text-decoration: none;
                    user-select: none;
                }

                ::slotted(:hover) {
                    background: #007aff;
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
// REGISTER COMPONENTS
// ============================================================================

customElements.define('semantic-action', SemanticAction);
customElements.define('semantic-card', SemanticCard);
customElements.define('semantic-feedback', SemanticFeedback);
customElements.define('semantic-adjuster', SemanticAdjuster);
customElements.define('semantic-input', SemanticInput);
customElements.define('semantic-modal', SemanticModal);
customElements.define('semantic-navigator', SemanticNavigator);
customElements.define('semantic-list', SemanticList);
customElements.define('semantic-menu', SemanticMenu);

// Export for module usage
;
}

export default window.semanticContext || {};