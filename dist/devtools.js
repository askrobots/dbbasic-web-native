/**
 * Semantic Components v1.0.0
 * devtools.js
 *
 * Intent-based, context-aware, modality-agnostic web components
 * https://semantic-components.dev
 *
 * Copyright (c) 2025 Semantic Components Team
 * Released under the MIT License
 */

/**
 * Semantic Components Developer Tools
 * Real-time debugging and inspection interface
 * Shows context state, attention budget, intent logs, and performance metrics
 */

class SemanticDevTools {
    constructor() {
        this.isVisible = false;
        this.intentLog = [];
        this.maxLogEntries = 50;
        this.performanceMetrics = {
            intentsFired: 0,
            contextswitches: 0,
            avgResponseTime: 0
        };

        this.init();
    }

    init() {
        this.createUI();
        this.setupEventListeners();
        this.startMonitoring();

        // Keyboard shortcut: Ctrl+Shift+D
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggle();
            }
        });

        console.log('DevTools initialized. Press Ctrl+Shift+D to toggle.');
    }

    createUI() {
        const devtools = document.createElement('div');
        devtools.id = 'semantic-devtools';
        devtools.innerHTML = `
            <style>
                #semantic-devtools {
                    position: fixed;
                    top: 0;
                    right: -450px;
                    width: 450px;
                    height: 100vh;
                    background: #1a1a1a;
                    border-left: 2px solid #007aff;
                    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
                    z-index: 999999;
                    font-family: 'Monaco', 'Courier New', monospace;
                    font-size: 12px;
                    color: #fff;
                    transition: right 0.3s;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                #semantic-devtools.visible {
                    right: 0;
                }

                .devtools-header {
                    padding: 16px;
                    background: #007aff;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-shrink: 0;
                }

                .devtools-title {
                    font-weight: 700;
                    font-size: 14px;
                }

                .devtools-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                }

                .devtools-tabs {
                    display: flex;
                    background: #2a2a2a;
                    border-bottom: 1px solid #3a3a3a;
                    flex-shrink: 0;
                }

                .devtools-tab {
                    padding: 12px 16px;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                }

                .devtools-tab:hover {
                    background: #3a3a3a;
                }

                .devtools-tab.active {
                    border-bottom-color: #007aff;
                    background: #3a3a3a;
                }

                .devtools-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                }

                .devtools-panel {
                    display: none;
                }

                .devtools-panel.active {
                    display: block;
                }

                .metric-group {
                    margin-bottom: 20px;
                }

                .metric-label {
                    color: #98989d;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                }

                .metric-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #007aff;
                }

                .metric-bar {
                    height: 8px;
                    background: #2a2a2a;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-top: 8px;
                }

                .metric-bar-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #007aff, #00ff88);
                    transition: width 0.3s;
                }

                .log-entry {
                    padding: 8px;
                    margin-bottom: 4px;
                    background: #2a2a2a;
                    border-left: 3px solid;
                    border-radius: 4px;
                    font-size: 11px;
                    line-height: 1.4;
                }

                .log-entry.intent {
                    border-color: #007aff;
                }

                .log-entry.context {
                    border-color: #ff9500;
                }

                .log-entry.voice {
                    border-color: #ff3b30;
                }

                .log-entry.error {
                    border-color: #ff3b30;
                    background: rgba(255, 59, 48, 0.1);
                }

                .log-time {
                    color: #98989d;
                    margin-right: 8px;
                }

                .log-type {
                    display: inline-block;
                    padding: 2px 6px;
                    border-radius: 3px;
                    background: #007aff;
                    margin-right: 8px;
                    font-size: 10px;
                }

                .component-list {
                    list-style: none;
                }

                .component-item {
                    padding: 8px;
                    margin-bottom: 4px;
                    background: #2a2a2a;
                    border-radius: 4px;
                }

                .component-name {
                    font-weight: 600;
                    color: #007aff;
                }

                .component-state {
                    font-size: 11px;
                    color: #98989d;
                    margin-top: 4px;
                }

                .context-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .context-item {
                    padding: 12px;
                    background: #2a2a2a;
                    border-radius: 4px;
                }

                .context-item-label {
                    font-size: 10px;
                    color: #98989d;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }

                .context-item-value {
                    font-size: 16px;
                    font-weight: 600;
                }

                .status-indicator {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    margin-right: 6px;
                }

                .status-active { background: #34c759; }
                .status-idle { background: #ff9500; }
                .status-error { background: #ff3b30; }

                .toggle-button {
                    position: fixed;
                    top: 50%;
                    right: 0;
                    transform: translateY(-50%);
                    background: #007aff;
                    border: none;
                    border-radius: 8px 0 0 8px;
                    padding: 12px 8px;
                    color: white;
                    cursor: pointer;
                    font-size: 16px;
                    z-index: 999998;
                    writing-mode: vertical-rl;
                    text-orientation: mixed;
                    font-weight: 700;
                    letter-spacing: 1px;
                }

                .toggle-button:hover {
                    background: #0056b3;
                }
            </style>

            <div class="devtools-header">
                <div class="devtools-title">⚡ Semantic DevTools</div>
                <button class="devtools-close" onclick="window.semanticDevTools.toggle()">×</button>
            </div>

            <div class="devtools-tabs">
                <div class="devtools-tab active" data-tab="overview">Overview</div>
                <div class="devtools-tab" data-tab="context">Context</div>
                <div class="devtools-tab" data-tab="components">Components</div>
                <div class="devtools-tab" data-tab="log">Log</div>
            </div>

            <div class="devtools-content">
                <!-- Overview Panel -->
                <div class="devtools-panel active" id="panel-overview">
                    <div class="metric-group">
                        <div class="metric-label">Attention Budget</div>
                        <div class="metric-value" id="metric-screen">0%</div>
                        <div class="metric-bar">
                            <div class="metric-bar-fill" id="bar-screen" style="width: 0%"></div>
                        </div>
                    </div>

                    <div class="metric-group">
                        <div class="metric-label">Audio Time</div>
                        <div class="metric-value" id="metric-audio">0s</div>
                        <div class="metric-bar">
                            <div class="metric-bar-fill" id="bar-audio" style="width: 0%"></div>
                        </div>
                    </div>

                    <div class="metric-group">
                        <div class="metric-label">Cognitive Load</div>
                        <div class="metric-value" id="metric-cognitive">0/3</div>
                        <div class="metric-bar">
                            <div class="metric-bar-fill" id="bar-cognitive" style="width: 0%"></div>
                        </div>
                    </div>

                    <div class="metric-group">
                        <div class="metric-label">Performance</div>
                        <div style="font-size: 14px; color: #fff; margin-top: 8px;">
                            <div>Intents Fired: <span id="perf-intents">0</span></div>
                            <div>Context Switches: <span id="perf-switches">0</span></div>
                            <div>Components: <span id="perf-components">0</span></div>
                        </div>
                    </div>
                </div>

                <!-- Context Panel -->
                <div class="devtools-panel" id="panel-context">
                    <div class="metric-group">
                        <div class="metric-label">Current Modality</div>
                        <div class="metric-value" id="context-modality">screen</div>
                    </div>

                    <div class="context-grid">
                        <div class="context-item">
                            <div class="context-item-label">Noise Level</div>
                            <div class="context-item-value" id="context-noise">0%</div>
                        </div>
                        <div class="context-item">
                            <div class="context-item-label">Viewers</div>
                            <div class="context-item-value" id="context-viewers">1</div>
                        </div>
                        <div class="context-item">
                            <div class="context-item-label">Lighting</div>
                            <div class="context-item-value" id="context-lighting">normal</div>
                        </div>
                        <div class="context-item">
                            <div class="context-item-label">User State</div>
                            <div class="context-item-value" id="context-state">active</div>
                        </div>
                    </div>

                    <div class="metric-group" style="margin-top: 20px;">
                        <div class="metric-label">Voice Recognition</div>
                        <div style="font-size: 14px; margin-top: 8px;">
                            <span class="status-indicator" id="voice-status"></span>
                            <span id="voice-text">Inactive</span>
                        </div>
                    </div>

                    <div class="metric-group">
                        <div class="metric-label">Context Detection</div>
                        <div style="font-size: 14px; margin-top: 8px;">
                            <span class="status-indicator" id="detection-status"></span>
                            <span id="detection-text">Inactive</span>
                        </div>
                    </div>
                </div>

                <!-- Components Panel -->
                <div class="devtools-panel" id="panel-components">
                    <ul class="component-list" id="component-list">
                        <!-- Populated dynamically -->
                    </ul>
                </div>

                <!-- Log Panel -->
                <div class="devtools-panel" id="panel-log">
                    <div id="log-container">
                        <!-- Populated dynamically -->
                    </div>
                </div>
            </div>

            <button class="toggle-button" onclick="window.semanticDevTools.toggle()">DEVTOOLS</button>
        `;

        document.body.appendChild(devtools);
        this.panel = devtools;
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.devtools-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Listen to all intents
        document.addEventListener('intent', (e) => {
            this.logIntent(e.detail);
            this.performanceMetrics.intentsFired++;
        });

        // Listen to context changes
        if (window.semanticContext) {
            window.semanticContext.onChange((context) => {
                this.logContext(context);
                this.performanceMetrics.contextswitches++;
                this.updateContextDisplay();
            });
        }
    }

    switchTab(tabName) {
        document.querySelectorAll('.devtools-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.devtools-panel').forEach(p => p.classList.remove('active'));

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`panel-${tabName}`).classList.add('active');
    }

    startMonitoring() {
        setInterval(() => {
            this.updateMetrics();
            this.updateComponents();
        }, 1000);
    }

    updateMetrics() {
        if (!window.semanticContext) return;

        const context = window.semanticContext.context;
        const attention = context.attention;

        // Screen space
        const screenPercent = (attention.usedScreenSpace / attention.maxScreenSpace) * 100;
        document.getElementById('metric-screen').textContent = Math.round(attention.usedScreenSpace) + '%';
        document.getElementById('bar-screen').style.width = screenPercent + '%';

        // Audio time
        const audioPercent = (attention.usedAudioTime / attention.maxAudioTime) * 100;
        document.getElementById('metric-audio').textContent = attention.usedAudioTime.toFixed(1) + 's';
        document.getElementById('bar-audio').style.width = audioPercent + '%';

        // Cognitive load
        const cognitivePercent = (attention.usedCognitiveLoad / attention.maxCognitiveLoad) * 100;
        document.getElementById('metric-cognitive').textContent = attention.usedCognitiveLoad.toFixed(1) + '/3';
        document.getElementById('bar-cognitive').style.width = cognitivePercent + '%';

        // Performance
        document.getElementById('perf-intents').textContent = this.performanceMetrics.intentsFired;
        document.getElementById('perf-switches').textContent = this.performanceMetrics.contextswitches;
        document.getElementById('perf-components').textContent = window.semanticContext.components.size;
    }

    updateContextDisplay() {
        if (!window.semanticContext) return;

        const context = window.semanticContext.context;

        document.getElementById('context-modality').textContent = context.modality;
        document.getElementById('context-noise').textContent = context.environment.noiseLevel + '%';
        document.getElementById('context-viewers').textContent = context.environment.viewerCount;
        document.getElementById('context-lighting').textContent = context.environment.lighting;

        const userState = context.user.isBusy ? 'Busy' : context.user.inFocusMode ? 'Focus' : 'Active';
        document.getElementById('context-state').textContent = userState;

        // Voice status
        if (window.voiceSystem) {
            const voiceActive = window.voiceSystem.isListening;
            document.getElementById('voice-status').className = 'status-indicator ' + (voiceActive ? 'status-active' : 'status-idle');
            document.getElementById('voice-text').textContent = voiceActive ? 'Active' : 'Inactive';
        }

        // Detection status
        if (window.contextDetection) {
            const detectionActive = window.contextDetection.isRunning;
            document.getElementById('detection-status').className = 'status-indicator ' + (detectionActive ? 'status-active' : 'status-idle');
            document.getElementById('detection-text').textContent = detectionActive ? 'Running' : 'Stopped';
        }
    }

    updateComponents() {
        if (!window.semanticContext) return;

        const list = document.getElementById('component-list');
        list.innerHTML = '';

        Array.from(window.semanticContext.components).forEach(component => {
            const tagName = component.tagName.toLowerCase();
            const attentionState = component.getAttribute('attention-state') || 'unknown';
            const id = component.id || 'unnamed';

            const li = document.createElement('li');
            li.className = 'component-item';
            li.innerHTML = `
                <div class="component-name">&lt;${tagName}&gt; ${id}</div>
                <div class="component-state">
                    Attention: ${attentionState}
                    ${component.computeAttentionScore ? ` | Score: ${component.computeAttentionScore(window.semanticContext.context)}` : ''}
                </div>
            `;

            list.appendChild(li);
        });
    }

    logIntent(detail) {
        this.addLogEntry('intent', `${detail.type}`, detail);
    }

    logContext(context) {
        this.addLogEntry('context', 'Context updated', context);
    }

    addLogEntry(type, message, data = null) {
        const entry = {
            type,
            message,
            data,
            timestamp: new Date().toLocaleTimeString()
        };

        this.intentLog.unshift(entry);

        if (this.intentLog.length > this.maxLogEntries) {
            this.intentLog.pop();
        }

        this.updateLog();
    }

    updateLog() {
        const container = document.getElementById('log-container');
        container.innerHTML = this.intentLog.map(entry => `
            <div class="log-entry ${entry.type}">
                <span class="log-time">${entry.timestamp}</span>
                <span class="log-type">${entry.type.toUpperCase()}</span>
                ${entry.message}
                ${entry.data ? `<pre style="margin-top: 4px; opacity: 0.7; font-size: 10px;">${JSON.stringify(entry.data, null, 2).substring(0, 200)}...</pre>` : ''}
            </div>
        `).join('');
    }

    toggle() {
        this.isVisible = !this.isVisible;
        this.panel.classList.toggle('visible', this.isVisible);

        if (this.isVisible) {
            this.updateMetrics();
            this.updateContextDisplay();
            this.updateComponents();
        }
    }

    show() {
        this.isVisible = true;
        this.panel.classList.add('visible');
        this.updateMetrics();
        this.updateContextDisplay();
        this.updateComponents();
    }

    hide() {
        this.isVisible = false;
        this.panel.classList.remove('visible');
    }
}

// Initialize devtools
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        window.semanticDevTools = new SemanticDevTools();
    });
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SemanticDevTools;
}
