# DBBasic Usability Standards - TODO List

> **Goal**: Make dbbasic Components the only UI library that teaches usability standards visually on every demo page.

---

## 🔴 PRIORITY 1: Foundation (Do First)

### 1.1 Document Core Usability Standards
**File**: `USABILITY-STANDARDS.md`

Write the actual rules that we'll visualize:

- [ ] **Navigation Hierarchy**
  - Primary navigation placement per form factor (mobile/tablet/desktop)
  - Contextual actions (always right-aligned)
  - Back/Cancel placement rules (top-left OR bottom-left)
  - Search placement (top-right OR persistent at top)

- [ ] **Touch Target Standards**
  - Minimum 44×44px for mobile
  - Minimum 32×32px for desktop
  - Touch zone maps (thumb-friendly bottom 1/3 on mobile)
  - Dangerous zones (top corners on mobile = hard to reach)

- [ ] **Spacing System**
  - Base unit: 8px or 16px (decide which)
  - Component spacing rules (8px, 16px, 24px, 32px, 48px, 64px)
  - Section spacing rules
  - White space ratios

- [ ] **Layout Grid Standards**
  - Mobile: Single column, 16px gutters
  - Tablet: 2-column OR master-detail, 24px gutters
  - Desktop: 12-column grid, 24px gutters
  - Sidebar widths (280px standard, 320px wide, 240px narrow)
  - Content max-width (680px for readability, 1200px for dashboards)

- [ ] **Visual Hierarchy Rules**
  - F-pattern (content-heavy pages: blog, articles)
  - Z-pattern (landing/marketing pages)
  - Card layouts (equal-importance items)
  - List layouts (priority-ordered items)

- [ ] **Form Standards**
  - Label placement (above inputs on mobile, left on desktop if space)
  - Input heights (56px mobile, 44px desktop)
  - Primary action placement (bottom-right)
  - Cancel/secondary action placement (bottom-left OR adjacent to primary)
  - Error message placement (inline below field)

- [ ] **Feedback Standards**
  - Success messages (top toast, auto-dismiss 3s)
  - Error messages (inline below field OR blocking modal if critical)
  - Loading states (inline spinner <3s, skeleton >3s)
  - Progress indicators (top linear bar for multi-step)

---

## 🟠 PRIORITY 2: Build Overlay System (Do Second)

### 2.1 Create Standards Overlay JavaScript
**File**: `standards/standards-overlay.js`

- [ ] **Core Toggle System**
  - `initStandardsOverlay()` - Initialize on page load
  - `toggleStandards(type)` - Show/hide specific overlay type
  - `showAllStandards()` - Show all overlays at once
  - `hideAllStandards()` - Clean up all overlays

- [ ] **Overlay Types**
  - `showLayoutGrid()` - 12-column grid overlay
  - `showTouchZones()` - Thumb-friendly zones (mobile)
  - `showSpacingUnits()` - Measure and annotate spacing
  - `showVisualFlow()` - F-pattern or Z-pattern guides
  - `showTouchTargets()` - Highlight 44×44px minimum zones
  - `showContentBoundaries()` - Max-width containers, safe areas

- [ ] **Annotation System**
  - Create floating labels with measurements
  - Arrow/pointer system to highlight specific elements
  - Color-coding system (green=good, yellow=caution, red=danger)
  - Responsive annotations (different content per breakpoint)

### 2.2 Create Standards Overlay CSS
**File**: `standards/standards-overlay.css`

- [ ] **Overlay Container Styles**
  - Semi-transparent backgrounds
  - Pointer-events handling (click-through where needed)
  - Z-index management (above content, below toolbar)

- [ ] **Grid Overlay Styles**
  - 12-column grid visualization
  - Gutter visualization
  - Responsive breakpoint indicators

- [ ] **Touch Zone Styles**
  - Green zone (thumb-friendly, bottom 1/3)
  - Yellow zone (reachable with stretch)
  - Red zone (hard to reach, avoid primary actions)
  - Transparent overlays with borders

- [ ] **Annotation Styles**
  - Label boxes with measurements
  - Arrow/pointer graphics
  - Color-coded borders and backgrounds
  - Readable typography (white text on dark bg, or vice versa)

- [ ] **Pattern Guide Styles**
  - F-pattern visualization (dotted lines showing scan path)
  - Z-pattern visualization
  - Eye-tracking heat map style overlays

### 2.3 Create Standards Toolbar
**File**: `standards/standards-toolbar.html` (embeddable snippet)

- [ ] **Toolbar UI**
  - Fixed position toolbar (top-right or bottom-right)
  - Toggle buttons for each overlay type
  - "Show All" and "Hide All" buttons
  - Collapse/expand toolbar button
  - Settings dropdown (opacity control, color scheme)

- [ ] **Mobile-Friendly Toolbar**
  - Hamburger menu on small screens
  - Touch-friendly button sizes
  - Slide-out drawer on mobile

---

## 🟡 PRIORITY 3: Proof of Concept (Do Third)

### 3.1 Add Standards to One Demo Page
**File**: `demo-marketing-complete.html` (test on this first)

- [ ] **Include Standards System**
  - Add `<script src="standards/standards-overlay.js">`
  - Add `<link href="standards/standards-overlay.css">`
  - Include standards toolbar snippet

- [ ] **Implement Layout Grid Overlay**
  - Show 12-column grid on desktop
  - Show 2-column grid on tablet
  - Show single column on mobile

- [ ] **Implement Touch Zones Overlay**
  - Show thumb-friendly zones on mobile
  - Highlight primary CTA in green zone
  - Show hard-to-reach areas in red

- [ ] **Implement Spacing Units Overlay**
  - Annotate section spacing (64px between hero and features)
  - Annotate component spacing (32px between cards)
  - Annotate internal padding (24px inside cards)

- [ ] **Implement Visual Flow Overlay**
  - Show Z-pattern for hero section
  - Show F-pattern for features section
  - Annotate visual hierarchy with numbers (1, 2, 3...)

- [ ] **Test Across Breakpoints**
  - Screenshot at 375px (mobile)
  - Screenshot at 768px (tablet)
  - Screenshot at 1440px (desktop)
  - Verify overlays adapt correctly

---

## 🟢 PRIORITY 4: Expand to All Demos (Do Fourth)

### 4.1 Add to Marketing Collection
- [ ] `demo-marketing-complete.html` ✅ (already done in priority 3)

### 4.2 Add to eCommerce Collection
**File**: `demo-ecommerce-complete.html`

- [ ] Layout grid overlay (product grids, 3-4 column)
- [ ] Touch targets (add to cart buttons, product cards)
- [ ] Spacing units (product grid gaps)
- [ ] Visual hierarchy (product detail page flow)

### 4.3 Add to Dashboard Collection
**File**: `demo-dashboard-complete.html`

- [ ] Layout grid overlay (sidebar + content area)
- [ ] Touch zones (mobile nav, hamburger menu)
- [ ] Spacing units (stat card gaps, table spacing)
- [ ] Content boundaries (sidebar width: 280px, content max-width)

### 4.4 Add to Auth Collection
**File**: `demo-auth-complete.html`

- [ ] Form standards overlay (label placement, input heights)
- [ ] Touch targets (input fields 56px, buttons 44×44px min)
- [ ] Primary action placement (bottom-right)
- [ ] Modal centering (max 600px width, centered)

### 4.5 Add to Email Collection
**File**: `demo-email-complete.html`

- [ ] Email-specific standards (600px max width)
- [ ] Safe area overlay (avoiding Outlook rendering issues)
- [ ] Touch targets for links/buttons
- [ ] Spacing standards (table cell padding)

### 4.6 Add to Content Collection
**File**: `demo-content-complete.html`

- [ ] F-pattern overlay (blog post reading flow)
- [ ] Content max-width (680px for readability)
- [ ] Visual hierarchy (typography scale)
- [ ] Card grid spacing

---

## 🔵 PRIORITY 5: Polish & Advanced Features (Do Fifth)

### 5.1 Create Interactive Measurements
- [ ] **Click to Measure Tool**
  - Click two elements to see distance between them
  - Show measurement in px and rem
  - Show if it matches standard units (8px, 16px, 24px, etc.)

- [ ] **Element Inspector**
  - Hover over element to see its standards compliance
  - Shows: touch target size, spacing from neighbors, color contrast
  - Pass/fail badge (✅ or ❌)

### 5.2 Create Standards Report
**File**: `standards/generate-report.js`

- [ ] **Automated Compliance Checker**
  - Scan page for touch targets < 44×44px (❌ fail)
  - Scan for non-standard spacing (warn if not 8px increments)
  - Check color contrast ratios (WCAG AA/AAA)
  - Check max-width containers (readability)

- [ ] **Generate Report Card**
  - Overall score (0-100%)
  - Breakdown by category (Layout: 95%, Touch: 87%, Spacing: 100%)
  - List of issues found with line numbers
  - Suggestions for fixes

### 5.3 Add AI Training Data Export
**File**: `standards/export-training-data.js`

- [ ] **Screenshot + Annotations Export**
  - Take screenshot of page with standards overlays
  - Export as PNG with annotations visible
  - Generate JSON describing all standards shown
  - Perfect format for AI training: image + structured data

- [ ] **Generate Prompt Templates**
  - "Build a hero section following DBBasic standards: ..."
  - Include all rules in natural language
  - AI can use this as system prompt when generating new components

### 5.4 Documentation Pages
- [ ] **Create Standards Landing Page**
  - File: `standards/index.html`
  - Overview of all standards
  - Links to each demo with standards enabled
  - Interactive playground to test standards

- [ ] **Update README.md**
  - Add section: "Usability Standards"
  - Link to USABILITY-STANDARDS.md
  - Screenshots of overlays in action
  - Explain how this makes dbbasic unique

### 5.5 Example Screenshots for Social/Docs
- [ ] Marketing demo with layout grid overlay (desktop)
- [ ] Auth demo with touch zones overlay (mobile)
- [ ] Dashboard with spacing units overlay (tablet)
- [ ] Side-by-side: overlay ON vs overlay OFF
- [ ] Animated GIF: toggling overlays on/off

---

## 🎯 Success Metrics

When we're done, we should have:

- ✅ Written usability standards documentation
- ✅ Working overlay system on all 6 demo collections
- ✅ 5+ overlay types (grid, touch, spacing, flow, targets)
- ✅ Mobile + tablet + desktop responsive overlays
- ✅ Automated compliance checker with scoring
- ✅ AI training data export capability
- ✅ Screenshots/GIFs for marketing
- ✅ Updated README with standards section

---

## 📊 Estimated Effort

**Priority 1 (Foundation)**: 4-6 hours
- Writing standards is thinking work, not coding

**Priority 2 (Overlay System)**: 6-8 hours
- JavaScript logic + CSS styling + toolbar UI

**Priority 3 (Proof of Concept)**: 2-3 hours
- Apply to one demo, debug, screenshot

**Priority 4 (Expand to All)**: 4-6 hours
- Copy/paste mostly, but each demo needs custom annotations

**Priority 5 (Polish)**: 6-10 hours
- Nice-to-haves, can be done over time

**Total**: 22-33 hours (3-4 days of focused work)

With AI assistance: Could be 2 days, same as the components themselves.

---

## 🚀 Launch Strategy

After completing Priority 1-3 (proof of concept):
1. Tweet: "We didn't just build components. We're teaching usability standards visually."
2. Post screenshot of overlay in action
3. Link to demo with standards enabled
4. Explain: "Toggle 'Show Standards' on any demo to see WHY it's designed this way"

After completing Priority 4 (all demos):
1. Update GitHub README with standards section
2. Record video walkthrough (2-3 minutes)
3. Post to Twitter/LinkedIn: "The only UI library that teaches you usability while you code"

After completing Priority 5 (polish):
1. Write blog post: "How to Build Apps People Can Actually Use"
2. Include automated compliance checker as free tool
3. Position dbbasic as "the library that prevents GeoCities 2.0"

---

## 💡 The Vision

**Current state**: dbbasic Components = 100+ copy-paste components
**After this**: dbbasic Components = Visual usability education + components

Every demo page becomes:
- Working example (use it in production)
- Teaching tool (learn the standards)
- Validation reference (compare your app)
- AI training data (show AI the right way)

This is how we prevent "fast AI slop" and enable "fast professional apps."

---

## Notes

- Keep standards practical, not academic
- Every rule must be visible on a real demo
- No rule without a "why" explanation
- Make it beautiful - the overlays themselves should be well-designed
- Mobile-first: touch zones are MORE important than grid
- Think in systems: 8px base unit, not random pixel values
