# Semantic Web Components Library

**Version 1.0.0** - Intent-based, context-aware, modality-agnostic UI components

---

## What Makes This Different

### Bootstrap/Material/Tailwind:
```html
<button class="btn btn-primary" onclick="save()">Save</button>
```
**Problem:** Specifies HOW (styling), not WHAT (intent). Breaks with CSS changes. No context awareness.

### This Library:
```html
<semantic-action intent="primary" sentiment="constructive">Save</semantic-action>
```
**Solution:** Specifies WHAT the user wants to do. Automatically adapts to context, modality, and attention budget.

---

## Core Principles

1. **Intent Over Implementation** - Declare what users want to DO, not how to render it
2. **Context-Aware by Default** - Components adapt to environment automatically
3. **Modality-Agnostic** - Works across mouse, touch, voice, keyboard, AR
4. **Attention Budget** - Components negotiate for limited user attention
5. **Future-Proof** - Semantic versioning ensures no breaking changes

---

## Installation

```html
<!-- Include the library -->
<script src="semantic-components.js"></script>

<!-- Start using components -->
<semantic-action intent="primary">Click Me</semantic-action>
```

No build step. No framework required. Just works.

---

## Components

### 1. `<semantic-action>` - User Actions

Replaces: Buttons, links, clickable divs

**Attributes:**
- `intent`: `primary` | `secondary` | `tertiary` - Interaction importance
- `sentiment`: `constructive` | `destructive` | `neutral` - Action sentiment
- `disabled`: Boolean - Disabled state

**Events:**
- `activate` - User wants to perform action (click, tap, voice command)
- `inspect` - User wants to preview action (hover, long-press)

**Example:**
```html
<semantic-action intent="primary" sentiment="constructive">
  Save Document
</semantic-action>

<semantic-action intent="secondary" sentiment="destructive">
  Delete
</semantic-action>

<script>
  document.querySelector('semantic-action').addEventListener('intent', (e) => {
    if (e.detail.type === 'activate') {
      console.log('User activated action');
    }
  });
</script>
```

**Automatic Features:**
- Mouse: Hover effects, click handling
- Touch: Large tap targets (44px min), long-press for inspect
- Keyboard: Full navigation, Enter/Space to activate
- Voice: Registers command based on text content
- Focus: Visible focus indicators
- Accessibility: Full ARIA support built-in

---

### 2. `<semantic-card>` - Inspectable Content

Replaces: Card components, tiles, list items

**Attributes:**
- `media-url`: Image URL
- `media-alt`: Image alt text

**Slots:**
- `media-icon`: Icon when no image (default slot)
- `title`: Card title
- `description`: Card description
- `preview`: Preview content (shown on inspect)
- `actions`: Action buttons

**Events:**
- `activate` - Navigate to content
- `inspect` - Preview content

**Example:**
```html
<semantic-card>
  <span slot="media-icon">🚀</span>
  <card-title slot="title">Project Alpha</card-title>
  <card-description slot="description">
    Next-gen platform
  </card-description>
  <div slot="preview">
    Preview: Full details here
  </div>
  <div slot="actions">
    <semantic-action intent="tertiary">Share</semantic-action>
    <semantic-action intent="tertiary">Edit</semantic-action>
  </div>
</semantic-card>
```

**Automatic Features:**
- Mouse: Hover to preview, click to navigate
- Touch: Long-press to preview, tap to navigate
- Voice: "Inspect [title]" or "Open [title]"
- Keyboard: Tab to focus, Enter to navigate
- Accessibility: Article role, screen reader optimized

---

### 3. `<semantic-adjuster>` - Value Control

Replaces: Sliders, number inputs, steppers

**Attributes:**
- `label`: Control label
- `value`: Current value
- `min`: Minimum value (default: 0)
- `max`: Maximum value (default: 100)
- `step`: Step increment (default: 1)

**Properties:**
- `value`: Get/set current value

**Events:**
- `adjust` - Value changed

**Example:**
```html
<semantic-adjuster
  label="Volume"
  value="50"
  min="0"
  max="100"
  step="5">
</semantic-adjuster>

<script>
  const adjuster = document.querySelector('semantic-adjuster');
  adjuster.addEventListener('intent', (e) => {
    if (e.detail.type === 'adjust') {
      console.log('New value:', e.detail.value);
    }
  });
</script>
```

**Automatic Features:**
- Mouse: Click buttons, drag slider
- Touch: Tap buttons, swipe slider
- Voice: "Increase volume", "Set volume to 75"
- Keyboard: Arrow keys, +/- keys
- Accessibility: Full ARIA slider support

---

### 4. `<semantic-feedback>` - Notifications

Replaces: Toasts, alerts, modals, notifications

**Attributes:**
- `urgency`: `critical` | `high` | `medium` | `low`
- `type`: `notification` | `alert` | `confirmation`
- `auto-dismiss`: Boolean - Auto-dismiss after 5s
- `can-defer`: Boolean - Can be deferred when user busy
- `sensitivity`: `private` | `public` - Privacy level

**Slots:**
- `icon`: Custom icon
- Default: Message content

**Events:**
- `dismiss` - User dismissed notification

**Example:**
```html
<semantic-feedback urgency="critical" type="alert">
  <span slot="icon">⚠️</span>
  Security alert requires attention
</semantic-feedback>

<semantic-feedback urgency="low" can-defer="true" auto-dismiss>
  Software update available
</semantic-feedback>
```

**Automatic Features:**
- Attention Budget: Prioritized by urgency
- Context-Aware: Defers if user busy/focused
- Privacy: Hides sensitive content with multiple viewers
- Multi-Modal: Visual + audio + haptic based on context
- Accessibility: Alert role, screen reader optimized

---

## Context Management

### Global Context Manager

```javascript
// Access global context
const context = window.semanticContext;

// Change modality
context.setModality('voice-screen'); // 'screen' | 'voice-screen' | 'voice-only' | 'touch'

// Update environment
context.updateContext({
  environment: {
    noiseLevel: 80,      // 0-100
    viewerCount: 3,      // Number of people viewing
    isPublic: true,      // Public display mode
    lighting: 'dark'     // 'bright' | 'normal' | 'dark'
  },
  user: {
    isBusy: true,        // User in active task
    inFocusMode: true,   // Do not disturb mode
    prefersReducedMotion: false
  }
});

// Listen to context changes
context.onChange((newContext) => {
  console.log('Context changed:', newContext);
});
```

### Automatic Context Adaptation

Components automatically adapt based on context:

**User Busy:**
- Non-critical notifications deferred
- Attention scores reduced for low-priority items

**Focus Mode:**
- Only critical items shown
- All low-urgency items hidden

**Multiple Viewers:**
- Private content (`sensitivity="private"`) auto-hidden
- Sensitive information blurred

**High Noise Environment:**
- Visual feedback emphasized
- Confirmation required for critical actions

**Public Display:**
- Personal information hidden
- Auto-timeout on inactivity

---

## Attention Budget System

Components compete for limited resources:

### Resources:
- **Screen Space**: 0-100% of viewport
- **Audio Time**: 0-10 seconds for voice output
- **Cognitive Load**: 0-3 simultaneous attention points

### Component Attributes:
```html
<semantic-feedback
  urgency="high"
  priority="time-sensitive"
  attention-weight="80"
  screen-space="15"
  audio-time="4"
  cognitive-load="1">
  Meeting in 5 minutes
</semantic-feedback>
```

### Priority Scoring:
```
score = (urgency × urgency_multiplier) +
        (priority × priority_weight) +
        (time_sensitivity × time_weight) -
        (user_disruption × disruption_penalty)
```

### Allocation States:
- `allocated` - Component gets attention
- `deferred` - Pushed to later (if `can-defer="true"`)
- `hidden` - Completely hidden based on context

**Check state:**
```javascript
const component = document.querySelector('semantic-feedback');
const state = component.getAttribute('attention-state');
// 'allocated' | 'deferred'
```

---

## Styling & Theming

### CSS Parts (Shadow DOM)
Each component exposes parts for styling:

```css
/* Style action buttons */
semantic-action::part(button) {
  font-family: 'Custom Font';
  border-radius: 16px;
}

/* Style card elements */
semantic-card::part(card) {
  border-radius: 20px;
}

semantic-card::part(media) {
  border-radius: 16px 16px 0 0;
}
```

### Available Parts:

**semantic-action:**
- `button` - The button element

**semantic-card:**
- `card` - Main card container
- `media` - Image element
- `media-placeholder` - Placeholder if no image
- `content` - Content area
- `actions` - Action buttons area
- `preview` - Preview overlay

**semantic-adjuster:**
- `adjuster` - Main container
- `label` - Label text
- `value` - Value display
- `decrease` - Decrease button
- `increase` - Increase button
- `slider` - Slider track

**semantic-feedback:**
- `feedback` - Main container
- `icon` - Icon area
- `content` - Message content
- `dismiss` - Dismiss button

---

## Migration Guide

### From Bootstrap/Material/Tailwind:

**Before:**
```html
<button class="btn btn-primary btn-lg" onclick="save()">
  Save
</button>
```

**After:**
```html
<semantic-action intent="primary">
  Save
</semantic-action>
```

### From Custom Components:

**Before:**
```html
<div class="card" onclick="navigate()">
  <img src="image.jpg">
  <h3>Title</h3>
  <p>Description</p>
</div>

<script>
  // Manual hover handling
  // Manual touch handling
  // Manual accessibility
  // Manual responsive behavior
</script>
```

**After:**
```html
<semantic-card media-url="image.jpg">
  <card-title slot="title">Title</card-title>
  <card-description slot="description">Description</card-description>
</semantic-card>

<script>
  // All interactions handled automatically
  // Full accessibility built-in
  // Context-aware by default
</script>
```

---

## Browser Support

- **Chrome/Edge**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Mobile**: iOS 14+, Android Chrome 90+

Requires: Custom Elements, Shadow DOM, ES6

---

## Roadmap

### v1.1
- `<semantic-navigator>` - Navigation patterns
- `<semantic-input>` - Form inputs
- `<semantic-layout>` - Adaptive layouts

### v1.2
- Voice command registration API
- AR/spatial interaction support
- Gesture library

### v2.0
- Component versioning system
- Backward compatibility layer
- Extended context sensors (location, time, device capabilities)

---

## Philosophy

This isn't just another component library. It's a **paradigm shift**.

**Traditional approach:** Build for mouse, add touch later, maybe consider accessibility
**Semantic approach:** Build for INTENT, system handles modality automatically

**Traditional approach:** CSS frameworks that break every major version
**Semantic approach:** Versioned semantics that never break

**Traditional approach:** Manual context handling everywhere
**Semantic approach:** Context-aware by default, no code needed

**Traditional approach:** Notifications spam users regardless of context
**Semantic approach:** Components negotiate attention based on priority and context

---

## Real-World Impact

**Accessibility**: Free. Every component is screen-reader optimized, keyboard navigable, focus visible.

**Responsive**: Free. Components adapt to touch, mouse, voice automatically.

**Performance**: Free. Attention budget prevents cognitive overload.

**Privacy**: Free. Sensitive content auto-hides in multi-viewer contexts.

**Future-proof**: Free. Semantic versioning means your code works forever.

**This is what the web should have been.**

---

## License

MIT License - Use freely in any project

## Contributing

This is a proof-of-concept implementation of interaction semantics for the web.
Feedback, issues, and contributions welcome.

---

**Built with intent. Designed for humans. Works everywhere.**
