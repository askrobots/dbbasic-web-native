# Bootstrap Replacement MVP

## Goal: Stop Using Bootstrap

**Target: Build the minimum set of components to replace Bootstrap in real projects**

## What Bootstrap Provides (Core Components)

### Layout & Structure
1. Container/Grid system
2. Rows and columns
3. Responsive utilities

### Components We Already Have ✅
4. ✅ Buttons (semantic-action)
5. ✅ Cards (semantic-card)
6. ✅ Forms/Inputs (semantic-input)
7. ✅ Modals (semantic-modal)
8. ✅ Alerts/Toasts (semantic-feedback)
9. ✅ Dropdowns/Menus (semantic-menu)
10. ✅ Navigation (semantic-navigator)

### Components We Need to Build
11. ❌ **Tabs** - Tab navigation (critical)
12. ❌ **Accordion/Collapse** - Expandable sections (high priority)
13. ❌ **Spinner/Progress** - Loading indicators (high priority)
14. ❌ **Badge** - Notification counts (medium priority)
15. ❌ **Breadcrumb** - Navigation breadcrumbs (medium priority)
16. ❌ **Pagination** - Page navigation (medium priority)
17. ❌ **Tooltip** - Hover information (medium priority)
18. ❌ **Popover** - Click information (medium priority)

### What We Can Use Tailwind For
- Container/Grid → `<div class="container mx-auto">`
- Responsive utilities → Tailwind classes
- Spacing/Typography → Tailwind classes

## MVP Strategy: 2-Week Sprint

### Week 1: Critical Components (4 components)
Build the ones you absolutely cannot work without:

**Day 1-2: semantic-tabs**
- Tab navigation with panels
- Keyboard navigation (arrow keys)
- Grid test hover/active/focus states
- **Priority: CRITICAL**

**Day 3-4: semantic-disclosure** (Accordion/Collapse)
- Expandable/collapsible sections
- Multiple or single-open modes
- Smooth animations
- **Priority: CRITICAL**

**Day 5: semantic-progress**
- Spinner (indeterminate)
- Progress bar (determinate)
- **Priority: CRITICAL**

### Week 2: High-Value Components (4 components)

**Day 6-7: semantic-badge**
- Notification indicators
- Counts on buttons/icons
- **Priority: HIGH**

**Day 8-9: semantic-popover**
- Contextual information
- Smart positioning (arrow points to trigger)
- Replaces both tooltip and popover
- **Priority: HIGH**

**Day 10: semantic-breadcrumb**
- Navigation hierarchy
- Auto-truncates on mobile
- **Priority: MEDIUM**

### Optimization Pass (Week 2, remaining days)

**Day 11-12: Optimize Existing Components**
- Apply grid testing to semantic-card
- Apply grid testing to semantic-input
- Apply grid testing to semantic-modal

**Day 13-14: Real-World Testing**
- Build a complete page using only semantic components + Tailwind
- Identify gaps
- Polish rough edges

## After 2 Weeks: Bootstrap Replacement Complete

**You'll have:**
- 13 semantic components (9 existing + 4 new critical)
- 6 additional high-value components
- Several existing components optimized
- Real-world validation

**You can then:**
- ❌ Remove Bootstrap from projects
- ✅ Use semantic components + Tailwind
- ✅ Focus on building features, not UI infrastructure
- ✅ Benefit from modality-agnostic design
- ✅ Get WCAG AAA accessibility automatically

## Implementation Order (Prioritized)

### Tier 1: Must-Have (Week 1)
1. **semantic-tabs** - Can't build settings pages without this
2. **semantic-disclosure** - FAQ sections, settings panels
3. **semantic-progress** - Loading states are everywhere
4. **semantic-badge** - Notification counts

### Tier 2: Very Useful (Week 2)
5. **semantic-popover** - Contextual help, info bubbles
6. **semantic-breadcrumb** - Multi-level navigation
7. Optimize semantic-card
8. Optimize semantic-input

### Tier 3: Nice to Have (Future)
9. semantic-pagination (can use Tailwind temporarily)
10. semantic-carousel (can defer)
11. semantic-rating (can defer)

## Success Criteria

After this 2-week sprint, you should be able to:

1. ✅ Build a complete dashboard without Bootstrap
2. ✅ Have all critical interactive patterns covered
3. ✅ Navigation works (tabs, breadcrumbs, menus)
4. ✅ Feedback works (badges, toasts, progress)
5. ✅ Forms work (inputs, validation)
6. ✅ Layouts work (cards, containers, grids via Tailwind)
7. ✅ Everything is accessible (WCAG AAA)
8. ✅ Everything is modality-agnostic (mouse, touch, keyboard, voice)

## Let's Start NOW

### Today's Goal: semantic-tabs

Let's build the first critical component right now and validate the workflow.

**semantic-tabs requirements:**
- Multiple tabs with associated panels
- Click to switch tabs
- Keyboard navigation (arrow keys, Home, End)
- ARIA roles (tablist, tab, tabpanel)
- Support for badges on tabs
- Disabled tabs
- Vertical or horizontal orientation
- Grid test all interactive states

**Estimated time: 6-8 hours**
- Design API: 1 hour
- Implement base functionality: 2-3 hours
- Grid test states: 1-2 hours
- Documentation: 1 hour
- Testing: 1 hour

Ready to start?
