# DBBasic Usability Standards v1.0

> **Purpose**: Prevent GeoCities 2.0. Enable AI to build apps people can actually use.

These standards define WHERE things go and WHY. Follow them, and users will know how to use your app without thinking.

---

## Application Types: Know What You're Building

**Not all applications are the same.** A marketing site has different goals than a dashboard. Standards should adapt to context.

### Type 1: Brochure/Marketing Sites

**Goal**: Convert visitors, tell a story, build trust

**Examples**: Landing pages, company websites, product pages, portfolios

**User mindset**: "What is this? Can it help me?"
- First-time visitors (80%+)
- Quick scanning, not deep reading
- Decision: Stay or leave (within 5 seconds)

**Design priorities**:
1. **Clarity over density**: Lots of whitespace, clear hierarchy
2. **Story flow**: Z-pattern or F-pattern, guide the eye
3. **Single CTA**: One clear next action per section
4. **Speed**: Fast load = credibility, slow load = bounce
5. **Emotion**: Beautiful design = trustworthy brand

**Navigation**:
- Simple top bar (logo left, menu right, CTA button)
- 5-7 links max (more = analysis paralysis)
- Sticky nav on scroll (keep CTA accessible)
- Mobile: Hamburger menu accepted here

**Content density**: LOW
- Large hero (50-70% of viewport)
- Big headlines (48-64px)
- Generous spacing (64-96px between sections)
- Few elements per screen (3-5 cards max)

**Interaction pattern**: SCROLL + CLICK
- Long scroll storytelling
- Anchor links to sections
- CTAs at natural decision points
- Forms are SHORT (3-5 fields max)

**Success metric**: Conversion rate (sign-up, purchase, contact)

---

### Type 2: App/Dashboard Sites

**Goal**: Get work done efficiently, return to flow state

**Examples**: Admin dashboards, SaaS apps, productivity tools, CMSs

**User mindset**: "I need to do X task quickly"
- Daily/frequent users (power users)
- Know where things are (muscle memory)
- Speed > beauty (function > form)

**Design priorities**:
1. **Efficiency over storytelling**: Dense info, keyboard shortcuts
2. **Consistency**: Same place every time, predictable
3. **Batch actions**: Select multiple, act once
4. **Undo/redo**: Users make mistakes, let them recover
5. **Customization**: Let users arrange their workspace

**Navigation**:
- Persistent left sidebar (always visible)
- Hierarchical menu (expandable sections)
- Search is CRITICAL (Cmd+K shortcut)
- Breadcrumbs for deep navigation
- Mobile: Bottom tab bar (core 3-5 actions)

**Content density**: HIGH
- Small hero or none (dashboard = data first)
- Compact headings (24-32px)
- Tight spacing (24-32px between sections)
- Many elements per screen (data tables, charts, cards)

**Interaction pattern**: KEYBOARD + CLICK
- Tab navigation between fields
- Enter to submit, Esc to cancel
- Arrow keys in lists/tables
- Shortcuts for common actions (Cmd+S to save)
- Right-click context menus

**Success metric**: Task completion time (faster = better UX)

---

### Type 3: Social/Content Sites

**Goal**: Engagement, discovery, time on site

**Examples**: Social media, blogs, news sites, forums, video platforms

**User mindset**: "Show me something interesting"
- Mix of returning users + new visitors
- Browsing mode (not task-oriented)
- Endless appetite for content

**Design priorities**:
1. **Engagement over conversion**: Keep scrolling, keep clicking
2. **Discovery**: Recommendations, related content, rabbit holes
3. **Social proof**: Likes, comments, shares, reactions
4. **Personalization**: Algorithm-driven feeds
5. **Real-time**: New content appears, notifications

**Navigation**:
- Sticky top bar (always accessible during scroll)
- Simple menu (Home, Explore, Notifications, Profile)
- Search prominent (find people, content, topics)
- Mobile: Bottom tab bar (4-5 core actions)

**Content density**: MEDIUM-HIGH
- No hero (feed starts immediately)
- Medium headings (20-28px)
- Medium spacing (16-24px between posts)
- Infinite scroll (no pagination)

**Interaction pattern**: SCROLL + REACT
- Infinite scroll (lazy loading)
- Quick reactions (like, share, save)
- In-line comments (expand/collapse)
- Pull-to-refresh (mobile)
- Swipe gestures (mobile)

**Success metric**: Time on site, engagement rate (likes, shares, comments)

---

## How to Choose Standards

**When designing a page, ask:**
1. What type of application is this? (Brochure, App, or Social)
2. What is the user's goal? (Convert, Complete task, or Engage)
3. How often will they use it? (Once, Daily, or Browsing)

**Then apply the appropriate standards:**

| Standard              | Brochure       | App           | Social        |
|-----------------------|----------------|---------------|---------------|
| **Content Density**   | Low (airy)     | High (dense)  | Medium        |
| **Spacing**           | 64-96px        | 24-32px       | 16-24px       |
| **Navigation**        | Simple top     | Sidebar       | Sticky top    |
| **Primary Action**    | CTA buttons    | Batch actions | Reactions     |
| **Scroll Behavior**   | Long scroll    | Minimal       | Infinite      |
| **Customization**     | None           | High          | Algorithm     |

**Hybrid examples:**
- **E-commerce**: Brochure (homepage) + App (checkout) + Social (reviews)
- **SaaS marketing**: Brochure (landing) → App (product)
- **Blog with CMS**: Social (reading) + App (admin dashboard)

Use the RIGHT standards for each page type.

---

## 1. Navigation Hierarchy

**Rule**: Put navigation in the same place every time. Users shouldn't hunt for it.

### Mobile (320px - 767px)

**Primary Navigation**: Bottom tab bar
- **Why**: Thumb-friendly zone. 70% of users hold phones one-handed.
- **Height**: 64px minimum (56px tabs + 8px safe area)
- **Items**: 3-5 max (more = cognitive overload)
- **Active state**: Icon + label, bold weight, primary color
- **Inactive state**: Icon + label, normal weight, gray

**Secondary Navigation**: Hamburger menu (top-left)
- **Why**: Expected location, doesn't block content
- **Size**: 44×44px minimum touch target
- **Icon**: Three horizontal lines (☰)
- **Behavior**: Slide-in drawer from left, 280px wide

**Contextual Actions**: Top-right
- **Why**: Right-handed users expect actions here
- **Examples**: Search, filter, settings, profile
- **Size**: 44×44px minimum each
- **Max**: 2 icons (more = use overflow menu)

**Back/Cancel**: Top-left (next to hamburger, or replaces it)
- **Why**: iOS convention, widely understood
- **Icon**: Left arrow (←) or "×" for modals
- **Size**: 44×44px minimum

**Primary Action**: Floating Action Button (FAB), bottom-right
- **Why**: Thumb zone, visually prominent
- **Size**: 56×56px (slightly larger than minimum)
- **Position**: 16px from bottom, 16px from right
- **Elevation**: 6dp shadow (appears to float)
- **Use case**: ONE primary action per screen (e.g., "New Post", "Add Item")

### Tablet (768px - 1023px)

**Primary Navigation**: Top tabs OR left sidebar
- **Top tabs**: Horizontal, centered, 48px height
  - Use for: 3-6 equal-importance sections
  - Active state: Underline + primary color
- **Left sidebar**: 240px wide, persistent
  - Use for: 7+ sections OR hierarchical nav
  - Collapsible to icon-only (64px)

**Contextual Actions**: Top-right toolbar
- **Why**: More screen space = more actions visible
- **Layout**: Horizontal row, 32×32px icons
- **Spacing**: 16px between icons

**Back/Cancel**: Top-left breadcrumb OR back button
- **Breadcrumb**: Home > Category > Item
- **Back button**: Only if no breadcrumb

### Desktop (1024px+)

**Primary Navigation**: Left sidebar, persistent
- **Width**: 280px standard, 320px wide variant, 240px narrow variant
- **Why**: Consistent location, always visible
- **Collapsible**: Yes, to icon-only 64px wide
- **Items**: Grouped by category with headers
- **Active state**: Background fill + primary color + bold

**Contextual Actions**: Top-right toolbar
- **Layout**: Horizontal, with labels + icons
- **Size**: 32px height buttons, 8px padding

**Search**: Top bar, always visible
- **Position**: Center OR right side of top bar
- **Width**: 240px default, expands to 400px on focus
- **Shortcut**: Cmd/Ctrl + K

**User Profile**: Top-right corner
- **Why**: Universal convention
- **Size**: 40×40px avatar + dropdown
- **Click**: Opens account menu

---

## 2. Touch Target Standards

**Rule**: Make everything big enough to tap without frustration.

### Minimum Sizes

**Mobile (touch-primary)**:
- **Minimum**: 44×44px (Apple HIG, WCAG 2.5.5 AAA)
- **Comfortable**: 48×48px (Material Design recommendation)
- **Small text links**: 44×44px even if text is smaller (padding!)

**Tablet (hybrid touch/mouse)**:
- **Minimum**: 40×40px
- **Comfortable**: 44×44px

**Desktop (mouse-primary)**:
- **Minimum**: 32×32px
- **Comfortable**: 40×40px

### Spacing Between Targets

**Mobile**:
- **Minimum**: 8px between adjacent tappable elements
- **Comfortable**: 16px between adjacent tappable elements
- **Why**: Prevents mis-taps (fat finger problem)

**Example - Button Group**:
```
[Cancel] <--16px--> [Confirm]
  44×44px             44×44px
```

### Touch Zone Map (Mobile Portrait)

**Screen divided into 3 zones**:

1. **Green Zone (Bottom 1/3)**: Thumb-friendly
   - **Use for**: Primary actions, navigation, frequently-used controls
   - **Why**: Natural thumb rest position for one-handed use
   - **Examples**: Bottom tab bar, FAB, primary form button

2. **Yellow Zone (Middle 1/3)**: Reachable with stretch
   - **Use for**: Content, scrollable areas, secondary actions
   - **Why**: Requires slight thumb extension, still comfortable
   - **Examples**: List items, cards, secondary buttons

3. **Red Zone (Top 1/3)**: Hard to reach
   - **Use for**: Infrequent actions, labels, read-only content
   - **Why**: Requires hand shift or two-handed operation
   - **Examples**: Page title, settings icon, profile menu
   - **Never put**: Primary actions, destructive actions

### Exceptions

**Destructive Actions**: Intentionally make harder to reach
- **Placement**: Top of screen OR require confirmation modal
- **Why**: Prevent accidental deletion/destruction
- **Example**: "Delete Account" should NOT be in green zone

---

## 3. Spacing System

**Rule**: Use a consistent mathematical system. No random pixel values.

### Base Unit: 8px

**Why 8px?**
- Divisible by 2, 4 (easy math for responsive design)
- Works with most screen resolutions
- Creates visual rhythm

### Spacing Scale

| Use Case                    | Size   | Calculation | When to Use                           |
|----------------------------|--------|-------------|---------------------------------------|
| **Tiny**                   | 4px    | 0.5 × base  | Icon-to-label gap, tight spacing      |
| **Small**                  | 8px    | 1 × base    | Between related elements              |
| **Medium**                 | 16px   | 2 × base    | Between form fields, list items       |
| **Large**                  | 24px   | 3 × base    | Between unrelated elements            |
| **XLarge**                 | 32px   | 4 × base    | Between cards in grid                 |
| **Section**                | 48px   | 6 × base    | Between major sections (mobile)       |
| **Section (Desktop)**      | 64px   | 8 × base    | Between major sections (desktop)      |
| **Hero Spacing**           | 96px   | 12 × base   | Hero section top/bottom padding       |

### Component Padding

**Buttons**:
- Mobile: 16px vertical, 24px horizontal
- Desktop: 12px vertical, 24px horizontal

**Cards**:
- Mobile: 16px all sides
- Tablet: 24px all sides
- Desktop: 32px all sides

**Form Inputs**:
- Mobile: 16px vertical, 16px horizontal
- Desktop: 12px vertical, 16px horizontal

**Page Margins**:
- Mobile: 16px left/right
- Tablet: 24px left/right
- Desktop: 48px left/right (OR use max-width container)

### Grid Gaps

**Mobile**:
- Card grid: 16px gap
- List items: 8px gap

**Tablet**:
- Card grid: 24px gap
- List items: 12px gap

**Desktop**:
- Card grid: 32px gap
- List items: 16px gap

---

## 4. Layout Grid Standards

**Rule**: Use grids for consistency. Don't eyeball alignment.

### Mobile (320px - 767px)

**Columns**: 4 columns (rarely used, mostly single column layout)
- **Gutter**: 16px
- **Margin**: 16px left/right
- **Why**: Simple, easy to read, thumb-friendly

**Content Width**: Full width minus margins
- **Calculation**: 100% - 32px (16px × 2)

**Typical Layouts**:
- Single column (most common)
- 2-column grid for small cards (50% each minus gap)

### Tablet Portrait (768px - 1023px)

**Columns**: 8 columns
- **Gutter**: 24px
- **Margin**: 24px left/right

**Content Width**:
- **Full width**: 100% - 48px
- **Max width**: 768px (for readability)

**Typical Layouts**:
- 2-column grid (50/50 or 33/66 splits)
- Master-detail (list on left, detail on right)
- 3-column card grid

### Desktop (1024px+)

**Columns**: 12 columns
- **Gutter**: 24px
- **Margin**: 48px left/right (OR use max-width container)

**Content Width**:
- **Full width**: 100% (for dashboards, tables)
- **Max width (reading)**: 680px (for blog posts, articles)
- **Max width (app)**: 1200px (for dashboard content area)
- **Max width (marketing)**: 1400px (for landing pages)

**Why max-width?**
- Lines longer than ~80 characters are hard to read
- Wasted space on ultrawide monitors (2560px+)
- Forces intentional layout instead of stretching

**Typical Layouts**:
- Sidebar (3 cols) + Content (9 cols) = 3:9 ratio
- Sidebar (4 cols) + Content (8 cols) = 4:8 ratio (wider sidebar)
- 4-column card grid (3 cols each)
- 3-column card grid (4 cols each)

### Sidebar Widths (Standard)

| Sidebar Type        | Width  | Use Case                              |
|---------------------|--------|---------------------------------------|
| **Narrow**          | 240px  | Icon-heavy, minimal labels            |
| **Standard**        | 280px  | Most dashboards (recommended)         |
| **Wide**            | 320px  | Lots of text, nested navigation       |
| **Icon-only**       | 64px   | Collapsed state                       |

---

## 5. Visual Hierarchy Rules

**Rule**: Guide the eye. Users scan in patterns, not randomly.

### F-Pattern (Content-Heavy Pages)

**Use for**: Blog posts, articles, documentation, search results

**How it works**:
1. Users read top bar (navigation) left to right
2. Scan down left side (headings, images)
3. Occasionally scan right (if something catches eye)

**Design for F-Pattern**:
- Put important info in first 2 paragraphs (top horizontal bar of "F")
- Use left-aligned headings (left vertical bar of "F")
- Use images/pull-quotes to draw eye right
- Avoid center-aligned text for body copy

**Example Structure**:
```
[Logo]                                    [Nav Nav Nav]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ (horizontal 1)

Heading 1                                  [Image]
Paragraph text text text text...

Heading 2                                  [Image]
Paragraph text text text text...

Heading 3
Paragraph text text text text...
```

### Z-Pattern (Landing/Marketing Pages)

**Use for**: Hero sections, landing pages, sign-up flows, marketing

**How it works**:
1. Eye starts top-left (logo)
2. Scans right (navigation)
3. Diagonal down-left (main headline, subheading)
4. Scans right (CTA button)

**Design for Z-Pattern**:
- Logo top-left
- Navigation/CTA top-right
- Headline left-aligned or centered
- Primary CTA button right-aligned or centered

**Example Structure**:
```
[Logo]  ──────────────────────────>  [Sign Up Free]
   ╲
    ╲
     ╲
      ╲
       v
  [Big Headline]
  [Subheadline text]
                      ──────────────>  [Get Started →]
```

### Visual Weight Hierarchy

**Size Scale (Typography)**:
- **H1**: 48px mobile, 64px desktop (hero headlines)
- **H2**: 32px mobile, 40px desktop (section headers)
- **H3**: 24px mobile, 28px desktop (subsections)
- **Body**: 16px mobile, 18px desktop (paragraphs)
- **Small**: 14px (captions, helper text)

**Weight Scale**:
- **Black (900)**: Hero headlines only
- **Bold (700)**: Headings, active nav, primary buttons
- **Semibold (600)**: Labels, subheadings
- **Medium (500)**: Emphasized body text
- **Regular (400)**: Body text, secondary buttons
- **Light (300)**: De-emphasized text (avoid in small sizes)

**Color Hierarchy**:
- **Primary**: Call-to-action buttons, links, active states
- **Headings**: Near-black (#111827)
- **Body text**: Dark gray (#374151)
- **Secondary text**: Medium gray (#6b7280)
- **Disabled text**: Light gray (#9ca3af)

### Card Layouts (Equal Importance)

**Use for**: Product grids, blog previews, team members, pricing tiers

**Why**: All items have same visual weight = no priority

**Structure**:
- Same height cards (or min-height with flex)
- Same padding (24px or 32px)
- Same border/shadow treatment
- Grid layout with equal gaps

### List Layouts (Priority Order)

**Use for**: News feeds, activity logs, search results, notifications

**Why**: Top = most important/recent, order matters

**Structure**:
- Variable height items (content-dependent)
- Timestamp or priority indicator
- Most recent/important at top
- Infinite scroll OR pagination

---

## 6. Form Standards

**Rule**: Make forms easy to complete. Every friction point = lost conversions.

### Label Placement

**Mobile**:
- **Labels**: Above inputs (stacked)
- **Why**: Not enough horizontal space
- **Spacing**: 8px between label and input

**Desktop**:
- **Labels**: Above inputs (stacked) - PREFERRED
- **Labels**: Left of inputs (horizontal) - ONLY if space allows AND form is short
- **Why**: Stacked is faster to scan, works for long labels
- **Spacing**: 16px between label and input (stacked), 24px (horizontal)

### Input Heights

**Mobile**:
- **Height**: 56px (easier to tap)
- **Font size**: 16px minimum (prevents iOS zoom)
- **Padding**: 16px left/right, 16px top/bottom

**Desktop**:
- **Height**: 44px
- **Font size**: 16px
- **Padding**: 16px left/right, 12px top/bottom

### Input Width

**Email, password, short text**: 100% on mobile, max 400px on desktop
**Search**: max 600px
**Zip code, CVV, small codes**: Fixed small width (no point making them full-width)

### Primary Action Placement

**Mobile**:
- **Position**: Bottom of form, full width OR bottom-right
- **Size**: 56px height, full-width OR auto-width with 24px horizontal padding
- **Margin**: 32px top (spacing from last input)

**Desktop**:
- **Position**: Bottom-right of form
- **Size**: 44px height, auto-width with 24px horizontal padding
- **Alignment**: Right-aligned

### Secondary Action Placement

**Cancel/Back**:
- **Mobile**: Bottom-left OR omit (use back button)
- **Desktop**: Left of primary button, OR top-left as text link

**"Forgot password?"**:
- **Position**: Right-aligned, directly below password field
- **Size**: 14px text link, 44px touch target (padding)

### Error Message Placement

**Inline errors**: Below the field that has error
- **Color**: Red (#dc2626)
- **Icon**: ⚠️ or ❌
- **Spacing**: 8px above error text, 16px below (before next field)
- **Why**: Immediate feedback, clear association

**Form-level errors**: Top of form (above all fields)
- **Use for**: Server errors, general validation issues
- **Style**: Alert box, dismissible
- **Color**: Red background (#fee2e2), dark red text (#991b1b)

### Required Field Indicator

**Preferred**: Asterisk (*) next to label, red color
**Alternative**: "(required)" text next to label
**Best**: Make all fields required, or mark optional fields with "(optional)"

---

## 7. Feedback Standards

**Rule**: Tell users what's happening. No silent failures.

### Success Messages

**Toast Notification** (top-center OR bottom-center):
- **Color**: Green background (#d1fae5), dark green text (#065f46)
- **Icon**: ✓ checkmark
- **Duration**: Auto-dismiss after 3 seconds
- **Position**: Top-center (desktop), bottom-center (mobile, above nav)
- **Animation**: Slide in from top/bottom, fade out
- **Use for**: "Saved successfully", "Item added to cart", "Email sent"

**Inline Success** (below form):
- **Use for**: Form submissions that stay on page
- **Example**: "Your profile has been updated"

**Full-Page Success**:
- **Use for**: Critical completions (purchase, account creation)
- **Include**: Icon (✓), heading, description, next action button
- **Example**: "Welcome! Your account is ready."

### Error Messages

**Inline Error** (below field):
- **Color**: Red (#dc2626)
- **Icon**: ⚠️
- **Example**: "Email address is invalid"
- **When**: On blur (leaving field) OR on submit attempt

**Toast Error** (top-center):
- **Color**: Red background (#fee2e2), dark red text (#991b1b)
- **Icon**: ❌
- **Duration**: Manual dismiss OR 5 seconds (longer than success)
- **Use for**: API errors, network failures
- **Example**: "Could not save changes. Please try again."

**Blocking Modal** (critical errors only):
- **Use for**: Data loss risk, critical failures
- **Example**: "Your session has expired. Please log in again."
- **Requires**: User action to dismiss (button click)

### Loading States

**Inline Spinner** (<3 seconds expected):
- **Position**: Inside button OR next to loading content
- **Size**: 20px spinner
- **Use for**: Button clicks (save, submit), quick API calls
- **Button text**: "Saving..." OR replace with spinner

**Skeleton Screen** (>3 seconds expected):
- **Use for**: Page loads, large data fetches
- **Why**: Shows structure, feels faster than blank screen
- **Elements**: Gray rectangles in place of text/images, subtle pulse animation

**Progress Bar** (long operations with known duration):
- **Position**: Top of screen, full-width
- **Height**: 4px
- **Color**: Primary color
- **Use for**: File uploads, multi-step forms, batch operations
- **Show percentage**: If known (e.g., "Uploading... 47%")

**Full-Screen Loader** (initial app load only):
- **Use for**: First page load, app initialization
- **Style**: Centered spinner + logo + "Loading..."
- **Avoid**: Don't use for in-app navigation (too heavy)

### Warning Messages

**Toast Warning** (top-center):
- **Color**: Yellow background (#fef3c7), dark yellow text (#92400e)
- **Icon**: ⚠️
- **Duration**: Manual dismiss (important info)
- **Use for**: "You have unsaved changes", "Low disk space"

**Inline Warning** (above affected section):
- **Use for**: Contextual warnings
- **Example**: "This action cannot be undone"

### Info Messages

**Toast Info** (top-center):
- **Color**: Blue background (#dbeafe), dark blue text (#1e40af)
- **Icon**: ℹ️
- **Duration**: Auto-dismiss 4 seconds
- **Use for**: Tips, announcements, non-critical updates

---

## 8. Animation & Motion Standards

**Rule**: Animate to guide attention, not to annoy.

### Duration

- **Micro-interactions**: 100-200ms (hover, focus, clicks)
- **Page transitions**: 200-300ms (navigation, modals)
- **Complex animations**: 300-500ms (expanding cards, reordering)
- **Never**: >500ms (feels sluggish)

### Easing

- **Ease-out**: Most common (starts fast, slows down)
  - Use for: Entering elements, opening modals
  - `cubic-bezier(0, 0, 0.2, 1)`
- **Ease-in**: Rare (starts slow, speeds up)
  - Use for: Exiting elements, closing modals
  - `cubic-bezier(0.4, 0, 1, 1)`
- **Ease-in-out**: Smooth both ends
  - Use for: Looping animations, swapping elements
  - `cubic-bezier(0.4, 0, 0.2, 1)`

### What to Animate

**DO animate**:
- Button hover states (color, shadow)
- Modal open/close (fade + scale OR slide)
- Dropdown menus (fade + slide down)
- Toast notifications (slide in + fade out)
- Form validation (shake input on error)
- Page transitions (fade OR slide)

**DON'T animate**:
- Body text appearing (instant is better)
- Scrolling (use browser default)
- Hover states on mobile (no hover!)
- Critical alerts (instant is safer)

---

## 9. Accessibility Standards (WCAG AA minimum, AAA preferred)

### Color Contrast

**Text Contrast Ratios**:
- **Normal text** (16px): 4.5:1 minimum (AA), 7:1 preferred (AAA)
- **Large text** (24px+): 3:1 minimum (AA), 4.5:1 preferred (AAA)
- **UI components** (buttons, icons): 3:1 minimum

**Test**: Use contrast checker on all text/background combos

### Keyboard Navigation

**All interactive elements must**:
- Be focusable with Tab key
- Show visible focus indicator (outline, glow, or color change)
- Be activatable with Enter or Space
- Support arrow keys (for lists, menus, tabs)

**Focus order**: Left to right, top to bottom (reading order)

**Skip links**: "Skip to main content" as first focusable element

### Screen Reader Support

**All images**: Must have `alt` text (or `alt=""` if decorative)
**All buttons**: Must have text label OR `aria-label`
**All form inputs**: Must have associated `<label>` with `for` attribute
**All headings**: Must be hierarchical (h1, h2, h3... no skipping)

### Mobile Accessibility

**Text size**: 16px minimum (prevents iOS zoom on input focus)
**Touch targets**: 44×44px minimum (WCAG 2.5.5 Level AAA)
**Spacing**: 8px minimum between targets

---

## 10. Performance Standards

### Load Times

- **First Contentful Paint**: <1.8s (good), <3s (acceptable)
- **Time to Interactive**: <3.8s (good), <7.3s (acceptable)
- **Largest Contentful Paint**: <2.5s (good), <4s (acceptable)

### Image Optimization

- Use WebP with JPEG fallback
- Lazy load images below fold
- Responsive images (`srcset`) for different screen sizes
- Max file size: 200KB per image (compress!)

### CSS/JS Bundle Size

- Critical CSS: Inline, <14KB
- JavaScript: <170KB compressed (per route/page)
- Fonts: 2 weights max (e.g., Regular 400 + Bold 700), WOFF2 format

---

## Summary: The Golden Rules

1. **Navigation**: Same place every time, per form factor
2. **Touch Targets**: 44×44px minimum on mobile, 32×32px desktop
3. **Spacing**: 8px base unit, no random values
4. **Grids**: 4-col mobile, 8-col tablet, 12-col desktop
5. **Hierarchy**: F-pattern for content, Z-pattern for marketing
6. **Forms**: Labels above inputs, primary action bottom-right
7. **Feedback**: Toast for success (3s), inline for errors
8. **Motion**: 200-300ms page transitions, ease-out preferred
9. **Accessibility**: 4.5:1 contrast, keyboard navigable, screen reader friendly
10. **Performance**: <3s interactive, optimize images, limit bundle size

**Follow these standards, and your apps will feel professional, familiar, and easy to use.**

**Break these standards, and you get GeoCities 2.0.**

---

*Version 1.0 - January 2025 - dbbasic.com - Dan Quellhorst*
