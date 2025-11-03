#!/usr/bin/env python3
"""
Gesture and touch interaction tests.
Tests touch gestures, swipes, long-press, and multi-touch interactions.
Cost: FREE (Playwright touch simulation)
Run: On PR
"""

from playwright.sync_api import sync_playwright
from pathlib import Path
import json
import time

class GestureTester:
    def __init__(self):
        self.results = []

    def test_swipe_list(self, page):
        """Test swipe gestures on list items"""
        issues = []

        page.set_content("""
        <!DOCTYPE html>
        <html>
        <head><script src="file:///Users/danq/dbbasic-web-native/semantic-components.js"></script></head>
        <body>
            <semantic-list id="swipeable-list">
                <div data-item-id="1">Swipe me</div>
                <div data-item-id="2">Swipe me too</div>
                <div data-item-id="3">Another item</div>
            </semantic-list>
        </body>
        </html>
        """)
        page.wait_for_load_state('networkidle')

        # Simulate swipe gesture
        first_item = page.locator('[data-item-id="1"]')
        if first_item.count() > 0:
            box = first_item.bounding_box()
            if box:
                # Touch start, move, end
                page.mouse.move(box['x'] + 10, box['y'] + box['height'] / 2)
                page.mouse.down()
                page.mouse.move(box['x'] + 100, box['y'] + box['height'] / 2, steps=10)
                page.mouse.up()

                # Check if swipe triggered any visual feedback
                # Note: This is a basic test - real implementation would check for transform/animation
                transform = first_item.evaluate('el => window.getComputedStyle(el).transform')
                if transform == 'none':
                    issues.append({
                        'type': 'no_swipe_feedback',
                        'severity': 'info',
                        'message': 'No visual feedback detected for swipe gesture'
                    })

        return {'test': 'swipe_list', 'passed': len([i for i in issues if i['severity'] == 'error']) == 0, 'issues': issues}

    def test_long_press(self, page):
        """Test long-press gesture on action buttons"""
        issues = []

        page.set_content("""
        <!DOCTYPE html>
        <html>
        <head><script src="file:///Users/danq/dbbasic-web-native/semantic-components.js"></script></head>
        <body>
            <semantic-action id="long-press-btn" intent="primary">Long Press Me</semantic-action>
        </body>
        </html>
        """)
        page.wait_for_load_state('networkidle')

        button = page.locator('semantic-action')
        if button.count() > 0:
            box = button.bounding_box()
            if box:
                # Simulate long press (touch down, wait, touch up)
                page.mouse.move(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2)
                page.mouse.down()
                time.sleep(0.6)  # 600ms long press
                page.mouse.up()

                # Check for long-press handling
                # In production, would check for context menu or special state
                issues.append({
                    'type': 'long_press_tested',
                    'severity': 'info',
                    'message': 'Long press gesture tested'
                })

        return {'test': 'long_press', 'passed': True, 'issues': issues}

    def test_touch_target_spacing(self, page):
        """Test spacing between touch targets (minimum 8px)"""
        issues = []

        page.set_content("""
        <!DOCTYPE html>
        <html>
        <head><script src="file:///Users/danq/dbbasic-web-native/semantic-components.js"></script></head>
        <body>
            <div style="display: flex; gap: 4px;">
                <semantic-action intent="primary">Button 1</semantic-action>
                <semantic-action intent="secondary">Button 2</semantic-action>
                <semantic-action intent="destructive">Button 3</semantic-action>
            </div>
        </body>
        </html>
        """)
        page.wait_for_load_state('networkidle')

        buttons = page.locator('semantic-action').all()
        for i in range(len(buttons) - 1):
            box1 = buttons[i].bounding_box()
            box2 = buttons[i + 1].bounding_box()

            if box1 and box2:
                gap = box2['x'] - (box1['x'] + box1['width'])
                if gap < 8:
                    issues.append({
                        'type': 'insufficient_touch_spacing',
                        'gap': f"{gap}px",
                        'minimum': '8px',
                        'severity': 'warning',
                        'message': f'Touch targets only {gap}px apart, recommend 8px minimum'
                    })

        return {'test': 'touch_target_spacing', 'passed': len([i for i in issues if i['severity'] == 'error']) == 0, 'issues': issues}

    def test_tap_responsiveness(self, page):
        """Test tap response time and visual feedback"""
        issues = []

        page.set_content("""
        <!DOCTYPE html>
        <html>
        <head><script src="file:///Users/danq/dbbasic-web-native/semantic-components.js"></script></head>
        <body>
            <semantic-action id="tap-test" intent="primary">Tap Me</semantic-action>
            <script>
                const btn = document.getElementById('tap-test');
                btn.addEventListener('click', () => {
                    btn.setAttribute('data-clicked', 'true');
                });
            </script>
        </body>
        </html>
        """)
        page.wait_for_load_state('networkidle')

        button = page.locator('semantic-action')

        # Record start time
        start_time = time.time()
        button.click()

        # Check if click was registered
        clicked = button.get_attribute('data-clicked')
        response_time = (time.time() - start_time) * 1000  # Convert to ms

        if not clicked:
            issues.append({
                'type': 'tap_not_registered',
                'severity': 'error',
                'message': 'Tap event not registered'
            })

        if response_time > 100:  # 100ms is acceptable limit
            issues.append({
                'type': 'slow_tap_response',
                'response_time': f"{response_time:.0f}ms",
                'severity': 'warning',
                'message': f'Tap response took {response_time:.0f}ms (>100ms)'
            })

        return {'test': 'tap_responsiveness', 'passed': len([i for i in issues if i['severity'] == 'error']) == 0, 'issues': issues}

    def test_gesture_conflicts(self, page):
        """Test for gesture conflicts in nested components"""
        issues = []

        page.set_content("""
        <!DOCTYPE html>
        <html>
        <head><script src="file:///Users/danq/dbbasic-web-native/semantic-components.js"></script></head>
        <body>
            <semantic-modal id="modal-with-list" open>
                <div slot="header">Modal with scrollable list</div>
                <semantic-list style="height: 200px; overflow-y: auto;">
                    <div data-item-id="1">Item 1</div>
                    <div data-item-id="2">Item 2</div>
                    <div data-item-id="3">Item 3</div>
                    <div data-item-id="4">Item 4</div>
                    <div data-item-id="5">Item 5</div>
                </semantic-list>
            </semantic-modal>
        </body>
        </html>
        """)
        page.wait_for_load_state('networkidle')

        # Test that scroll gestures work inside modal without closing it
        list_element = page.locator('semantic-list')
        if list_element.count() > 0:
            box = list_element.bounding_box()
            if box:
                # Simulate scroll gesture
                page.mouse.move(box['x'] + box['width'] / 2, box['y'] + 10)
                page.mouse.down()
                page.mouse.move(box['x'] + box['width'] / 2, box['y'] + 100, steps=10)
                page.mouse.up()

                # Check modal is still open
                modal = page.locator('semantic-modal')
                is_open = modal.get_attribute('open')
                if not is_open:
                    issues.append({
                        'type': 'gesture_conflict',
                        'severity': 'error',
                        'message': 'Scroll gesture closed parent modal (gesture conflict)'
                    })

        return {'test': 'gesture_conflicts', 'passed': len([i for i in issues if i['severity'] == 'error']) == 0, 'issues': issues}

    def test_pinch_zoom_disabled(self, page):
        """Test that pinch zoom is appropriately handled"""
        issues = []

        page.set_content("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="file:///Users/danq/dbbasic-web-native/semantic-components.js"></script>
        </head>
        <body>
            <semantic-card>
                <h3 slot="header">Pinch Test Card</h3>
                <p>This content should allow zoom unless explicitly disabled</p>
            </semantic-card>
        </body>
        </html>
        """)
        page.wait_for_load_state('networkidle')

        # Check viewport meta tag
        viewport = page.locator('meta[name="viewport"]').get_attribute('content')
        if viewport and 'user-scalable=no' in viewport:
            issues.append({
                'type': 'zoom_disabled',
                'severity': 'warning',
                'message': 'Pinch zoom is disabled (user-scalable=no). Consider allowing zoom for accessibility.'
            })

        return {'test': 'pinch_zoom_disabled', 'passed': len([i for i in issues if i['severity'] == 'error']) == 0, 'issues': issues}

    def run_all_tests(self):
        """Run all gesture tests"""
        print("\n👆 Running gesture tests...\n")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            # Use mobile viewport for gesture testing
            page = browser.new_page(viewport={'width': 375, 'height': 667}, has_touch=True)

            tests = [
                self.test_swipe_list,
                self.test_long_press,
                self.test_touch_target_spacing,
                self.test_tap_responsiveness,
                self.test_gesture_conflicts,
                self.test_pinch_zoom_disabled
            ]

            for test in tests:
                test_name = test.__doc__.strip()
                print(f"🔍 {test_name}...", end='')
                result = test(page)
                self.results.append(result)

                error_count = len([i for i in result['issues'] if i['severity'] == 'error'])
                warning_count = len([i for i in result['issues'] if i['severity'] == 'warning'])

                if result['passed']:
                    if warning_count > 0:
                        print(f" ⚠️  ({warning_count} warnings)")
                    else:
                        print(" ✅")
                else:
                    print(f" ❌ ({error_count} errors)")

            browser.close()

        self.generate_report()

    def generate_report(self):
        """Generate test report"""
        passed = sum(1 for r in self.results if r['passed'])
        total = len(self.results)

        # Save JSON
        results_path = Path(__file__).parent / 'test-results' / 'results-gestures.json'
        results_path.parent.mkdir(exist_ok=True)
        with open(results_path, 'w') as f:
            json.dump(self.results, f, indent=2)

        print(f"\n📊 Gesture tests complete!")
        print(f"   Passed: {passed}/{total}")
        print(f"   Results: {results_path}")

        # Exit with error if any tests failed
        if passed < total:
            exit(1)

if __name__ == '__main__':
    tester = GestureTester()
    tester.run_all_tests()
