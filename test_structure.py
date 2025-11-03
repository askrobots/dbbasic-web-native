#!/usr/bin/env python3
"""
Fast structural tests for semantic components.
Tests DOM structure, ARIA attributes, and basic accessibility.
Cost: FREE (Playwright DOM queries only)
Run: Every commit
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

class StructuralTester:
    def __init__(self):
        self.results = []
        self.docs_dir = Path(__file__).parent / 'docs'

    def test_component(self, page, component_name):
        """Run structural tests on a component page"""
        doc_path = self.docs_dir / component_name
        page.goto(f'file://{doc_path}')
        page.wait_for_load_state('networkidle')

        issues = []

        # Test 1: All interactive elements have proper ARIA
        interactive = page.locator('button, a[href], input, [role="button"], [role="link"]').all()
        for element in interactive:
            aria_label = element.get_attribute('aria-label')
            inner_text = element.inner_text().strip() if element.inner_text() else ''

            if not aria_label and not inner_text:
                issues.append({
                    'type': 'missing_aria',
                    'element': element.evaluate('el => el.tagName.toLowerCase()'),
                    'severity': 'error'
                })

        # Test 2: All images have alt text
        images = page.locator('img').all()
        for img in images:
            alt = img.get_attribute('alt')
            if alt is None:
                issues.append({
                    'type': 'missing_alt',
                    'element': 'img',
                    'src': img.get_attribute('src'),
                    'severity': 'error'
                })

        # Test 3: Form inputs have labels
        inputs = page.locator('input, textarea, select').all()
        for input_elem in inputs:
            input_id = input_elem.get_attribute('id')
            aria_label = input_elem.get_attribute('aria-label')

            if input_id:
                label = page.locator(f'label[for="{input_id}"]').count()
                if label == 0 and not aria_label:
                    issues.append({
                        'type': 'missing_label',
                        'element': input_elem.evaluate('el => el.tagName.toLowerCase()'),
                        'severity': 'error'
                    })

        # Test 4: Heading hierarchy
        headings = page.locator('h1, h2, h3, h4, h5, h6').all()
        prev_level = 0
        for heading in headings:
            tag = heading.evaluate('el => el.tagName')
            level = int(tag[1])

            if prev_level > 0 and level - prev_level > 1:
                issues.append({
                    'type': 'heading_skip',
                    'from': f'h{prev_level}',
                    'to': f'h{level}',
                    'severity': 'warning'
                })
            prev_level = level

        # Test 5: Touch targets (44x44px minimum)
        buttons = page.locator('button, [role="button"]').all()
        for button in buttons:
            box = button.bounding_box()
            if box:
                if box['width'] < 44 or box['height'] < 44:
                    issues.append({
                        'type': 'small_touch_target',
                        'element': 'button',
                        'size': f"{box['width']}x{box['height']}",
                        'severity': 'error'
                    })

        # Test 6: Modals have proper ARIA
        modals = page.locator('[role="dialog"]').all()
        for modal in modals:
            aria_modal = modal.get_attribute('aria-modal')
            if aria_modal != 'true':
                issues.append({
                    'type': 'modal_missing_aria',
                    'element': 'dialog',
                    'severity': 'error'
                })

        return {
            'component': component_name,
            'passed': len(issues) == 0,
            'issues': issues,
            'issue_count': len(issues)
        }

    def run_all_tests(self):
        """Test all components"""
        print("\n🏗️  Running structural tests...\n")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={'width': 1400, 'height': 1200})

            for component in COMPONENT_PAGES:
                print(f"🔍 Testing {component}...")
                result = self.test_component(page, component)
                self.results.append(result)

                if result['passed']:
                    print(f"✅ {component} - PASSED")
                else:
                    print(f"❌ {component} - {result['issue_count']} issues")

            browser.close()

        # Generate report
        self.generate_report()

    def generate_report(self):
        """Generate test report"""
        passed = sum(1 for r in self.results if r['passed'])
        total = len(self.results)

        # Save JSON
        results_path = Path(__file__).parent / 'test-results' / 'results-structure.json'
        results_path.parent.mkdir(exist_ok=True)
        with open(results_path, 'w') as f:
            json.dump(self.results, f, indent=2)

        print(f"\n📊 Structural tests complete!")
        print(f"   Passed: {passed}/{total}")
        print(f"   Results: {results_path}")

        # Exit with error if any tests failed
        if passed < total:
            exit(1)

if __name__ == '__main__':
    tester = StructuralTester()
    tester.run_all_tests()
