# Automated Visual Accessibility Testing

## The Complete Pipeline

```
┌─────────────────┐
│ 1. Generate     │
│    Component    │──┐
│    Docs         │  │
└─────────────────┘  │
                     │
┌─────────────────┐  │
│ 2. Screenshot   │  │
│    All States   │◄─┘
└─────────────────┘
         │
         │
         ▼
┌─────────────────┐
│ 3. AI Vision    │
│    Analysis     │
└─────────────────┘
         │
         │
         ▼
┌─────────────────┐
│ 4. Pass/Fail    │
│    Report       │
└─────────────────┘
```

## How It Works

### Step 1: Generate Documentation

```bash
npm run docs:generate
```

**What it does:**
- Reads component metadata from `generate-docs.js`
- Generates complete HTML docs for each component
- Creates visual examples of all states (default, hover, active, disabled, etc.)
- Outputs to `docs/` directory

**Example output:**
```
✓ Generated semantic-action.html
✓ Generated semantic-card.html
✓ Generated semantic-input.html
```

### Step 2: Screenshot Components

```bash
npm run test:visual
```

**What it does:**
- Launches headless Chromium (Puppeteer)
- Loads each component doc page
- Screenshots full page + individual sections
- Saves to `screenshots/` directory

**Example screenshots:**
```
screenshots/
  ├── semantic-action.html.png (full page)
  ├── semantic-action.html_interactive-states.png
  ├── semantic-action.html_properties-attributes.png
  ├── semantic-card.html.png
  └── ...
```

### Step 3: AI Vision Analysis

**What it analyzes:**

#### Contrast Check
```javascript
prompt: `Analyze this screenshot for WCAG AA contrast compliance:
1. Identify all text elements
2. Measure contrast ratios
3. Flag any text below 4.5:1
4. Return specific failures with colors`
```

**AI Output:**
```json
{
  "passed": false,
  "issues": [
    {
      "element": "Save button (disabled)",
      "contrast": "3.2:1",
      "colors": "white on #007aff",
      "severity": "fail"
    }
  ]
}
```

#### Visual Feedback Check
```javascript
prompt: `Check if states are visually obvious:
1. Are disabled elements OBVIOUSLY non-interactive?
2. Are hover states clearly visible?
3. Are selection states unmistakable?
4. Are focus indicators present?`
```

**AI Output:**
```json
{
  "passed": false,
  "issues": [
    {
      "state": "disabled",
      "problem": "still looks blue like enabled button, not grey",
      "severity": "fail"
    }
  ]
}
```

#### Affordance Check
```javascript
prompt: `Check if interactive elements are obviously clickable:
1. Do buttons look like buttons?
2. Are touch targets at least 44px?
3. Do disabled states look non-interactive?
4. Are dangerous actions visually distinct?`
```

### Step 4: Generate Report

**Outputs HTML report to:** `test-results/accessibility-report.html`

**Report includes:**
- Summary (passed/failed count, pass rate)
- Component-by-component results
- Screenshots with issues highlighted
- Specific failures with recommendations

**Example report:**

```
🤖 Visual Accessibility Test Report

Summary:
  ✅ 7 components passed
  ❌ 2 components failed
  📊 78% pass rate

Results:
  ✅ semantic-action - ALL TESTS PASSED
  ❌ semantic-input - FAILURES DETECTED:
     - Contrast issues: 1 (disabled state #007aff on white = 3.2:1)
  ✅ semantic-card - ALL TESTS PASSED
```

---

## Usage

### One-Time Test

```bash
# Install dependencies first
npm install

# Generate docs + run tests
npm run test:all
```

### Watch Mode (During Development)

```bash
# Auto-regenerate on file changes
npm run test:visual:watch
```

### CI/CD Integration

```yaml
# .github/workflows/accessibility.yml
name: Visual Accessibility Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:all
      - uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
      - uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: screenshots/
```

---

## AI Vision Integration

### Using Claude API

```javascript
const { AIVisionAnalyzer } = require('./test-visual-ai');

const analyzer = new AIVisionAnalyzer(
  process.env.ANTHROPIC_API_KEY,
  'anthropic'
);

const result = await analyzer.analyzeImage(
  'screenshots/semantic-action.html.png',
  accessibilityPrompts.contrast
);

console.log(result);
// { passed: false, issues: [...] }
```

### Using OpenAI GPT-4V

```javascript
const analyzer = new AIVisionAnalyzer(
  process.env.OPENAI_API_KEY,
  'openai'
);
```

### Environment Variables

```bash
# .env
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

---

## What Gets Tested

### 1. WCAG AA Contrast (4.5:1 minimum)

**Tested on:**
- Button text
- Input labels
- Error messages
- Disabled states
- All interactive elements

**Example failure:**
```
❌ semantic-action disabled state
   White text (#fff) on blue background (#007aff)
   Contrast: 3.2:1 (needs 4.5:1)
   Fix: Use grey background (#3a3a3a) instead
```

### 2. Visual Feedback Obviousness

**Tested for:**
- Disabled states look OBVIOUSLY non-clickable (grey, not faded blue)
- Hover states show CLEAR visual changes (lift, shadow, border)
- Active states provide IMMEDIATE feedback (scale, press effect)
- Selection states are UNMISTAKABLE (bold border, checkmark, etc.)

**Example failure:**
```
❌ semantic-input disabled state
   Still has white background like enabled input
   Fix: Grey out background to #2a2a2a
```

### 3. Interaction Affordances

**Tested for:**
- Buttons look like buttons (not plain text)
- Touch targets are minimum 44px (WCAG AAA)
- Dangerous actions use red/destructive colors
- Primary actions are visually distinct

**Example failure:**
```
❌ Delete button
   Blue color like Save button (should be red)
   Fix: Use sentiment="destructive" for red color
```

---

## Advantages Over Manual Testing

### Manual Testing:
```
❌ Time: 30+ minutes per component
❌ Consistency: Different reviewers miss different issues
❌ Regression: Old bugs come back unnoticed
❌ Coverage: Easy to miss states (hover, focus, etc.)
❌ Documentation: Screenshots get outdated
```

### Automated AI Testing:
```
✅ Time: 2 minutes for all components
✅ Consistency: AI checks same criteria every time
✅ Regression: Runs on every commit, catches regressions immediately
✅ Coverage: Screenshots every state automatically
✅ Documentation: Screenshots always up-to-date
```

---

## Comparison with Other Tools

### Axe / Pa11y (Code Analysis)
```javascript
// Finds: Missing ARIA labels, incorrect roles
// Misses: Visual contrast issues, hover states, affordance problems
```

**Example:** Axe says "button has role=button ✓" but can't tell if it LOOKS clickable.

### Lighthouse (Automated Audit)
```javascript
// Finds: Contrast issues on default state
// Misses: Disabled state problems, hover state issues
```

**Example:** Lighthouse checks default blue button (passes), misses that disabled button is also blue.

### Our AI Vision Testing
```javascript
// Finds: Everything humans would see
//   - Contrast on ALL states (default, hover, disabled, etc.)
//   - Visual feedback clarity
//   - Affordance issues
//   - State differentiation
```

**Example:** AI sees disabled button is still blue and says "this doesn't look disabled enough."

---

## Real-World Example

### Before AI Testing:

**Developer thought disabled state was fine:**
```html
<button disabled style="opacity: 0.6; background: #007aff;">
  Save
</button>
```

**Lighthouse:** ✓ Passes (checks default state only)
**Axe:** ✓ Passes (has disabled attribute)
**Users:** ❌ "Why can't I click this blue button?"

### After AI Testing:

**AI screenshot analysis:**
```
❌ Disabled button still looks blue/clickable
   Contrast: 3.2:1 (fails WCAG AA)
   Recommendation: Use grey background (#3a3a3a) + grey text (#6e6e73)
```

**Developer fixes:**
```html
<button disabled style="background: #3a3a3a; color: #6e6e73;">
  Save
</button>
```

**AI re-test:** ✅ Now obviously disabled
**Users:** ✓ "Clearly can't click this greyed-out button"

---

## Cost Analysis

### AI API Costs

**Claude Sonnet (Vision):**
- ~$3 per 1000 images
- 9 components × 5 states = 45 screenshots
- Cost per test run: ~$0.14

**GPT-4V (Vision):**
- ~$10 per 1000 images
- 45 screenshots per run
- Cost per test run: ~$0.45

### Manual Testing Costs

**Senior designer checking accessibility:**
- $100/hour salary
- 30 minutes per component × 9 components = 4.5 hours
- Cost: $450

**Savings: 99.97% cheaper with AI testing**

Plus:
- Runs on every commit (human can't)
- Never gets tired or inconsistent
- Generates documentation automatically

---

## Future Enhancements

### 1. Visual Regression Testing

```javascript
// Compare screenshots over time
const before = 'screenshots/v1/semantic-action.html.png';
const after = 'screenshots/v2/semantic-action.html.png';

const diff = await compareImages(before, after);
if (diff.percentage > 5) {
  console.warn('Visual regression detected!');
}
```

### 2. Animated State Testing

```javascript
// Screenshot hover animation frames
const frames = await captureAnimation('button:hover', 300ms);
// AI analyzes: "Animation is smooth, provides clear feedback"
```

### 3. Cross-Browser Testing

```javascript
// Screenshot in Chrome, Firefox, Safari
const browsers = ['chrome', 'firefox', 'webkit'];
for (const browser of browsers) {
  await screenshot(browser);
}
// AI compares: "Button renders consistently across browsers"
```

### 4. Mobile vs Desktop

```javascript
// Screenshot at different viewports
const viewports = [
  { width: 390, height: 844, name: 'iPhone' },
  { width: 1920, height: 1080, name: 'Desktop' }
];
// AI checks: "Touch targets are 44px on mobile"
```

---

## Integration with Existing Tests

```javascript
// test-visual-ai.js integrates with:

// 1. Visual Test Suite (browser-based)
const interactiveTests = await runVisualTestSuite();

// 2. AI Screenshot Analysis
const aiTests = await runAIAnalysis();

// 3. Combined Report
const report = {
  interactive: interactiveTests.results,
  ai: aiTests.results,
  passed: interactiveTests.passed && aiTests.passed
};
```

**Best of both worlds:**
- Interactive tests: Check code works (events fire, states change)
- AI tests: Check visuals work (contrast, affordance, feedback)

---

## Summary

### The Pipeline

1. **Write component metadata once** (in generate-docs.js)
2. **Auto-generate docs** (npm run docs:generate)
3. **Auto-screenshot all states** (npm run test:visual)
4. **AI analyzes screenshots** (contrast, feedback, affordances)
5. **Get detailed report** (what failed, why, how to fix)

### Benefits

- ✅ **Catches issues humans miss** (AI sees every state)
- ✅ **Runs on every commit** (prevents regressions)
- ✅ **Generates documentation** (always up-to-date screenshots)
- ✅ **99.97% cheaper than manual** ($0.14 vs $450)
- ✅ **Consistent quality** (same criteria every time)

### The Future

When you update a component:
1. Update metadata
2. Run `npm test`
3. AI tells you exactly what broke
4. Fix it
5. Ship with confidence

**No more:** "Oops, disabled buttons are still blue in production"
**Instead:** "AI caught that in CI, fixed before merge"

---

This is the future of accessibility testing.
