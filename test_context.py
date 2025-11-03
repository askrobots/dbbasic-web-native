#!/usr/bin/env python3
"""
Context-aware testing across different viewports and modalities.
Tests how components adapt between mobile, tablet, and desktop.
Cost: FREE (Playwright viewport testing)
Run: On PR
"""

from playwright.sync_api import sync_playwright
from pathlib import Path
import json

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

CONTEXTS = [
    {
        'name': 'mobile',
        'viewport': {'width': 375, 'height': 667},
        'user_agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        'has_touch': True
    },
    {
        'name': 'tablet',
        'viewport': {'width': 768, 'height': 1024},
        'user_agent': 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
        'has_touch': True
    },
    {
        'name': 'desktop',
        'viewport': {'width': 1400, 'height': 1200},
        'user_agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'has_touch': False
    }
]

class ContextTester:
    def __init__(self):
        self.results = []
        self.docs_dir = Path(__file__).parent / 'docs'

    def test_component_context(self, page, component_name, context):
        """Test component in specific context"""
        doc_path = self.docs_dir / component_name
        page.goto(f'file://{doc_path}')
        page.wait_for_load_state('networkidle')

        issues = []

        # Test 1: Touch targets in touch contexts
        if context['has_touch']:
            buttons = page.locator('button, [role="button"], a[href]').all()
            for button in buttons:
                box = button.bounding_box()
                if box and (box['width'] < 44 or box['height'] < 44):
                    issues.append({
                        'type': 'small_touch_target_mobile',
                        'element': button.evaluate('el => el.tagName.toLowerCase()'),
                        'size': f"{box['width']}x{box['height']}",
                        'context': context['name'],
                        'severity': 'error'
                    })

        # Test 2: Viewport responsiveness
        viewport_width = context['viewport']['width']
        body_width = page.evaluate('document.body.scrollWidth')

        if body_width > viewport_width:
            issues.append({
                'type': 'horizontal_overflow',
                'viewport': viewport_width,
                'content': body_width,
                'context': context['name'],
                'severity': 'error'
            })

        # Test 3: Text readability (font size minimum)
        text_elements = page.locator('p, span, div, li').all()
        for elem in text_elements[:10]:  # Sample first 10
            try:
                font_size = elem.evaluate('el => window.getComputedStyle(el).fontSize')
                size_px = float(font_size.replace('px', ''))

                # Mobile should have at least 16px for body text
                if context['has_touch'] and size_px < 14:
                    issues.append({
                        'type': 'small_font_mobile',
                        'size': f'{size_px}px',
                        'context': context['name'],
                        'severity': 'warning'
                    })
            except:
                pass

        # Test 4: Interactive elements spacing (mobile)
        if context['has_touch']:
            interactive = page.locator('button, a[href], input').all()
            for i in range(len(interactive) - 1):
                try:
                    box1 = interactive[i].bounding_box()
                    box2 = interactive[i+1].bounding_box()

                    if box1 and box2:
                        # Check vertical spacing
                        if abs(box1['y'] - box2['y']) < 8:
                            # Elements on same row, check horizontal spacing
                            spacing = abs(box2['x'] - (box1['x'] + box1['width']))
                            if spacing < 8:
                                issues.append({
                                    'type': 'insufficient_spacing',
                                    'spacing': f'{spacing}px',
                                    'context': context['name'],
                                    'severity': 'warning'
                                })
                except:
                    pass

        return {
            'component': component_name,
            'context': context['name'],
            'viewport': f"{context['viewport']['width']}x{context['viewport']['height']}",
            'passed': len(issues) == 0,
            'issues': issues,
            'issue_count': len(issues)
        }

    def run_all_tests(self):
        """Test all components across all contexts"""
        print("\n🌐 Running context-aware tests...\n")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)

            for context in CONTEXTS:
                print(f"\n📱 Testing in {context['name'].upper()} context...")
                print(f"   Viewport: {context['viewport']['width']}x{context['viewport']['height']}")

                page = browser.new_page(
                    viewport=context['viewport'],
                    user_agent=context['user_agent']
                )

                for component in COMPONENT_PAGES:
                    print(f"  🔍 {component}...", end='')
                    result = self.test_component_context(page, component, context)
                    self.results.append(result)

                    if result['passed']:
                        print(" ✅")
                    else:
                        print(f" ❌ ({result['issue_count']} issues)")

                page.close()

            browser.close()

        self.generate_report()

    def generate_report(self):
        """Generate test report"""
        # Count by context
        context_stats = {}
        for context in CONTEXTS:
            results_for_context = [r for r in self.results if r['context'] == context['name']]
            passed = sum(1 for r in results_for_context if r['passed'])
            total = len(results_for_context)
            context_stats[context['name']] = {'passed': passed, 'total': total}

        # Save JSON
        results_path = Path(__file__).parent / 'test-results' / 'results-context.json'
        results_path.parent.mkdir(exist_ok=True)
        with open(results_path, 'w') as f:
            json.dump(self.results, f, indent=2)

        print(f"\n{'='*60}")
        print("📊 Context tests complete!")
        print(f"{'='*60}\n")

        for context_name, stats in context_stats.items():
            print(f"{context_name.upper()}: {stats['passed']}/{stats['total']} passed")

        print(f"\nResults: {results_path}")

        # Exit with error if any tests failed
        total_passed = sum(r['passed'] for r in self.results)
        if total_passed < len(self.results):
            exit(1)

if __name__ == '__main__':
    tester = ContextTester()
    tester.run_all_tests()
