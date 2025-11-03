# Visual Testing Guide

## Overview

The Component Gallery now includes a comprehensive **Visual Test Suite** that automatically tests all components for:

- ✅ **Visual feedback on interactions** (hover, click, active states)
- ✅ **Color contrast ratios** (WCAG AA compliance - 4.5:1 minimum)
- ✅ **Focus indicators** for keyboard accessibility
- ✅ **State transitions** (default → hover → active → selected)
- ✅ **Accessibility for visual impairments**

## How to Use

### 1. Open the Component Gallery

```bash
open component-gallery.html
```

Or just double-click the file in Finder.

### 2. Open the Visual Test Suite

**Press `Ctrl+Shift+T`** (or `Cmd+Shift+T` on Mac)

This opens a red testing panel on the left side of the screen.

### 3. Run All Tests

Click the **"▶ Run All Tests"** button in the test panel.

The suite will:

1. **Automatically scroll** to each component
2. **Simulate mouse events** (hover, click, mousedown, mouseup)
3. **Highlight elements** being tested with a red outline
4. **Measure contrast ratios** between text and backgrounds
5. **Check for visual state changes** on interactions
6. **Verify focus indicators** exist and are visible
7. **Display results** in real-time (✓ pass or ✗ fail)

### 4. Review Results

Each test shows:

- **✓ Green** = Passed (good accessibility, clear visual feedback)
- **✗ Red** = Failed (needs improvement)

Example results:

```
✓ semantic-action: Hover State
  Hover state has visible changes

✗ Accessibility: Text Contrast
  3 elements fail contrast check (below 4.5:1)
```

## What Tests Are Run

### Component State Tests

1. **Default State** - Verifies proper contrast and styling
2. **Hover State** - Simulates mouseenter, checks for visual changes
3. **Click Feedback** - Simulates mousedown, checks for active state
4. **Disabled State** - Verifies disabled elements are visually distinct
5. **Selection Feedback** - Tests selection boxes show clear changes

### Accessibility Tests

1. **Text Contrast** - All text must be 4.5:1 or higher (WCAG AA)
2. **Focus Indicators** - All interactive elements show focus state
3. **Color Differentiation** - States don't rely solely on color

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+T` | Toggle Visual Test Suite |
| `Ctrl+Shift+D` | Toggle DevTools Panel |
| `Ctrl+Shift+V` | Activate Voice Commands |

## Test Configuration

### Options

- **Auto-scroll to component** ✓ (enabled by default)
  - Automatically scrolls the page to each component being tested

- **Check contrast ratios (WCAG AA)** ✓ (enabled by default)
  - Measures color contrast for all visible text

### Stop Tests

Click **"⏹ Stop"** to halt test execution at any time.

## Understanding Contrast Ratios

### WCAG AA Requirements

- **Normal text**: 4.5:1 minimum
- **Large text** (18pt+): 3:1 minimum
- **AAA level**: 7:1 for normal text

### Common Issues

❌ **Light grey text on white background** (2:1) - FAILS
✅ **Dark grey on white** (#333 on #FFF = 12.6:1) - PASSES
✅ **White on blue** (#FFF on #007AFF = 4.6:1) - PASSES

## Visual Impairment Testing

The test suite ensures components are usable for people with:

### Color Blindness
- States don't rely only on color (uses icons, text, borders)
- High contrast between states

### Low Vision
- Minimum 4.5:1 contrast ratios
- Large clickable areas (44px minimum)
- Clear focus indicators

### Screen Reader Users
- Proper ARIA labels (built into semantic components)
- Focus management
- Keyboard navigation

## Automated Interaction Simulation

The test suite simulates:

```javascript
// Hover
element.dispatchEvent(new MouseEvent('mouseenter'));

// Click
element.dispatchEvent(new MouseEvent('mousedown'));
element.dispatchEvent(new MouseEvent('mouseup'));
element.dispatchEvent(new MouseEvent('click'));

// Focus
element.focus();
```

This ensures all interaction states are actually tested, not just documented.

## Adding Custom Tests

You can add your own tests programmatically:

```javascript
window.visualTestSuite.addTest({
    name: 'My Custom Test',
    description: 'Tests something specific',
    run: async () => {
        const element = document.querySelector('.my-component');

        // Perform test logic
        const isGood = element.style.color === 'rgb(0, 0, 0)';

        return {
            pass: isGood,
            message: isGood ? 'Test passed!' : 'Test failed',
            element: element
        };
    }
});
```

## Example Test Output

```
🧪 Visual Test Suite
Running: semantic-action: Hover State (2/8)

Results:
─────────────────────────────────────────
8/8 Passed
8 passed • 0 failed
─────────────────────────────────────────

✓ semantic-action: Default State
  Contrast ratio: 12.63:1 (PASS WCAG AA)

✓ semantic-action: Hover State
  Hover state has visible changes

✓ semantic-action: Click Feedback
  Active state detected

✓ semantic-action: Disabled State
  Disabled state is visually distinct

✓ State Demo: Selection Feedback
  Selection shows clear visual change (border + badge)

✓ semantic-card: Hover Elevation
  Card elevates on hover

✓ Accessibility: Text Contrast
  All text passes WCAG AA contrast

✓ Accessibility: Focus Indicators
  All focusable elements have focus indicators
```

## Why This Matters

### Before (Manual Testing)
- "Does this button look clickable?" → *maybe?*
- "Can people see the hover state?" → *hard to tell*
- "Is this accessible?" → *no idea*

### After (Automated Testing)
- **Contrast ratio: 8.2:1** → ✓ WCAG AA compliant
- **Hover state changes transform + boxShadow** → ✓ Visually distinct
- **Focus indicator present** → ✓ Keyboard accessible

## Browser Console

All test results are also logged to the console for debugging:

```javascript
console.log(window.visualTestSuite.results);
```

## Next Steps

1. **Run the tests** - See what passes/fails
2. **Fix failures** - Improve contrast, add visual feedback
3. **Re-run tests** - Verify fixes work
4. **Add more tests** - Cover edge cases

---

**The goal:** Make components so obviously interactive that even someone with visual impairments can confidently use them.
