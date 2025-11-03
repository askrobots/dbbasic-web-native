# Claude Code Workflow Documentation

## Effective Debugging Workflow for Visual/UI Issues

### Problem
When fixing visual component issues, I was claiming things were fixed without actually verifying them, leading to repeated failures and user frustration.

### Solution: Screenshot-Verify-Fix Loop

When debugging visual/rendering issues, follow this workflow:

1. **Take Screenshot First**
   ```python
   python3 -c "
   from playwright.sync_api import sync_playwright
   from pathlib import Path

   with sync_playwright() as p:
       browser = p.chromium.launch()
       page = browser.new_page(viewport={'width': 1400, 'height': 1200})
       file_path = Path('docs/component.html').absolute()
       page.goto(f'file://{file_path}')
       page.wait_for_timeout(1000)
       page.screenshot(path='test-screenshot.png', full_page=True)
       browser.close()
   "
   ```

2. **Read Screenshot with Vision**
   ```
   Read tool on the screenshot PNG file
   ```
   - Visually confirm the actual state
   - Don't assume - verify with your eyes

3. **Check Console Errors**
   ```python
   # Add console logging to playwright script
   page.on('console', lambda msg: print(f'CONSOLE: {msg.type}: {msg.text}'))
   page.on('pageerror', lambda exc: print(f'ERROR: {exc}'))
   ```
   - JavaScript errors often reveal the root cause
   - Example: `ERROR: this.getIntentColors is not a function`

4. **Make Fix**
   - Address the root cause found in console errors
   - Don't guess at CSS fixes without understanding the problem

5. **Screenshot Again to Verify**
   - Take another screenshot after the fix
   - Read it with vision to confirm the fix worked
   - Show before/after if helpful

6. **Only Then Claim Success**
   - Don't tell the user it's fixed until you've verified it yourself
   - Use phrases like "I can see in the screenshot that..." to prove verification

## Example: semantic-card Component Fix

### Issue
Component showed as empty gray box - appeared to render but no content visible.

### Investigation Process
1. ❌ First assumed it was CSS `overflow: hidden` issue
2. ❌ Made CSS changes, claimed it was fixed without checking
3. ❌ User said "nope" and asked why I wasn't using vision to verify
4. ✅ Took screenshot with Playwright
5. ✅ Read screenshot - confirmed still broken
6. ✅ Added console error logging to Playwright
7. ✅ Found: `ERROR: this.getIntentColors is not a function`
8. ✅ Root cause: Missing method in base class
9. ✅ Added `getIntentColors()` method to SemanticComponent
10. ✅ Took new screenshot
11. ✅ Read screenshot - confirmed components now visible
12. ✅ Only then reported success with evidence

### Root Cause
- SemanticCard.render() called `this.getIntentColors()` at line 389
- SemanticComponent base class didn't define this method
- JavaScript error prevented component from rendering
- No visual indication of error - just blank space

### Fix Applied
```javascript
// Added to SemanticComponent base class (lines 205-237)
getIntentColors() {
    const intent = this.getAttribute('intent') || 'secondary';
    const sentiment = this.getAttribute('sentiment') || 'neutral';

    const colors = {
        bg: '#2c2c2e',
        border: '#38383a',
        borderHover: '#4d9fff',
        text: '#fff'
    };

    // Intent and sentiment overrides...
    return colors;
}
```

## Key Lessons

1. **Never claim something is fixed without visual verification**
2. **Console errors are gold** - they reveal the actual problem
3. **Screenshots provide accountability** - you can't lie to yourself
4. **CSS changes alone rarely fix JS errors** - check console first
5. **User was right to be frustrated** - I was making claims without evidence

## Tools Created for This Workflow

### test_single_visual.py
- Tests one component at a time
- Takes screenshot
- Runs 4 AI vision tests (contrast, state differentiation, affordance, visual feedback)
- Logs API costs
- Provides independent verification

### test_tracker.py
- Uses dbbasic-tsv to track test state
- Calculates file hashes to detect changes
- Prevents re-testing unchanged components
- Records test results and timestamps

## When to Use This Workflow

- Any time you're fixing visual/rendering issues
- When components aren't displaying correctly
- When CSS changes don't seem to work
- Before claiming "it's fixed" to the user
- When debugging web components or shadow DOM issues

## Anti-Patterns to Avoid

❌ "I removed overflow:hidden so it should be visible now"
❌ "The CSS looks correct, so the component should render"
❌ "Let me open it for you to check" (without checking yourself first)
❌ Making multiple CSS changes without verification
❌ Assuming the issue is CSS when it could be JavaScript

✅ "Let me take a screenshot to verify"
✅ "I can see in the screenshot that the component is now visible"
✅ "The console shows this error, which is the root cause"
✅ "Here's the before and after screenshots"
✅ "I've verified the fix works before reporting success"

## Grid Testing Methodology for Design Decisions

### Problem
When making subjective design decisions (hover effects, spacing, colors), it's easy to make assumptions without systematic comparison.

### Solution: Grid Testing with Vision AI

When you need to pick the best option for a visual design element:

1. **Create a Grid Test Page**
   - Generate 9 variations of the design element in a single HTML page
   - Each variation in its own box with clear labels
   - Force all states visible simultaneously (no hover simulation issues)

2. **Systematic Variations**
   - Vary one property at a time (blur radius, opacity, lift amount, etc.)
   - Test extremes and middle ground
   - Example for hover effects:
     - V1: Original dramatic (32px blur, 0.8 opacity)
     - V2: Refined professional (12px blur, 0.4 opacity)
     - V3: Subtle tight (8px blur, 0.3 opacity)
     - V4: Medium balanced (16px blur, 0.5 opacity)
     - V5: Tight but bright (8px blur, 0.6 opacity) ⭐
     - V6: Wide subtle (20px blur, 0.3 opacity)
     - V7: No glow (dark shadow only)
     - V8: Minimal (6px blur, 0.4 opacity)
     - V9: Strong contained (10px blur, 0.7 opacity)

3. **Force States to be Visible**
   ```javascript
   // Add CSS classes for forced state
   .test-button.force-hover.v5 {
       transform: translateY(-2px);
       box-shadow: 0 3px 8px rgba(64, 156, 255, 0.6);
       filter: brightness(1.2);
   }

   // Apply in JavaScript
   document.addEventListener('DOMContentLoaded', () => {
       document.querySelectorAll('.test-button').forEach(btn => {
           btn.classList.add('force-hover');
       });
   });
   ```

4. **Screenshot and Compare**
   ```python
   python3 -c "
   from playwright.sync_api import sync_playwright
   import time

   with sync_playwright() as p:
       browser = p.chromium.launch()
       page = browser.new_page(viewport={'width': 1400, 'height': 900})
       page.goto('file:///path/to/test-hover-grid.html')
       page.wait_for_load_state('networkidle')
       time.sleep(0.5)  # Let JS apply classes
       page.screenshot(path='grid-test.png', full_page=True)
       browser.close()
   "
   ```

5. **Use Vision AI to Analyze**
   - Read the screenshot with vision
   - Compare all 9 variations simultaneously
   - Look for balance, professionalism, and effectiveness
   - Pick the winner based on objective visual assessment

6. **Apply to All Components**
   - Update actual component code with winning variation
   - Update documentation CSS (generate-docs.js)
   - Regenerate docs to ensure consistency

### Example: Hover Effect Optimization

**Test File**: `test-hover-grid.html`
**Winner**: V5 (Tight But Bright)
- **Values**: 8px blur, 0.6 opacity, -2px lift, brightness 1.2
- **Why**: Tight glow stays close to button (professional), high opacity provides clear feedback, brightness makes interaction feel responsive

**Applied To**:
- `semantic-components.js` line 303-307 (button:hover state)
- `generate-docs.js` line 685-694 (hover state demo CSS)

### Key Benefits

1. **Eliminates Guesswork**: Compare all options side-by-side
2. **Vision AI as Design Reviewer**: Get objective analysis of visual properties
3. **Systematic Approach**: Try 9 variations covers the design space
4. **Reusable Process**: Can apply to any design decision (spacing, shadows, colors, animations)
5. **Evidence-Based**: Can show user the grid and explain why you picked the winner

### When to Use Grid Testing

- Hover/focus/active state effects
- Shadow depths and spreads
- Color palette selection
- Spacing/padding variations
- Animation timing curves
- Border radius options
- Typography scale decisions

### Anti-Patterns to Avoid

❌ "This looks good to me" (without comparison)
❌ "Users probably prefer X" (without testing)
❌ "This is standard practice" (without verification)
❌ Testing only 2-3 options (not enough coverage)
❌ Forgetting to force states visible in grid tests

✅ "I tested 9 variations and V5 provides the best balance"
✅ "Grid testing shows V5 has tight glow that stays professional"
✅ "Vision AI analysis confirms V5 is most effective"
✅ "Here's the grid test screenshot showing all options"
