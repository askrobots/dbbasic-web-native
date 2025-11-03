# Semantic Components

**Intent-based, context-aware, modality-agnostic web components for building the future of interfaces.**

[![npm version](https://img.shields.io/npm/v/@semantic/components.svg)](https://www.npmjs.com/package/@semantic/components)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@semantic/components)](https://bundlephobia.com/package/@semantic/components)

---

## The Problem

Current web development is broken:

- **Mouse-first**: Touch, voice, and AR are afterthoughts
- **Implementation-focused**: CSS classes that break every update
- **Manual everything**: Accessibility, context awareness, privacy
- **No future-proofing**: Code breaks with every framework update

## The Solution

Semantic Components fix this by focusing on **intent over implementation**:

```html
<!-- Traditional (breaks, manual, fragile) -->
<button class="btn btn-primary" onclick="save()">Save</button>

<!-- Semantic (works everywhere, automatic, future-proof) -->
<semantic-action intent="primary">Save</semantic-action>
```

That's it. The component automatically handles:

✅ Mouse, touch, voice, keyboard navigation
✅ Context awareness (noise, viewers, lighting)
✅ Accessibility (ARIA, screen readers)
✅ Privacy protection (multi-viewer mode)
✅ Attention budget management
✅ Future compatibility (never breaks)

---

## Quick Start

### CDN (Fastest)

```html
<script src="https://cdn.jsdelivr.net/npm/@semantic/components@1.0.0/dist/semantic-components.min.js"></script>

<semantic-action intent="primary">Click Me</semantic-action>
```

### NPM

```bash
npm install @semantic/components
```

```javascript
import '@semantic/components';

// Or import specific modules
import { SemanticAction } from '@semantic/components';
```

### HTML Import

```html
<script type="module">
  import '@semantic/components';
</script>
```

---

## Components

### 🎯 `<semantic-action>` - Intent-based buttons

```html
<semantic-action intent="primary" sentiment="constructive">
  Save Document
</semantic-action>
```

**Attributes:**
- `intent`: `primary` | `secondary` | `tertiary`
- `sentiment`: `constructive` | `destructive` | `neutral`
- `disabled`: Boolean

**Events:** `activate`, `inspect`

---

### 🃏 `<semantic-card>` - Inspectable content

```html
<semantic-card>
  <span slot="media-icon">🚀</span>
  <card-title slot="title">Project Alpha</card-title>
  <card-description slot="description">Next-gen platform</card-description>
  <div slot="preview">Preview content here</div>
  <div slot="actions">
    <semantic-action intent="tertiary">Share</semantic-action>
  </div>
</semantic-card>
```

**Hover to preview, click to activate.** Touch users: long-press to preview.

---

### 📢 `<semantic-feedback>` - Context-aware notifications

```html
<semantic-feedback urgency="critical" can-defer="false">
  Security alert requires attention
</semantic-feedback>
```

**Attributes:**
- `urgency`: `critical` | `high` | `medium` | `low`
- `can-defer`: Boolean - Can be deferred when user is busy
- `sensitivity`: `private` | `public` - Auto-hides sensitive content

---

### 🎚️ `<semantic-adjuster>` - Multi-modal value control

```html
<semantic-adjuster
  label="Volume"
  value="50"
  min="0"
  max="100"
  step="5">
</semantic-adjuster>
```

Buttons, slider, keyboard, or voice - all work automatically.

---

### 📝 `<semantic-input>` - Form inputs

```html
<semantic-input
  type="text"
  label="Project Name"
  placeholder="Enter name"
  required>
</semantic-input>
```

**Types:** `text`, `email`, `password`, `number`, `tel`, `url`, `search`, `textarea`

---

### 🪟 `<semantic-modal>` - Context-aware dialogs

```html
<semantic-modal id="myModal" urgency="high">
  <h3 slot="header">Important</h3>
  <p>Modal content here</p>
  <div slot="actions">
    <semantic-action intent="primary">Confirm</semantic-action>
  </div>
</semantic-modal>

<script>
  document.getElementById('myModal').open();
</script>
```

---

### 🧭 `<semantic-navigator>` - Navigation patterns

```html
<semantic-navigator type="horizontal">
  <nav-item data-nav-id="home" aria-current="page">Home</nav-item>
  <nav-item data-nav-id="projects">Projects</nav-item>
  <nav-item data-nav-id="settings">Settings</nav-item>
</semantic-navigator>
```

---

### 📋 `<semantic-list>` - Selectable lists

```html
<semantic-list selectable>
  <list-item data-item-id="task-1" tabindex="0">
    <list-item-title>Complete project</list-item-title>
  </list-item>
</semantic-list>
```

Full keyboard navigation included (arrows, Enter, Space).

---

### 🍔 `<semantic-menu>` - Context menus

```html
<semantic-menu id="contextMenu">
  <menu-item data-menu-id="copy">Copy</menu-item>
  <menu-item data-menu-id="paste">Paste</menu-item>
</semantic-menu>

<script>
  const menu = document.getElementById('contextMenu');
  element.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    menu.open(e.clientX, e.clientY);
  });
</script>
```

---

## Voice Commands

Voice commands are automatically registered from component content:

```html
<semantic-action intent="primary">Save Document</semantic-action>
<!-- Voice: "save document" or "click save document" -->

<semantic-adjuster label="Volume" value="50"></semantic-adjuster>
<!-- Voice: "increase volume" or "set volume to 75" -->
```

**Enable voice:**

```javascript
// Press Ctrl+Shift+V, or:
window.voiceSystem.start();
```

---

## Context Awareness

Components automatically adapt to:

**Environment:**
- Noise level (0-100%)
- Number of viewers
- Lighting conditions
- Device orientation

**User State:**
- Busy / Focus mode
- Idle / Away
- Network quality

**Example:**

```html
<semantic-feedback
  urgency="low"
  can-defer="true"
  sensitivity="private">
  You have 3 new messages
</semantic-feedback>
```

This notification will:
- Defer if user is busy/focused
- Hide if multiple viewers present
- Show loudly if critical urgency

**Manual simulation (for testing):**

```javascript
window.contextDetection.simulate({
  noiseLevel: 80,
  viewerCount: 3,
  isBusy: true
});
```

---

## Attention Budget

Components compete for limited user attention based on urgency:

```html
<semantic-feedback
  urgency="critical"
  attention-weight="100"
  screen-space="25"
  audio-time="4"
  cognitive-load="1">
  Critical alert
</semantic-feedback>
```

System allocates resources (screen space, audio time, cognitive load) in priority order.

---

## Developer Tools

Real-time debugging and inspection:

```javascript
// Press Ctrl+Shift+D, or:
window.semanticDevTools.show();
```

Shows:
- Attention budget usage
- Context state
- Component inspector
- Intent logs

---

## Styling

Style components using CSS parts:

```css
/* Style action buttons */
semantic-action::part(button) {
  font-family: 'Custom Font';
  border-radius: 20px;
}

/* Style cards */
semantic-card::part(card) {
  border-radius: 16px;
}
```

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile: iOS 14+, Android Chrome 90+

**Required:** Custom Elements, Shadow DOM, ES6

---

## Why Semantic Components?

### Traditional Approach
```html
<button class="btn btn-primary">Save</button>
```
❌ Specifies HOW (styling)
❌ Breaks with CSS updates
❌ No context awareness
❌ Manual accessibility
❌ Mouse-only by default

### Semantic Approach
```html
<semantic-action intent="primary">Save</semantic-action>
```
✅ Specifies WHAT (intent)
✅ Never breaks
✅ Context-aware by default
✅ Accessibility automatic
✅ Works across all modalities

---

## Examples

See the [live demo](https://semantic-components.dev/demo) for interactive examples.

Or run locally:

```bash
git clone https://github.com/semantic-components/semantic-components
cd semantic-components
npm install
npm run dev
# Open http://localhost:8080
```

---

## Philosophy

This isn't just another component library. It's a **paradigm shift**.

**The web is moving from:**
- Implementation-focused → Intent-focused
- Mouse-first → Modality-agnostic
- Manual context → Automatic adaptation
- Breakable code → Future-proof semantics

We're building the **interaction semantics layer** the web has always needed.

---

## Roadmap

- ✅ v1.0: Core components, voice, context detection
- 🔄 v1.1: Gesture recognition, ML attention scoring
- 🔄 v1.2: AR/spatial UI support
- 🔄 v2.0: Semantic data layer, ambient intelligence

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Links

- **Website:** https://semantic-components.dev
- **Documentation:** https://semantic-components.dev/docs
- **GitHub:** https://github.com/semantic-components/semantic-components
- **npm:** https://www.npmjs.com/package/@semantic/components
- **Issues:** https://github.com/semantic-components/semantic-components/issues

---

**Built with intent. Designed for humans. Works everywhere.**

This is what the web should have been.
