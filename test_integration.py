#!/usr/bin/env python3
"""
Integration tests for component composition.
Tests how components work together in real-world scenarios.
Cost: FREE (Playwright functional testing)
Run: On PR
"""

from playwright.sync_api import sync_playwright
from pathlib import Path
import json

class IntegrationTester:
    def __init__(self):
        self.results = []

    def test_modal_with_actions(self, page):
        """Test modal containing action buttons"""
        issues = []

        # Create test page
        page.set_content("""
        <!DOCTYPE html>
        <html>
        <head><script src="file:///Users/danq/dbbasic-web-native/semantic-components.js"></script></head>
        <body>
            <semantic-modal id="test-modal" open>
                <div slot="header">Confirm Delete</div>
                <div>Are you sure?</div>
                <div slot="actions">
                    <semantic-action intent="destructive">Delete</semantic-action>
                    <semantic-action intent="secondary">Cancel</semantic-action>
                </div>
            </semantic-modal>
        </body>
        </html>
        """)
        page.wait_for_load_state('networkidle')

        # Check modal is visible
        modal = page.locator('semantic-modal')
        if not modal.is_visible():
            issues.append({'type': 'modal_not_visible', 'severity': 'error'})

        # Check action buttons rendered in shadow DOM
        buttons = page.locator('semantic-action').count()
        if buttons != 2:
            issues.append({
                'type': 'buttons_not_rendered',
                'expected': 2,
                'actual': buttons,
                'severity': 'error'
            })

        return {'test': 'modal_with_actions', 'passed': len(issues) == 0, 'issues': issues}

    def test_card_with_actions(self, page):
        """Test card containing action buttons"""
        issues = []

        page.set_content("""
        <!DOCTYPE html>
        <html>
        <head><script src="file:///Users/danq/dbbasic-web-native/semantic-components.js"></script></head>
        <body>
            <semantic-card>
                <h3 slot="header">Project Alpha</h3>
                <p>Description of the project</p>
                <div slot="actions">
                    <semantic-action intent="primary">Open</semantic-action>
                    <semantic-action intent="secondary">Edit</semantic-action>
                </div>
            </semantic-card>
        </body>
        </html>
        """)
        page.wait_for_load_state('networkidle')

        # Check card is visible
        card = page.locator('semantic-card')
        if not card.is_visible():
            issues.append({'type': 'card_not_visible', 'severity': 'error'})

        # Check actions slot
        buttons = page.locator('semantic-action').count()
        if buttons != 2:
            issues.append({
                'type': 'action_buttons_missing',
                'expected': 2,
                'actual': buttons,
                'severity': 'error'
            })

        return {'test': 'card_with_actions', 'passed': len(issues) == 0, 'issues': issues}

    def test_list_with_navigation(self, page):
        """Test list items that navigate"""
        issues = []

        page.set_content("""
        <!DOCTYPE html>
        <html>
        <head><script src="file:///Users/danq/dbbasic-web-native/semantic-components.js"></script></head>
        <body>
            <semantic-list selectable>
                <div data-item-id="1">First Item</div>
                <div data-item-id="2">Second Item</div>
                <div data-item-id="3">Third Item</div>
            </semantic-list>
        </body>
        </html>
        """)
        page.wait_for_load_state('networkidle')

        # Check items are visible
        items = page.locator('[data-item-id]').count()
        if items != 3:
            issues.append({
                'type': 'list_items_missing',
                'expected': 3,
                'actual': items,
                'severity': 'error'
            })

        # Check items are clickable (have proper cursor)
        first_item = page.locator('[data-item-id="1"]')
        if first_item.count() > 0:
            cursor = first_item.evaluate('el => window.getComputedStyle(el).cursor')
            if cursor != 'pointer':
                issues.append({
                    'type': 'list_item_not_clickable',
                    'cursor': cursor,
                    'severity': 'warning'
                })

        return {'test': 'list_with_navigation', 'passed': len(issues) == 0, 'issues': issues}

    def test_form_with_inputs(self, page):
        """Test form composed of multiple inputs"""
        issues = []

        page.set_content("""
        <!DOCTYPE html>
        <html>
        <head><script src="file:///Users/danq/dbbasic-web-native/semantic-components.js"></script></head>
        <body>
            <form id="test-form">
                <semantic-input label="Name" placeholder="Enter name"></semantic-input>
                <semantic-input label="Email" type="email"></semantic-input>
                <semantic-action intent="primary">Submit</semantic-action>
            </form>
        </body>
        </html>
        """)
        page.wait_for_load_state('networkidle')

        # Check inputs rendered
        inputs = page.locator('semantic-input').count()
        if inputs != 2:
            issues.append({
                'type': 'inputs_missing',
                'expected': 2,
                'actual': inputs,
                'severity': 'error'
            })

        # Check submit button
        submit = page.locator('semantic-action').count()
        if submit != 1:
            issues.append({
                'type': 'submit_button_missing',
                'severity': 'error'
            })

        return {'test': 'form_with_inputs', 'passed': len(issues) == 0, 'issues': issues}

    def test_nested_navigation(self, page):
        """Test navigator with nested menu"""
        issues = []

        page.set_content("""
        <!DOCTYPE html>
        <html>
        <head><script src="file:///Users/danq/dbbasic-web-native/semantic-components.js"></script></head>
        <body>
            <semantic-navigator type="tabs">
                <div data-nav-id="home">Home</div>
                <div data-nav-id="settings">Settings</div>
            </semantic-navigator>
        </body>
        </html>
        """)
        page.wait_for_load_state('networkidle')

        # Check nav items
        nav_items = page.locator('[data-nav-id]').count()
        if nav_items != 2:
            issues.append({
                'type': 'nav_items_missing',
                'expected': 2,
                'actual': nav_items,
                'severity': 'error'
            })

        return {'test': 'nested_navigation', 'passed': len(issues) == 0, 'issues': issues}

    def run_all_tests(self):
        """Run all integration tests"""
        print("\n🔗 Running integration tests...\n")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={'width': 1400, 'height': 1200})

            tests = [
                self.test_modal_with_actions,
                self.test_card_with_actions,
                self.test_list_with_navigation,
                self.test_form_with_inputs,
                self.test_nested_navigation
            ]

            for test in tests:
                test_name = test.__doc__.strip()
                print(f"🔍 {test_name}...", end='')
                result = test(page)
                self.results.append(result)

                if result['passed']:
                    print(" ✅")
                else:
                    print(f" ❌ ({len(result['issues'])} issues)")

            browser.close()

        self.generate_report()

    def generate_report(self):
        """Generate test report"""
        passed = sum(1 for r in self.results if r['passed'])
        total = len(self.results)

        # Save JSON
        results_path = Path(__file__).parent / 'test-results' / 'results-integration.json'
        results_path.parent.mkdir(exist_ok=True)
        with open(results_path, 'w') as f:
            json.dump(self.results, f, indent=2)

        print(f"\n📊 Integration tests complete!")
        print(f"   Passed: {passed}/{total}")
        print(f"   Results: {results_path}")

        # Exit with error if any tests failed
        if passed < total:
            exit(1)

if __name__ == '__main__':
    tester = IntegrationTester()
    tester.run_all_tests()
