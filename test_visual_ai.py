#!/usr/bin/env python3

"""
Automated Visual Accessibility Testing with AI Vision

1. Takes screenshots of all component docs using Playwright
2. Analyzes screenshots using Claude's vision API
3. Checks for: contrast, visual feedback, affordances
4. Generates HTML report with pass/fail results

Usage: python3 test_visual_ai.py
"""

import os
import base64
import json
from pathlib import Path
from datetime import datetime
from anthropic import Anthropic
from playwright.sync_api import sync_playwright

# Load .env file if it exists
def load_env():
    env_path = Path(__file__).parent / '.env'
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

load_env()

# Component pages that should have screenshots
COMPONENT_PAGES = [
    'semantic-action.html',
    'semantic-card.html',
    'semantic-input.html',
    'semantic-modal.html',
    'semantic-navigator.html',
    'semantic-list.html',
    'semantic-menu.html',
    'semantic-feedback.html',
    'semantic-adjuster.html'
]

# AI prompts for accessibility testing
ACCESSIBILITY_PROMPTS = {
    'contrast': """Analyze this component screenshot for WCAG AA contrast compliance:

1. Identify all text elements (labels, buttons, input text, etc.)
2. Measure approximate contrast ratios between text and backgrounds
3. Flag any text below 4.5:1 contrast (normal text) or 3:1 (large text 18pt+)
4. List specific failures with colors if detected

Return ONLY valid JSON (no markdown):
{
  "passed": true/false,
  "issues": [
    {"element": "Save button", "contrast": "3.2:1", "colors": "white on #007aff", "severity": "fail"}
  ]
}""",

    'visual_feedback': """Analyze this component's visual feedback states:

1. Check if disabled elements look OBVIOUSLY non-interactive (grey, not just faded colors)
2. Check if hover states are clearly visible
3. Check if selection/active states are unmistakable
4. Check if focus indicators are present and visible

Return ONLY valid JSON (no markdown):
{
  "passed": true/false,
  "issues": [
    {"state": "disabled", "problem": "still looks blue, not grey", "severity": "fail"},
    {"state": "hover", "problem": "no visible change detected", "severity": "warning"}
  ]
}""",

    'affordance': """Analyze if interactive elements are obviously clickable:

1. Do buttons look like buttons (not plain text)?
2. Are touch targets at least 44px (visible size)?
3. Do disabled states look obviously non-interactive?
4. Are dangerous actions (delete, etc.) visually distinct (red)?

Return ONLY valid JSON (no markdown):
{
  "passed": true/false,
  "issues": [
    {"element": "Delete button", "problem": "same blue as Save button", "severity": "fail"}
  ]
}""",

    'state_differentiation': """Analyze the Interactive States section (if present):

CRITICAL: Check if buttons labeled with different states (Default, Hover, Active, Focus, Disabled) actually LOOK DIFFERENT from each other.

1. Do ALL state buttons look identical/same color? (CRITICAL FAIL)
2. Does the Hover state button show visual elevation or shadow?
3. Does the Active state button show scale-down effect?
4. Does the Focus state button show an outline?
5. Does the Disabled state button look grey/non-interactive?

If there is NO Interactive States section, pass this test.

Return ONLY valid JSON (no markdown):
{
  "passed": true/false,
  "issues": [
    {"state": "all_identical", "problem": "All 5 state buttons look identical (same grey color)", "severity": "fail"},
    {"state": "hover", "problem": "Hover state button shows no visual difference from default", "severity": "fail"}
  ]
}"""
}


class VisualAIAnalyzer:
    def __init__(self, api_key: str):
        self.client = Anthropic(api_key=api_key)
        self.screenshots_dir = Path(__file__).parent / 'screenshots'
        self.results_dir = Path(__file__).parent / 'test-results'
        self.docs_dir = Path(__file__).parent / 'docs'
        self.results = []

        # Create directories if needed
        self.screenshots_dir.mkdir(exist_ok=True)
        self.results_dir.mkdir(exist_ok=True)

    def capture_screenshots(self):
        """Capture screenshots of all component docs using Playwright"""
        print("\n📸 Capturing screenshots with Playwright...\n")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={'width': 1400, 'height': 1200})

            for component_page in COMPONENT_PAGES:
                doc_path = self.docs_dir / component_page

                if not doc_path.exists():
                    print(f"⚠️  Doc not found: {component_page}")
                    continue

                print(f"📸 Screenshotting {component_page}...")

                # Load page
                page.goto(f"file://{doc_path}")
                page.wait_for_load_state('networkidle')

                # Screenshot full page
                screenshot_path = self.screenshots_dir / f"{component_page}.png"
                page.screenshot(path=str(screenshot_path), full_page=True)

                # Screenshot individual sections
                sections = page.query_selector_all('.section')
                for i, section in enumerate(sections):
                    try:
                        title_elem = section.query_selector('.section-title')
                        title = title_elem.inner_text().strip() if title_elem else f"section-{i}"
                        section_filename = f"{component_page}_{title.lower().replace(' ', '-').replace('&', 'and')}.png"
                        section_path = self.screenshots_dir / section_filename
                        section.screenshot(path=str(section_path))
                    except Exception as e:
                        print(f"  ⚠️  Could not screenshot section {i}: {e}")

            browser.close()

        print(f"\n✅ Screenshots saved to {self.screenshots_dir}\n")

    def encode_image(self, image_path: Path) -> str:
        """Read image and encode as base64"""
        with open(image_path, 'rb') as f:
            return base64.standard_b64encode(f.read()).decode('utf-8')

    def analyze_image(self, image_path: Path, prompt: str) -> dict:
        """Analyze image with Claude's vision API"""
        print(f"🤖 Analyzing {image_path.name}...")

        # Encode image
        image_data = self.encode_image(image_path)

        # Call Claude API
        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-5",
                max_tokens=1024,
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/png",
                                "data": image_data
                            }
                        },
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }]
            )

            # Extract text from response
            response_text = message.content[0].text

            # Parse JSON (handle markdown code blocks if present)
            response_text = response_text.strip()
            if response_text.startswith('```'):
                # Remove markdown code blocks
                lines = response_text.split('\n')
                response_text = '\n'.join(lines[1:-1])  # Remove first and last line

            result = json.loads(response_text)
            return result

        except Exception as e:
            print(f"❌ Error analyzing {image_path.name}: {e}")
            return {"passed": False, "issues": [{"error": str(e)}]}

    def test_component(self, component_page: str) -> dict:
        """Test a single component page"""
        print(f"\n🧪 Testing {component_page}...")

        # Find screenshot
        screenshot_path = self.screenshots_dir / f"{component_page}.png"

        if not screenshot_path.exists():
            print(f"⚠️  Screenshot not found: {screenshot_path}")
            return None

        # Run all accessibility tests
        contrast_result = self.analyze_image(screenshot_path, ACCESSIBILITY_PROMPTS['contrast'])
        feedback_result = self.analyze_image(screenshot_path, ACCESSIBILITY_PROMPTS['visual_feedback'])
        affordance_result = self.analyze_image(screenshot_path, ACCESSIBILITY_PROMPTS['affordance'])
        state_diff_result = self.analyze_image(screenshot_path, ACCESSIBILITY_PROMPTS['state_differentiation'])

        # Compile results
        result = {
            'component': component_page.replace('.html', ''),
            'timestamp': datetime.now().isoformat(),
            'screenshot': str(screenshot_path.relative_to(Path.cwd())),
            'tests': {
                'contrast': contrast_result,
                'visual_feedback': feedback_result,
                'affordance': affordance_result,
                'state_differentiation': state_diff_result
            },
            'passed': all([
                contrast_result.get('passed', False),
                feedback_result.get('passed', False),
                affordance_result.get('passed', False),
                state_diff_result.get('passed', False)
            ])
        }

        self.results.append(result)

        # Log results
        if result['passed']:
            print(f"✅ {component_page} - ALL TESTS PASSED")
        else:
            print(f"❌ {component_page} - FAILURES DETECTED:")
            if not contrast_result.get('passed', False):
                print(f"   - Contrast issues: {len(contrast_result.get('issues', []))}")
            if not feedback_result.get('passed', False):
                print(f"   - Visual feedback issues: {len(feedback_result.get('issues', []))}")
            if not affordance_result.get('passed', False):
                print(f"   - Affordance issues: {len(affordance_result.get('issues', []))}")
            if not state_diff_result.get('passed', False):
                print(f"   - State differentiation issues: {len(state_diff_result.get('issues', []))}")

        return result

    def generate_html_report(self) -> Path:
        """Generate HTML report from results"""
        passed_count = sum(1 for r in self.results if r['passed'])
        failed_count = len(self.results) - passed_count
        pass_rate = round((passed_count / len(self.results)) * 100) if self.results else 0

        # Build result rows
        result_rows = []
        for result in self.results:
            status_icon = '✅' if result['passed'] else '❌'
            status_class = 'pass' if result['passed'] else 'fail'

            # Collect issues
            issues_html = []
            for test_type, test_result in result['tests'].items():
                if not test_result.get('passed', False) and test_result.get('issues'):
                    issue_items = []
                    for issue in test_result['issues']:
                        if 'error' in issue:
                            issue_items.append(f"<li>Error: {issue['error']}</li>")
                        else:
                            element = issue.get('element') or issue.get('state', 'Unknown')
                            problem = issue.get('problem') or issue.get('contrast', 'Issue detected')
                            severity = issue.get('severity', 'warning')
                            issue_items.append(f"<li>{element}: {problem} ({severity})</li>")

                    issues_html.append(f"""
                        <div class="issue-group">
                            <strong>{test_type.replace('_', ' ').title()}:</strong>
                            <ul>{''.join(issue_items)}</ul>
                        </div>
                    """)

            issues_content = ''.join(issues_html) if issues_html else '<span class="no-issues">No issues detected</span>'

            result_rows.append(f"""
                <tr class="{status_class}">
                    <td>{status_icon} {result['component']}</td>
                    <td>{'Pass' if result['passed'] else 'Fail'}</td>
                    <td>
                        <a href="../{result['screenshot']}" target="_blank">View Screenshot</a>
                    </td>
                    <td>{issues_content}</td>
                </tr>
            """)

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Accessibility Test Report</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: #000;
            color: #fff;
            padding: 48px 24px;
        }}
        .container {{ max-width: 1400px; margin: 0 auto; }}
        h1 {{ font-size: 48px; margin-bottom: 24px; color: #409cff; }}
        .summary {{
            display: flex;
            gap: 24px;
            margin-bottom: 48px;
        }}
        .summary-card {{
            flex: 1;
            background: #1c1c1e;
            border: 2px solid #38383a;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
        }}
        .summary-card.pass {{ border-color: #34c759; }}
        .summary-card.fail {{ border-color: #ff3b30; }}
        .summary-number {{ font-size: 48px; font-weight: 900; margin-bottom: 8px; }}
        .summary-card.pass .summary-number {{ color: #34c759; }}
        .summary-card.fail .summary-number {{ color: #ff3b30; }}
        table {{
            width: 100%;
            border-collapse: collapse;
            background: #1c1c1e;
            border: 2px solid #38383a;
            border-radius: 12px;
            overflow: hidden;
        }}
        th {{
            background: rgba(64, 156, 255, 0.1);
            padding: 16px;
            text-align: left;
            font-weight: 700;
            color: #409cff;
            border-bottom: 2px solid #38383a;
        }}
        td {{
            padding: 16px;
            border-bottom: 1px solid #38383a;
        }}
        tr:last-child td {{ border-bottom: none; }}
        tr.pass td:first-child {{ color: #34c759; }}
        tr.fail td:first-child {{ color: #ff3b30; }}
        .issue-group {{
            margin-bottom: 12px;
            padding: 12px;
            background: rgba(255, 59, 48, 0.1);
            border-left: 3px solid #ff3b30;
            border-radius: 4px;
        }}
        .issue-group ul {{
            margin-top: 8px;
            padding-left: 24px;
        }}
        .issue-group li {{
            margin-bottom: 4px;
            color: #ababab;
        }}
        .no-issues {{ color: #6e6e73; }}
        a {{ color: #409cff; text-decoration: none; }}
        a:hover {{ text-decoration: underline; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Visual Accessibility Test Report</h1>
        <p style="color: #ababab; margin-bottom: 48px; font-size: 18px;">
            Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        </p>

        <div class="summary">
            <div class="summary-card pass">
                <div class="summary-number">{passed_count}</div>
                <div style="color: #ababab;">Components Passed</div>
            </div>
            <div class="summary-card fail">
                <div class="summary-number">{failed_count}</div>
                <div style="color: #ababab;">Components Failed</div>
            </div>
            <div class="summary-card">
                <div class="summary-number">{pass_rate}%</div>
                <div style="color: #ababab;">Pass Rate</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Component</th>
                    <th>Status</th>
                    <th>Screenshot</th>
                    <th>Issues</th>
                </tr>
            </thead>
            <tbody>
                {''.join(result_rows)}
            </tbody>
        </table>
    </div>
</body>
</html>"""

        report_path = self.results_dir / 'accessibility-report-ai.html'
        report_path.write_text(html)
        print(f"\n📊 Report generated: {report_path}")

        return report_path

    def run_all(self, skip_screenshots=False):
        """Run tests on all components"""
        # Capture screenshots first
        if not skip_screenshots:
            self.capture_screenshots()

        print(f"\n🧪 Testing {len(COMPONENT_PAGES)} components with AI vision...\n")

        for component_page in COMPONENT_PAGES:
            self.test_component(component_page)

        # Generate reports
        report_path = self.generate_html_report()

        # Save JSON results
        json_path = self.results_dir / 'results-ai.json'
        with open(json_path, 'w') as f:
            json.dump(self.results, f, indent=2)

        print(f"\n✅ Testing complete!")
        print(f"   Passed: {sum(1 for r in self.results if r['passed'])}/{len(self.results)}")
        print(f"   HTML Report: {report_path}")
        print(f"   JSON Results: {json_path}")

        return self.results


if __name__ == '__main__':
    # Get API key from environment
    api_key = os.environ.get('ANTHROPIC_API_KEY')

    if not api_key:
        print("⚠️  Warning: ANTHROPIC_API_KEY not found in .env or environment")
        print("Running in screenshot-only mode (no AI analysis)\n")

        # Create analyzer with dummy key
        analyzer = VisualAIAnalyzer("dummy-key")

        # Just capture screenshots
        analyzer.capture_screenshots()

        print("\n✅ Screenshots captured successfully!")
        print("Add ANTHROPIC_API_KEY to .env file to enable AI analysis")
        exit(0)

    # Run full tests with AI analysis
    analyzer = VisualAIAnalyzer(api_key)
    analyzer.run_all()
