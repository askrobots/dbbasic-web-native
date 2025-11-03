# Component HTML Structure Reference

This document shows the actual HTML rendered by each semantic component.

---

## 1. semantic-action (Button)

### Usage:
```html
<semantic-action intent="primary" sentiment="constructive">
  Save Changes
</semantic-action>
```

### Rendered Shadow DOM:
```html
<style>
  button {
    min-height: 44px;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  button[data-intent="primary"] {
    background: #0066cc;
    color: white;
  }
  button:disabled {
    background: #3a3a3a !important;
    color: #6e6e73 !important;
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
<button data-intent="primary" data-sentiment="constructive">
  <slot></slot> <!-- "Save Changes" goes here -->
</button>
```

### Key Visual States:
- **Default**: Blue button (#0066cc), white text
- **Hover**: Lifts up 2px, adds shadow
- **Active**: Scales down to 96%
- **Disabled**: Grey (#3a3a3a), grey text (#6e6e73), 60% opacity
- **Focus**: 3px blue outline (#4d9fff)

---

## 2. semantic-card

### Usage:
```html
<semantic-card>
  <span slot="media-icon">🚀</span>
  <card-title slot="title">Project Alpha</card-title>
  <card-description slot="description">Next-gen platform</card-description>
  <div slot="preview">Preview content here</div>
  <div slot="actions">
    <semantic-action intent="tertiary">View</semantic-action>
  </div>
</semantic-card>
```

### Rendered Shadow DOM:
```html
<style>
  .card {
    background: #1c1c1e;
    border: 1px solid #38383a;
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s;
  }
  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    border-color: #0066cc;
  }
</style>
<div class="card">
  <div class="media">
    <slot name="media-icon"></slot> <!-- 🚀 -->
  </div>
  <div class="content">
    <slot name="title"></slot> <!-- Project Alpha -->
    <slot name="description"></slot> <!-- Next-gen platform -->
  </div>
  <div class="preview" style="display: none;">
    <slot name="preview"></slot> <!-- Shows on hover -->
  </div>
  <div class="actions">
    <slot name="actions"></slot> <!-- Action buttons -->
  </div>
</div>
```

### Key Visual States:
- **Default**: Flat, subtle border
- **Hover**: Lifts 4px, blue border glow, preview slides in
- **Active**: Slight scale down on click

---

## 3. semantic-input

### Usage:
```html
<semantic-input
  label="Email"
  type="email"
  value="user@example.com"
  valid>
</semantic-input>

<semantic-input
  label="Email"
  type="email"
  value="bad-email"
  error="Please enter a valid email">
</semantic-input>
```

### Rendered Shadow DOM:
```html
<style>
  input {
    min-height: 44px;
    padding: 12px 16px;
    background: #1c1c1e;
    border: 2px solid #38383a;
    border-radius: 8px;
    color: #fff;
    font-size: 16px;
  }
  :host([valid]) input {
    border-color: #34c759; /* Green */
  }
  :host([error]) input {
    border-color: #ff3b30; /* Red */
  }
  :host([disabled]) input {
    opacity: 0.5;
    background: #2a2a2a;
    cursor: not-allowed;
  }
</style>
<div class="input-wrapper">
  <label>Email *</label>
  <input type="email" placeholder="you@example.com">
  <div class="error-message">Please enter a valid email</div>
</div>
```

### Key Visual States:
- **Default**: Dark input with grey border
- **Focus**: Blue border (#0066cc), blue glow
- **Valid**: Green border (#34c759)
- **Error**: Red border (#ff3b30) + red error text below
- **Disabled**: Grey background, 50% opacity

---

## 4. semantic-modal

### Usage:
```html
<semantic-modal id="confirm-modal" urgency="critical" open>
  <h3 slot="title">⚠️ Destructive Action</h3>
  <p>This cannot be undone. All data will be permanently deleted.</p>
  <div slot="actions">
    <semantic-action intent="secondary">Cancel</semantic-action>
    <semantic-action intent="primary" sentiment="destructive">Delete Forever</semantic-action>
  </div>
</semantic-modal>
```

### Rendered Shadow DOM:
```html
<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 9999;
  }
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #1c1c1e;
    border-radius: 12px;
    padding: 24px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
  }
</style>
<div class="backdrop"></div>
<div class="modal" role="dialog" aria-modal="true">
  <div class="modal-header">
    <slot name="title"></slot>
    <button class="close">×</button>
  </div>
  <div class="modal-body">
    <slot></slot> <!-- Main content -->
  </div>
  <div class="modal-footer">
    <slot name="actions"></slot>
  </div>
</div>
```

### Key Visual States:
- **Closed**: `display: none`
- **Open**: Blurred backdrop, centered modal with shadow
- **Focus trap**: Can't tab outside modal
- **ESC key**: Closes modal

---

## 5. semantic-navigator

### Usage:
```html
<!-- Horizontal tabs -->
<semantic-navigator type="tabs">
  <nav-item href="#home" active>Home</nav-item>
  <nav-item href="#products">Products</nav-item>
  <nav-item href="#about">About</nav-item>
</semantic-navigator>

<!-- Vertical menu -->
<semantic-navigator type="menu">
  <nav-item href="#dashboard" icon="📊">Dashboard</nav-item>
  <nav-item href="#projects" icon="🚀" active>Projects</nav-item>
  <nav-item href="#team" icon="👥">Team</nav-item>
</semantic-navigator>
```

### Rendered Shadow DOM:
```html
<style>
  .navigator[data-type="tabs"] {
    display: flex;
    flex-direction: row;
    gap: 4px;
    border-bottom: 2px solid #38383a;
  }
  ::slotted(*) {
    padding: 12px 20px;
    border-radius: 8px;
    color: #98989d;
  }
  ::slotted([aria-current="page"]) {
    background: #0066cc;
    color: #fff;
    font-weight: 600;
  }
</style>
<nav class="navigator" data-type="tabs">
  <slot></slot> <!-- nav-items go here -->
</nav>
```

### nav-item renders as:
```html
<nav-item href="#home" active role="link" tabindex="0" aria-current="page" class="current">
  Home
</nav-item>
```

### Key Visual States:
- **Default**: Grey text (#98989d), transparent
- **Hover**: Light grey background (#2c2c2e), white text
- **Active/Current**: Blue background (#0066cc), white bold text
- **Focus**: Blue outline

---

## 6. semantic-list

### Usage:
```html
<!-- Single selection -->
<semantic-list selection="single">
  <list-item value="1">First Item</list-item>
  <list-item value="2" selected>Second Item</list-item>
  <list-item value="3">Third Item</list-item>
</semantic-list>

<!-- Multiple selection -->
<semantic-list selection="multiple">
  <list-item value="a" selected>Option A</list-item>
  <list-item value="b">Option B</list-item>
  <list-item value="c" selected>Option C</list-item>
</semantic-list>
```

### Rendered Shadow DOM:
```html
<style>
  .list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  ::slotted(*) {
    padding: 12px 16px;
    border-radius: 8px;
    cursor: pointer;
    background: #1c1c1e;
    border: 2px solid #38383a;
  }
  ::slotted([aria-selected="true"]) {
    background: rgba(0, 122, 255, 0.1);
    border-color: #0066cc;
  }
</style>
<div class="list" role="listbox">
  <slot></slot>
</div>
```

### list-item renders as:
```html
<list-item value="2" selected role="option" tabindex="0" aria-selected="true" class="selected" data-value="2">
  Second Item
</list-item>
```

### Key Visual States:
- **Default**: Dark background, grey border
- **Hover**: Lighter background
- **Selected**: Blue border, blue tinted background
- **Focus**: Blue outline

---

## 7. semantic-menu (Context Menu)

### Usage:
```html
<semantic-menu id="context-menu">
  <menu-item icon="📋" shortcut="Ctrl+C">Copy</menu-item>
  <menu-item icon="✂️" shortcut="Ctrl+X">Cut</menu-item>
  <menu-item icon="📄" shortcut="Ctrl+V">Paste</menu-item>
  <menu-divider></menu-divider>
  <menu-item icon="🗑️" shortcut="Del" intent="destructive">Delete</menu-item>
</semantic-menu>
```

### Rendered Shadow DOM:
```html
<style>
  .menu {
    position: fixed; /* Positioned where right-click happened */
    background: #1c1c1e;
    border: 1px solid #38383a;
    border-radius: 8px;
    padding: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    min-width: 200px;
  }
  ::slotted(*) {
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
  }
  ::slotted(:hover) {
    background: #0066cc;
  }
</style>
<div class="menu" role="menu">
  <slot></slot>
</div>
```

### menu-item renders as:
```html
<menu-item icon="📋" shortcut="Ctrl+C" role="menuitem" tabindex="0">
  <span style="font-size: 16px;">📋</span>
  <span style="flex: 1;">Copy</span>
  <span style="font-size: 12px; color: #6e6e73;">Ctrl+C</span>
</menu-item>
```

### Key Visual States:
- **Closed**: `display: none`
- **Open**: Appears at mouse position
- **Hover**: Blue background for hovered item
- **Destructive items**: Red text (#ff3b30)

---

## 8. semantic-feedback

### Usage:
```html
<semantic-feedback
  type="error"
  message="Failed to connect to server"
  urgency="critical"
  visible>
</semantic-feedback>
```

### Rendered Shadow DOM:
```html
<style>
  .feedback {
    position: fixed;
    top: 16px;
    right: 16px;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    min-width: 300px;
    animation: slideIn 0.3s;
  }
  .feedback[data-type="error"] {
    background: #ff3b30;
    color: white;
  }
  .feedback[data-type="success"] {
    background: #34c759;
    color: white;
  }
</style>
<div class="feedback" data-type="error" role="alert">
  <div class="icon">❌</div>
  <div class="message">Failed to connect to server</div>
</div>
```

### Key Visual States:
- **Success**: Green background (#34c759), checkmark icon
- **Error**: Red background (#ff3b30), X icon
- **Warning**: Orange background (#ff9500), warning icon
- **Info**: Blue background (#0066cc), info icon
- **Animation**: Slides in from right, fades out after duration

---

## 9. semantic-adjuster (Slider/Stepper)

### Usage:
```html
<!-- Slider -->
<semantic-adjuster
  label="Volume"
  value="75"
  min="0"
  max="100"
  step="5"
  show-value>
</semantic-adjuster>

<!-- Stepper -->
<semantic-adjuster
  label="Quantity"
  value="5"
  min="1"
  max="10"
  type="stepper"
  show-value>
</semantic-adjuster>
```

### Rendered Shadow DOM (Slider):
```html
<style>
  .adjuster {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .slider {
    position: relative;
    height: 44px;
    background: #2c2c2e;
    border-radius: 22px;
  }
  .slider-fill {
    height: 100%;
    background: #0066cc;
    border-radius: 22px;
    width: 75%;
  }
  .thumb {
    width: 28px;
    height: 28px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 8px;
    left: calc(75% - 14px);
  }
</style>
<div class="adjuster">
  <label>Volume</label>
  <div class="slider">
    <div class="slider-fill"></div>
    <div class="thumb"></div>
  </div>
  <div class="value">75</div>
</div>
```

### Rendered Shadow DOM (Stepper):
```html
<div class="adjuster">
  <label>Quantity</label>
  <div class="stepper">
    <button class="decrease">−</button>
    <div class="value">5</div>
    <button class="increase">+</button>
  </div>
</div>
```

### Key Visual States:
- **Slider**: Blue fill shows current value, white thumb is draggable
- **Stepper**: +/− buttons on sides, value in center
- **Hover**: Thumb scales up slightly
- **Active**: Thumb has blue glow while dragging
- **Disabled**: Grey, no interaction

---

## Comparison with Bootstrap

### Bootstrap Button:
```html
<button class="btn btn-primary" disabled>
  Save Changes
</button>
```
- **Disabled state**: Just `opacity: 0.65`, same blue color
- **Still looks clickable!** ❌

### Our Button:
```html
<semantic-action intent="primary" disabled>
  Save Changes
</semantic-action>
```
- **Disabled state**: Grey background, grey text, 60% opacity
- **Obviously not clickable** ✓

---

## Key Differences from Bootstrap/Other Frameworks

1. **Complete visual feedback**: Every state has obvious visual changes
2. **Accessibility built-in**: WCAG AA contrast, focus indicators, ARIA roles
3. **Intent-based**: Declare WHAT (primary action) not HOW (blue button)
4. **Shadow DOM**: Styles can't leak or be overridden accidentally
5. **Multi-modal ready**: Voice, touch, keyboard all work equally well
6. **Context-aware**: Components adapt based on environment

---

## HTML Size Comparison

### Bootstrap Form:
```html
<div class="mb-3">
  <label for="email" class="form-label">Email address</label>
  <input type="email" class="form-control is-invalid" id="email" value="bad-email">
  <div class="invalid-feedback">Please enter a valid email</div>
</div>
```
**6 elements, 3 classes to remember**

### Our Form:
```html
<semantic-input
  label="Email address"
  type="email"
  value="bad-email"
  error="Please enter a valid email">
</semantic-input>
```
**1 element, declarative attributes**

---

**The key insight**: Bootstrap gives you classes. We give you semantics + complete visual states + accessibility.
