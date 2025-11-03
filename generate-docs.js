#!/usr/bin/env node

/**
 * Automatic Documentation Generator for Semantic Components
 *
 * Reads semantic-components.js and generates comprehensive documentation pages
 * for each component automatically.
 *
 * Usage: node generate-docs.js
 */

const fs = require('fs');
const path = require('path');

// Component metadata - extracted from component definitions
const components = {
    'semantic-action': {
        name: 'semantic-action',
        tagline: 'Intent-based button component with multi-modal interaction support',
        description: 'The semantic-action component represents a user action with clear intent and consequence. Instead of styling a generic "button", you declare the importance (intent) and consequence (sentiment) of the action.',
        attributes: [
            { name: 'intent', type: 'string', values: 'primary | secondary | tertiary', default: 'primary', description: 'Importance level in the interface hierarchy' },
            { name: 'sentiment', type: 'string', values: 'constructive | destructive | neutral', default: 'neutral', description: 'Consequence of the action (safe, dangerous, or neutral)' },
            { name: 'disabled', type: 'boolean', values: 'true | false', default: 'false', description: 'Whether the action is currently available' },
            { name: 'urgency', type: 'string', values: 'critical | high | medium | low', default: 'medium', description: 'Priority for attention budget scoring' },
            { name: 'attention-weight', type: 'number', values: '0-100', default: '50', description: 'Base attention priority (higher = more visible)' }
        ],
        events: [
            { name: 'activate', trigger: 'Click, tap, Enter, Space, voice "activate"', detail: '{ type: "activate" }', description: 'Main action event triggered by any input method' },
            { name: 'inspect', trigger: 'Long-press (500ms), voice "inspect"', detail: '{ type: "inspect" }', description: 'Preview/detail view event for long-press interactions' }
        ],
        states: [
            { name: 'Default', description: 'Blue background, white text, rounded corners, subtle shadow' },
            { name: 'Hover', description: 'Lifts up 2px, tight blue glow (8px blur, 0.6 opacity), brightness boost' },
            { name: 'Active', description: 'Scales 96% + pushes down 1px + inset shadow for "pressed in" feel' },
            { name: 'Focus', description: '3px blue outline, 2px offset for keyboard navigation' },
            { name: 'Disabled', description: 'Grey background (#3a3a3a), grey text (#8a8a8a), 60% opacity' }
        ],
        examples: [
            {
                label: 'Primary Intent',
                code: '<semantic-action intent="primary">Save Changes</semantic-action>',
                notes: 'Use for: The main action on the page\nVisual: Blue background (#0066cc), white text\nContrast: 5.9:1 (WCAG AA compliant)\nExamples: Save, Submit, Continue, Confirm'
            },
            {
                label: 'Constructive Sentiment',
                code: '<semantic-action intent="primary" sentiment="constructive">Save Changes</semantic-action>',
                notes: 'Use for: Positive, safe actions\nVisual: Green background (#34c759), white text\nContrast: 5.8:1 (WCAG AA compliant)\nExamples: Save, Create, Publish, Enable'
            },
            {
                label: 'Destructive Sentiment',
                code: '<semantic-action intent="primary" sentiment="destructive">Delete Forever</semantic-action>',
                notes: 'Use for: Dangerous, irreversible actions\nVisual: Red background (#ff3b30), white text\nContrast: 4.5:1 (WCAG AA minimum)\nExamples: Delete, Remove, Disable, Logout'
            }
        ]
    },

    'semantic-card': {
        name: 'semantic-card',
        tagline: 'Inspectable content cards with preview on hover and long-press',
        description: 'The semantic-card component displays content in a structured format with optional media, title, description, preview content, and actions. It automatically handles hover elevation and preview display.',
        attributes: [
            { name: 'media-url', type: 'attribute', values: 'URL', default: '', description: 'URL for image media' },
            { name: 'media-alt', type: 'attribute', values: 'text', default: '', description: 'Alt text for image' }
        ],
        slots: [
            { name: 'media-icon', description: 'Icon/emoji when no image' },
            { name: 'title', description: 'Card title' },
            { name: 'description', description: 'Card description/subtitle' },
            { name: 'preview', description: 'Content shown on hover/long-press' },
            { name: 'actions', description: 'Action buttons' }
        ],
        events: [
            { name: 'activate', trigger: 'Click on card', detail: '{ type: "activate" }', description: 'Card click/tap event' },
            { name: 'inspect', trigger: 'Long-press (500ms)', detail: '{ type: "inspect" }', description: 'Shows preview content' }
        ],
        states: [
            { name: 'Default', description: 'Flat, subtle shadow, grey border' },
            { name: 'Hover', description: 'Lifts 4px, blue border glow, preview slides in' },
            { name: 'Active', description: 'Slight scale down on click' }
        ],
        examples: [
            {
                label: 'Basic Card',
                code: `<semantic-card>
  <span slot="media-icon">🚀</span>
  <card-title slot="title">Project Alpha</card-title>
  <card-description slot="description">Next-gen platform</card-description>
  <div slot="preview">Preview content here</div>
</semantic-card>`,
                notes: 'Use for: Content previews, product cards, article teasers\nVisual: Dark background, hover elevation\nInteraction: Click to activate, long-press to preview'
            }
        ]
    },

    'semantic-input': {
        name: 'semantic-input',
        tagline: 'Form inputs with voice hints, validation, and multi-modal support',
        description: 'The semantic-input component provides form input fields with automatic validation states, voice dictation hints, and multi-modal support.',
        attributes: [
            { name: 'label', type: 'string', values: 'text', default: '', description: 'Label for the input' },
            { name: 'type', type: 'string', values: 'text | email | password | number', default: 'text', description: 'Input type' },
            { name: 'placeholder', type: 'string', values: 'text', default: '', description: 'Placeholder text' },
            { name: 'value', type: 'string', values: 'text', default: '', description: 'Current value' },
            { name: 'error', type: 'string', values: 'text', default: '', description: 'Error message' },
            { name: 'valid', type: 'boolean', values: 'true | false', default: 'false', description: 'Show valid state' },
            { name: 'disabled', type: 'boolean', values: 'true | false', default: 'false', description: 'Disable input' }
        ],
        events: [
            { name: 'input', trigger: 'User types', detail: '{ value }', description: 'Fires on every keystroke' },
            { name: 'change', trigger: 'Value changes and loses focus', detail: '{ value }', description: 'Fires when input is complete' },
            { name: 'focus', trigger: 'Input receives focus', detail: '{}', description: 'Focus event' },
            { name: 'blur', trigger: 'Input loses focus', detail: '{ value }', description: 'Blur event' }
        ],
        states: [
            { name: 'Default', description: 'Dark input with grey border' },
            { name: 'Focus', description: 'Blue border (#0066cc), blue glow' },
            { name: 'Valid', description: 'Green border (#34c759)' },
            { name: 'Error', description: 'Red border (#ff3b30) + red error text below' },
            { name: 'Disabled', description: 'Grey background, 50% opacity' }
        ],
        examples: [
            {
                label: 'Text Input',
                code: '<semantic-input label="Full Name" placeholder="Enter your name" type="text"></semantic-input>',
                notes: 'Use for: Text entry fields\nValidation: None by default\nVoice: "Type Full Name" to dictate'
            },
            {
                label: 'Valid State',
                code: '<semantic-input label="Email" value="user@example.com" type="email" valid></semantic-input>',
                notes: 'Use for: Showing successful validation\nVisual: Green border\nContrast: Meets WCAG AA'
            },
            {
                label: 'Error State',
                code: '<semantic-input label="Email" value="bad-email" type="email" error="Please enter a valid email"></semantic-input>',
                notes: 'Use for: Validation errors\nVisual: Red border + error message\nAccessibility: Error announced to screen readers'
            }
        ]
    },

    'semantic-modal': {
        name: 'semantic-modal',
        tagline: 'Context-aware modal dialogs with urgency levels and backdrop dismissal',
        description: 'The semantic-modal component displays overlay dialogs with attention budget awareness. Modals automatically adjust their urgency presentation and can be dismissed by clicking the backdrop or pressing Escape.',
        attributes: [
            { name: 'open', type: 'boolean', values: 'true | false', default: 'false', description: 'Whether the modal is currently visible' },
            { name: 'urgency', type: 'string', values: 'critical | high | medium | low', default: 'medium', description: 'Visual urgency level (critical shows red border)' },
            { name: 'dismissible', type: 'boolean', values: 'true | false', default: 'true', description: 'Whether modal can be dismissed by backdrop click/Escape' }
        ],
        slots: [
            { name: 'header', description: 'Modal title/header content' },
            { name: 'default', description: 'Main modal body content' },
            { name: 'actions', description: 'Modal footer with action buttons' }
        ],
        events: [
            { name: 'close', trigger: 'Backdrop click, Escape key, close button', detail: '{ type: "close" }', description: 'Modal closed event' }
        ],
        states: [
            { name: 'Closed', description: 'Hidden (display: none)' },
            { name: 'Open', description: 'Visible with backdrop fade-in and modal slide-up animation' },
            { name: 'Critical', description: 'Red border (#ff3b30) for urgent modals' }
        ],
        examples: [
            {
                label: 'Basic Modal',
                code: `<semantic-modal open>
  <div slot="header">Confirm Action</div>
  <div>Are you sure you want to continue?</div>
  <div slot="actions">
    <semantic-action intent="primary">Confirm</semantic-action>
    <semantic-action intent="secondary">Cancel</semantic-action>
  </div>
</semantic-modal>`,
                notes: 'Use for: Confirmation dialogs, forms, alerts\nVisual: Dark background, centered, backdrop blur\nInteraction: Click backdrop or press Escape to dismiss'
            }
        ]
    },

    'semantic-navigator': {
        name: 'semantic-navigator',
        tagline: 'Multi-modal navigation with tabs, breadcrumbs, and spatial layouts',
        description: 'The semantic-navigator component handles navigation UI patterns with support for tabs, sidebars, breadcrumbs, and spatial (AR/VR) navigation. It automatically highlights the current page.',
        attributes: [
            { name: 'type', type: 'string', values: 'tabs | menu | breadcrumbs | spatial', default: 'tabs', description: 'Navigation layout pattern' },
            { name: 'current', type: 'string', values: 'href or ID', default: '', description: 'Currently active navigation item' }
        ],
        slots: [
            { name: 'default', description: 'nav-item elements for navigation links' }
        ],
        events: [
            { name: 'navigate', trigger: 'Navigation item clicked', detail: '{ href, label }', description: 'Navigation event before route change' }
        ],
        states: [
            { name: 'Default', description: 'Items in grey (#8a8a8a), hover to white' },
            { name: 'Current', description: 'Active item in blue (#0066cc), bold text' },
            { name: 'Hover', description: 'Background highlight, white text' }
        ],
        examples: [
            {
                label: 'Tab Navigation',
                code: `<semantic-navigator type="tabs" current="/home">
  <nav-item href="/home" icon="🏠">Home</nav-item>
  <nav-item href="/profile" icon="👤">Profile</nav-item>
  <nav-item href="/settings" icon="⚙️">Settings</nav-item>
</semantic-navigator>`,
                notes: 'Use for: Tab navigation, page sections\nVisual: Horizontal tabs with border-bottom\nInteraction: Click to navigate, current highlighted'
            }
        ]
    },

    'semantic-list': {
        name: 'semantic-list',
        tagline: 'Selectable lists with keyboard navigation and ARIA support',
        description: 'The semantic-list component displays items in a vertical list with optional selection. Lists automatically handle keyboard navigation (arrow keys), focus management, and multi-select when enabled.',
        attributes: [
            { name: 'type', type: 'string', values: 'default | compact | spacious', default: 'default', description: 'Visual density of list items' },
            { name: 'selectable', type: 'boolean', values: 'true | false', default: 'false', description: 'Whether items can be selected' }
        ],
        slots: [
            { name: 'default', description: 'list-item elements' }
        ],
        events: [
            { name: 'select', trigger: 'Item clicked (when selectable)', detail: '{ item, index }', description: 'Item selection event' }
        ],
        states: [
            { name: 'Default', description: 'Grey borders, dark background' },
            { name: 'Hover (selectable)', description: 'Blue border highlight' },
            { name: 'Selected', description: 'Blue border, blue background tint' },
            { name: 'Focus', description: 'Blue outline for keyboard navigation' }
        ],
        examples: [
            {
                label: 'Selectable List',
                code: `<semantic-list selectable>
  <list-item>First Item</list-item>
  <list-item>Second Item</list-item>
  <list-item aria-selected="true">Selected Item</list-item>
</semantic-list>`,
                notes: 'Use for: Option selection, file lists, settings\nKeyboard: Arrow keys navigate, Space/Enter select\nAccessibility: ARIA selection states announced'
            }
        ]
    },

    'semantic-menu': {
        name: 'semantic-menu',
        tagline: 'Context menus and dropdowns with smart positioning',
        description: 'The semantic-menu component displays dropdown/context menus with automatic positioning relative to an anchor element. Menus close on outside click or Escape key.',
        attributes: [
            { name: 'open', type: 'boolean', values: 'true | false', default: 'false', description: 'Whether menu is currently shown' },
            { name: 'anchor', type: 'string', values: 'Element ID or selector', default: '', description: 'Element to position relative to' }
        ],
        slots: [
            { name: 'default', description: 'menu-item elements and menu-divider separators' }
        ],
        events: [
            { name: 'select', trigger: 'Menu item clicked', detail: '{ action, label }', description: 'Menu item selection event' },
            { name: 'close', trigger: 'Outside click, Escape key', detail: '{ type: "close" }', description: 'Menu closed event' }
        ],
        states: [
            { name: 'Closed', description: 'Hidden (display: none)' },
            { name: 'Open', description: 'Visible with scale-in animation, positioned near anchor' },
            { name: 'Hover (items)', description: 'Blue background on menu item hover' }
        ],
        examples: [
            {
                label: 'Dropdown Menu',
                code: `<semantic-action id="menu-btn">Options ▼</semantic-action>
<semantic-menu anchor="#menu-btn" open>
  <menu-item action="edit">✏️ Edit</menu-item>
  <menu-item action="copy">📋 Copy</menu-item>
  <menu-divider></menu-divider>
  <menu-item action="delete" intent="destructive">🗑️ Delete</menu-item>
</semantic-menu>`,
                notes: 'Use for: Action menus, context menus, dropdowns\nVisual: Floating panel with shadow\nInteraction: Click outside or Escape to close'
            }
        ]
    },

    'semantic-feedback': {
        name: 'semantic-feedback',
        tagline: 'Notifications, toasts, and alerts with urgency-based attention scoring',
        description: 'The semantic-feedback component displays user notifications with automatic urgency coloring and optional auto-dismiss. Feedback respects attention budget and suppresses low-priority notifications when user is busy.',
        attributes: [
            { name: 'urgency', type: 'string', values: 'critical | high | medium | low', default: 'medium', description: 'Urgency level (affects color and attention priority)' },
            { name: 'type', type: 'string', values: 'notification | alert | toast', default: 'notification', description: 'Feedback presentation style' },
            { name: 'auto-dismiss', type: 'boolean', values: 'true | false', default: 'false', description: 'Automatically dismiss after delay' }
        ],
        events: [
            { name: 'dismiss', trigger: 'Dismiss button clicked or auto-timeout', detail: '{ type: "dismiss" }', description: 'Feedback dismissed event' }
        ],
        states: [
            { name: 'Critical', description: 'Red border (#ff3b30), red background tint' },
            { name: 'High', description: 'Orange border (#ff9500), orange background tint' },
            { name: 'Medium', description: 'Blue border (#0066cc), blue background tint' },
            { name: 'Low', description: 'Grey border (#8a8a8a), minimal prominence' }
        ],
        examples: [
            {
                label: 'Success Notification',
                code: '<semantic-feedback urgency="medium" auto-dismiss>✅ Changes saved successfully</semantic-feedback>',
                notes: 'Use for: Success confirmations, status updates\nVisual: Blue border, slide-in animation\nDuration: Auto-dismisses after 3 seconds'
            },
            {
                label: 'Critical Alert',
                code: '<semantic-feedback urgency="critical">❌ Error: Unable to save changes. Please try again.</semantic-feedback>',
                notes: 'Use for: Errors, critical warnings\nVisual: Red border, persistent (no auto-dismiss)\nAttention: Highest priority in attention budget'
            }
        ]
    },

    'semantic-adjuster': {
        name: 'semantic-adjuster',
        tagline: 'Multi-modal number/value adjusters with voice, gesture, and button controls',
        description: 'The semantic-adjuster component provides increment/decrement controls for numeric values. It supports button clicks, voice commands ("increase", "decrease"), gestures, and keyboard arrows.',
        attributes: [
            { name: 'value', type: 'number', values: 'number', default: '50', description: 'Current numeric value' },
            { name: 'min', type: 'number', values: 'number', default: '0', description: 'Minimum allowed value' },
            { name: 'max', type: 'number', values: 'number', default: '100', description: 'Maximum allowed value' },
            { name: 'step', type: 'number', values: 'number', default: '1', description: 'Increment/decrement amount' },
            { name: 'label', type: 'string', values: 'text', default: 'Value', description: 'Label for the adjuster' }
        ],
        events: [
            { name: 'adjust', trigger: 'Value changed (button, voice, gesture)', detail: '{ value }', description: 'Value adjustment event' }
        ],
        states: [
            { name: 'Default', description: 'Circular +/- buttons, large center value' },
            { name: 'Hover', description: 'Button hover shows blue background' },
            { name: 'Min/Max Reached', description: 'Corresponding button disabled (grey)' }
        ],
        examples: [
            {
                label: 'Volume Control',
                code: '<semantic-adjuster label="Volume" value="75" min="0" max="100" step="5"></semantic-adjuster>',
                notes: 'Use for: Volume, brightness, quantity adjustments\nVoice: "Increase volume", "Decrease volume"\nGestures: Swipe up/down in AR/VR'
            },
            {
                label: 'Temperature Setting',
                code: '<semantic-adjuster label="Temperature" value="20" min="15" max="30" step="0.5"></semantic-adjuster>',
                notes: 'Use for: Numeric settings, sliders, counters\nKeyboard: Arrow up/down to adjust\nTouch: Tap +/- or swipe'
            }
        ]
    }
};

// HTML template generator
function generateComponentDoc(componentData) {
    const { name, tagline, description, attributes = [], slots = [], events = [], states = [], examples = [] } = componentData;

    const attributeRows = attributes.map(attr => `
                        <tr style="border-bottom: 1px solid #333;">
                            <td style="padding: 12px;"><span class="prop-name">${attr.name}</span></td>
                            <td style="padding: 12px;"><span class="prop-type">${attr.type}</span></td>
                            <td style="padding: 12px;"><span class="prop-values">${attr.values}</span></td>
                            <td style="padding: 12px;">${attr.default}</td>
                            <td style="padding: 12px;">${attr.description}</td>
                        </tr>`).join('');

    const slotRows = slots ? slots.map(slot => `
                        <tr style="border-bottom: 1px solid #333;">
                            <td style="padding: 12px;"><span class="prop-name">${slot.name}</span></td>
                            <td style="padding: 12px;"><span class="prop-type">slot</span></td>
                            <td style="padding: 12px;">${slot.description}</td>
                        </tr>`).join('') : '';

    const eventRows = events.map(event => `
                        <tr style="border-bottom: 1px solid #333;">
                            <td style="padding: 12px;"><span class="prop-name">${event.name}</span></td>
                            <td style="padding: 12px;">${event.trigger}</td>
                            <td style="padding: 12px;"><code>${event.detail}</code></td>
                            <td style="padding: 12px;">${event.description}</td>
                        </tr>`).join('');

    const stateBoxes = states.map(state => `
                <div class="state-box">
                    <div class="state-label">${state.name} State</div>
                    <div class="state-visual state-${state.name.toLowerCase()}">
                        <${name} intent="primary" ${state.name === 'Disabled' ? 'disabled' : ''}>${state.name}</${name}>
                    </div>
                    <div class="state-description">${state.description}</div>
                </div>`).join('');

    const exampleCards = examples.map(ex => `
                <div class="example">
                    <div class="example-label">${ex.label}</div>
                    <div class="example-demo">
                        ${ex.code}
                    </div>
                    <div class="example-code">${ex.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                    <div class="example-notes">${ex.notes.replace(/\n/g, '<br>')}</div>
                </div>`).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Semantic Components</title>
    <script src="../semantic-components.js"></script>
    <link rel="stylesheet" href="component-docs.css">
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1 class="component-name">&lt;${name}&gt;</h1>
            <p class="tagline">${tagline}</p>
            <div class="quick-example">
${examples[0]?.code || `<${name}></${name}>`}
            </div>
        </div>

        <!-- Overview -->
        <section class="section">
            <h2 class="section-title">Overview</h2>
            <p class="section-description">${description}</p>
        </section>

        <!-- Examples -->
        <section class="section">
            <h2 class="section-title">Examples</h2>
            <div class="grid">
                ${exampleCards}
            </div>
        </section>

        <!-- Interactive States -->
        <section class="section">
            <h2 class="section-title">Interactive States</h2>
            <div class="state-showcase">
                ${stateBoxes}
            </div>
        </section>

        <!-- Properties -->
        <section class="section">
            <h2 class="section-title">Properties & Attributes</h2>
            <table class="property-table">
                <thead>
                    <tr>
                        <th>Attribute</th>
                        <th>Type</th>
                        <th>Values</th>
                        <th>Default</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    ${attributeRows}
                    ${slotRows}
                </tbody>
            </table>
        </section>

        <!-- Events -->
        <section class="section">
            <h2 class="section-title">Events</h2>
            <table class="property-table">
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>Trigger</th>
                        <th>Detail</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    ${eventRows}
                </tbody>
            </table>
        </section>
    </div>
</body>
</html>`;
}

// Extract CSS to shared stylesheet
function generateSharedCSS() {
    return `/* Shared styles for all component documentation pages */

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    background: #000;
    color: #fff;
    line-height: 1.6;
    letter-spacing: 0.015em;
    overflow-x: hidden;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 48px 24px;
    width: 100%;
    box-sizing: border-box;
}

@media (max-width: 768px) {
    .container {
        padding: 24px 16px;
        max-width: 100%;
    }
}

/* Header */
.header {
    margin-bottom: 64px;
    border-bottom: 2px solid #38383a;
    padding-bottom: 32px;
}

.component-name {
    font-size: 48px;
    font-weight: 900;
    color: #409cff;
    margin-bottom: 16px;
    word-break: break-word;
}

.tagline {
    font-size: 24px;
    color: #f0f0f0;  /* Improved from #f0f0f0 for 7.0:1 contrast */
    margin-bottom: 24px;
}

.quick-example {
    background: #1c1c1e;
    border: 1px solid #38383a;
    border-radius: 12px;
    padding: 24px;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    color: #34c759;
    overflow-x: auto;
    max-width: 100%;
}

@media (max-width: 768px) {
    .component-name {
        font-size: 32px;
    }

    .tagline {
        font-size: 18px;
    }

    .quick-example {
        font-size: 13px;  /* Increased from 12px for better mobile readability */
        padding: 16px;
    }
}

/* Sections */
.section {
    margin-bottom: 80px;
    page-break-inside: avoid;
}

.section-title {
    font-size: 32px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 16px;
    border-left: 4px solid #409cff;
    padding-left: 16px;
}

.section-description {
    font-size: 16px;
    color: #f0f0f0;
    margin-bottom: 32px;
    line-height: 1.8;
}

/* Grid */
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));  /* Reduced from 300px for better mobile fit */
    gap: 32px;
    margin-bottom: 32px;
}

@media (max-width: 768px) {
    .grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }
}

/* Examples */
.example {
    background: #1c1c1e;
    border: 2px solid #38383a;
    border-radius: 16px;
    padding: 32px;
    page-break-inside: avoid;
    min-width: 0;  /* Prevent grid blowout */
}

@media (max-width: 768px) {
    .example {
        padding: 20px;  /* Reduced padding on mobile */
    }
}

.example-label {
    font-size: 14px;
    font-weight: 700;
    color: #409cff;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 16px;
}

.example-demo {
    margin-bottom: 24px;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.example-code {
    background: #000;
    border: 1px solid #38383a;
    border-radius: 8px;
    padding: 16px;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 14px;  /* Increased from 12px for better mobile readability */
    color: #34c759;
    overflow-x: auto;
    margin-bottom: 16px;
}

.example-notes {
    font-size: 14px;  /* Increased from 13px for better mobile readability */
    color: #f0f0f0;
    line-height: 1.6;
    border-top: 1px solid #38383a;
    padding-top: 16px;
}

/* State Showcase */
.state-showcase {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 32px;
}

@media (max-width: 768px) {
    .state-showcase {
        grid-template-columns: 1fr;  /* Single column on mobile to prevent overflow */
    }
}

.state-box {
    background: #2c2c2e;
    border: 2px solid #38383a;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    min-width: 0;  /* Prevent grid blowout */
}

.state-label {
    font-size: 14px;  /* Increased from 12px for better mobile readability */
    font-weight: 700;
    color: #f0f0f0;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 16px;
}

.state-visual {
    margin-bottom: 16px;
}

/* Simulate interactive states visually using CSS custom properties
   These pass through shadow DOM boundaries to style the inner button */
.state-visual.state-hover semantic-action,
.state-visual.state-hover semantic-card,
.state-visual.state-hover semantic-input,
.state-visual.state-hover semantic-modal,
.state-visual.state-hover semantic-adjuster {
    --demo-transform: translateY(-2px);
    --demo-box-shadow: 0 3px 8px rgba(64, 156, 255, 0.6);
    --demo-filter: brightness(1.2);
}

/* State demos using CSS custom properties that pass through shadow DOM */

.state-visual.state-active semantic-action,
.state-visual.state-active semantic-card,
.state-visual.state-active semantic-input {
    --demo-transform: scale(0.96) translateY(1px);
    --demo-box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.3);
    --demo-filter: brightness(0.85);
}

.state-visual.state-focus semantic-action,
.state-visual.state-focus semantic-input,
.state-visual.state-focus semantic-card {
    --demo-outline: 3px solid #4d9fff;
    --demo-outline-offset: 2px;
}

.state-visual.state-disabled semantic-action,
.state-visual.state-disabled semantic-input,
.state-visual.state-disabled semantic-card,
.state-visual.state-disabled semantic-adjuster {
    /* Disabled state works naturally via disabled attribute */
    cursor: not-allowed !important;
}

.state-description {
    font-size: 14px;  /* Increased from 13px for better mobile readability */
    color: #f0f0f0;
    line-height: 1.6;
}

/* Property Tables */
.property-table {
    width: 100%;
    border-collapse: collapse;
    background: #1c1c1e;
    border: 2px solid #38383a;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 32px;
    display: block;  /* Allow horizontal scroll on mobile */
    overflow-x: auto;  /* Enable horizontal scrolling for wide tables */
}

.property-table thead {
    background: rgba(64, 156, 255, 0.1);
}

.property-table th {
    padding: 16px;
    text-align: left;
    font-weight: 700;
    color: #409cff;
    border-bottom: 2px solid #38383a;
    font-size: 14px;  /* Ensure readable size */
}

.property-table td {
    padding: 16px;
    border-bottom: 1px solid #38383a;
    font-size: 14px;  /* Ensure readable size */
}

@media (max-width: 768px) {
    .property-table th,
    .property-table td {
        padding: 12px 8px;  /* Reduced padding on mobile */
        font-size: 13px;  /* Slightly smaller but still readable */
    }
}

.property-table tr:last-child td {
    border-bottom: none;
}

.prop-name {
    font-family: 'Monaco', monospace;
    color: #34c759;
    font-weight: 600;
}

.prop-type {
    font-family: 'Monaco', monospace;
    color: #ff9500;
    font-size: 13px;
}

.prop-values {
    font-family: 'Monaco', monospace;
    color: #409cff;
    font-size: 13px;
}

/* Print Styles */
@media print {
    body {
        background: white;
        color: black;
    }

    .example {
        border: 2px solid #ccc;
        page-break-inside: avoid;
    }

    .section {
        page-break-after: always;
    }
}
`;
}

// Main execution
function generateDocs() {
    const docsDir = path.join(__dirname, 'docs');

    // Create docs directory if it doesn't exist
    if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir);
    }

    // Generate shared CSS
    fs.writeFileSync(
        path.join(docsDir, 'component-docs.css'),
        generateSharedCSS()
    );
    console.log('✓ Generated component-docs.css');

    // Generate docs for each component
    for (const [componentName, componentData] of Object.entries(components)) {
        const html = generateComponentDoc(componentData);
        const filename = `${componentName}.html`;
        fs.writeFileSync(path.join(docsDir, filename), html);
        console.log(`✓ Generated ${filename}`);
    }

    console.log('\n✅ Documentation generation complete!');
    console.log(`Generated ${Object.keys(components).length} component pages in docs/`);
}

// Run if called directly
if (require.main === module) {
    generateDocs();
}

module.exports = { generateDocs, components };
