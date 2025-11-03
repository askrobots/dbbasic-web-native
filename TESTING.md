# Testing Infrastructure

Comprehensive multi-tiered testing system for semantic components with cost optimization.

## Test Suites

### Tier 1: Free Tests (Run on every commit)

- **`test_structure.py`** - DOM & ARIA validation
  - Cost: FREE (Playwright queries only)
  - Speed: ~5 seconds
  - Checks: Missing ARIA labels, touch targets, heading hierarchy, form labels

- **`test_integration.py`** - Component composition testing
  - Cost: FREE (Playwright functional tests)
  - Speed: ~10 seconds
  - Checks: Modal with actions, card composition, form validation, nested components

```bash
npm run test:structure
python3 test_integration.py
```

### Tier 2: Cheap Tests (Run on PR)

- **`test_voice.py`** - Voice command validation with text AI
  - Cost: ~$0.01 per run (Claude Haiku)
  - Speed: ~30 seconds
  - Checks: Voice hints, aria-labels, command uniqueness

- **`test_context.py`** - Multi-viewport responsive testing
  - Cost: FREE (Playwright viewport testing)
  - Speed: ~15 seconds
  - Checks: Mobile/tablet/desktop layouts, overflow, font sizes, touch targets

- **`test_gestures.py`** - Touch & gesture interaction validation
  - Cost: FREE (Playwright touch simulation)
  - Speed: ~10 seconds
  - Checks: Swipe gestures, long-press, tap responsiveness, gesture conflicts

- **`test_attention.py`** - Cognitive load & attention budget
  - Cost: FREE (Computed metrics)
  - Speed: ~15 seconds
  - Checks: Visual complexity, interactive element count, animation cost, color palette

- **`test_performance.py`** - Load time & render benchmarks
  - Cost: FREE (Browser performance API)
  - Speed: ~20 seconds
  - Checks: Load time, component registration, paint metrics, memory usage, DOM complexity

```bash
npm run test:voice
python3 test_context.py
python3 test_gestures.py
python3 test_attention.py
python3 test_performance.py
```

### Tier 3: Expensive Tests (Run nightly/before release)

- **`test_visual_ai.py`** - AI vision accessibility testing
  - Cost: ~$0.50 per run (Claude Sonnet 4.5 vision)
  - Speed: ~3 minutes
  - Checks: Visual contrast, affordances, feedback states

- **`test_visual_single.py <component>`** - Single component vision test
  - Cost: ~$0.06 per component (3 vision tests)
  - Speed: ~30 seconds
  - Use for testing only changed components in PRs

```bash
npm run test:visual
python3 test_visual_single.py semantic-modal
```

### Tier 4: Future Tests (Opt-in)

- **`test_spatial.py`** - AR/VR spatial context simulation
  - Cost: FREE (Simulated spatial contexts)
  - Speed: ~30 seconds
  - Checks: Distance readability, visual angles, depth cues, spatial positioning
  - Run with: `python3 test_all.py --spatial`

```bash
python3 test_spatial.py
```

## Unified Test Runner

Run all tests with intelligent execution order:

```bash
# Run all tests (fast → slow → expensive)
npm test

# Run only free/cheap tests (skip vision)
npm run test:fast

# Run specific test suite
npm run test:structure
npm run test:voice
npm run test:visual
```

## Test Results

Results are saved to `test-results/`:
- `results-structure.json` - Structural issues
- `results-integration.json` - Component composition issues
- `results-voice.json` - Voice command issues
- `results-context.json` - Responsive/context issues
- `results-gestures.json` - Touch/gesture issues
- `results-attention.json` - Cognitive load issues
- `results-performance.json` - Performance metrics
- `results-ai.json` - Visual accessibility issues
- `results-spatial.json` - AR/VR spatial issues (with --spatial)
- `accessibility-report-ai.html` - Human-readable vision report

## CI/CD Integration

Recommended workflow:

```yaml
# On commit (fast feedback)
on: push
  - npm run test:structure  # FREE

# On PR (comprehensive)
on: pull_request
  - npm run test:structure  # FREE
  - npm run test:voice      # $0.01

# Nightly (full validation)
schedule: '0 0 * * *'
  - npm run test:all        # $0.51
```

## What Each Test Catches

### Structure Tests (FREE)
✅ Missing ARIA labels on interactive elements
✅ Images without alt text
✅ Form inputs without labels
✅ Touch targets smaller than 44x44px
✅ Broken heading hierarchy (h1 → h3 skip)
✅ Modals without aria-modal="true"

### Integration Tests (FREE)
✅ Modal with action buttons composition
✅ Card with actions slot rendering
✅ List with navigation interaction
✅ Form with multiple inputs
✅ Nested component conflicts

### Voice Tests ($0.01)
✅ Missing voice command hints
✅ Unclear or ambiguous voice labels
✅ Duplicate voice commands (conflicts)
✅ Elements that can't be activated by voice

### Context Tests (FREE)
✅ Horizontal overflow on mobile
✅ Font sizes too small on mobile (< 14px)
✅ Touch targets too small for touch devices
✅ Desktop/tablet/mobile responsive issues

### Gesture Tests (FREE)
✅ Swipe gesture feedback
✅ Long-press handling
✅ Touch target spacing (< 8px gap)
✅ Tap responsiveness (> 100ms)
✅ Gesture conflicts in nested components
✅ Pinch zoom disabled inappropriately

### Attention Tests (FREE)
✅ Visual complexity score (element/color/font/animation count)
✅ Too many interactive elements (Miller's Law: 7±2)
✅ Excessive autoplay animations
✅ Color palette size (> 12 colors)
✅ Long focus trap cycles (> 15 elements)

### Performance Tests (FREE)
✅ Load time (> 500ms)
✅ Web component registration time (> 100ms)
✅ First Contentful Paint (> 2500ms)
✅ Memory usage (> 10MB for single component)
✅ DOM complexity (> 3000 nodes or depth > 32)
✅ Layout reflow performance (> 1ms)

### Visual Tests ($0.50)
✅ Insufficient color contrast (WCAG AA)
✅ Missing visual feedback on hover/focus
✅ Poor affordances (elements don't look interactive)
✅ Slot rendering issues (buttons not appearing)
✅ Layout problems visible only in screenshots

### Spatial Tests (FREE, opt-in)
✅ Text readability at various distances (30cm to 400cm)
✅ Touch target visual angles at distance
✅ Depth perception cues (shadows, transforms)
✅ Spatial attention budget (viewport coverage)
✅ Fixed positioning incompatible with AR/VR

## Cost Optimization

| Test Type | Per Run | Per Month (30 days) | Use Case |
|-----------|---------|---------------------|----------|
| Structure | FREE | FREE | Every commit |
| Voice | $0.01 | $0.30 | Every PR (~30/month) |
| Visual | $0.50 | $15.00 | Nightly builds |
| **Total** | **$0.51** | **$15.30** | Full coverage |

## Completed Test Suite

All planned test suites are now implemented:
✅ `test_structure.py` - DOM & ARIA validation
✅ `test_integration.py` - Component composition
✅ `test_voice.py` - Voice command validation
✅ `test_context.py` - Multi-viewport responsive testing
✅ `test_gestures.py` - Touch/gesture validation
✅ `test_attention.py` - Attention budget checks
✅ `test_performance.py` - Load time benchmarks
✅ `test_visual_ai.py` - AI vision accessibility
✅ `test_visual_single.py` - Single component vision
✅ `test_spatial.py` - AR/VR context simulation

## Philosophy

**The Testing Pyramid:**
```
        🔺 AI Vision (expensive, comprehensive)
       /  \
      /    \  Text AI + Unit (cheap, focused)
     /______\  Structure (free, fast)
```

This creates sustainable testing where:
- Fast tests give immediate feedback (seconds)
- Cheap tests validate logic (minutes, pennies)
- Expensive tests catch visual bugs (minutes, dollars)

## Why This Matters

Traditional testing can't catch:
- "Button has outline in CSS but doesn't render"
- "Text meets WCAG 4.5:1 mathematically but looks grey"
- "Modal slot name is wrong so buttons don't appear"
- "Component claims to be accessible but isn't usable"

AI visual testing bridges the gap between **code intent** and **user reality**.
