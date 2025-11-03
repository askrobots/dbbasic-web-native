#!/usr/bin/env python3
"""
Attention budget tests.
Tests cognitive load, visual complexity, and attention score adaptation.
Cost: FREE (Computed metrics from DOM/screenshots)
Run: On PR
"""

from playwright.sync_api import sync_playwright
from pathlib import Path
import json
import math

class AttentionTester:
    def __init__(self):
        self.results = []

    def calculate_visual_complexity(self, page):
        """Calculate visual complexity score"""
        metrics = page.evaluate("""() => {
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_ELEMENT,
                null
            );

            let elementCount = 0;
            let colorCount = new Set();
            let fontCount = new Set();
            let animatingElements = 0;

            while (walker.nextNode()) {
                const el = walker.currentNode;
                const style = window.getComputedStyle(el);

                elementCount++;
                colorCount.add(style.color);
                colorCount.add(style.backgroundColor);
                fontCount.add(style.fontFamily);

                // Check for animations
                if (style.animation !== 'none' || style.transition !== 'none') {
                    animatingElements++;
                }
            }

            return {
                elementCount,
                colorCount: colorCount.size,
                fontCount: fontCount.size,
                animatingElements
            };
        }""")

        # Calculate complexity score (0-100)
        # More elements, colors, fonts = higher complexity
        element_score = min((metrics['elementCount'] / 50) * 30, 30)  # Max 30 points
        color_score = min((metrics['colorCount'] / 10) * 30, 30)  # Max 30 points
        font_score = min((metrics['fontCount'] / 5) * 20, 20)  # Max 20 points
        animation_score = min((metrics['animatingElements'] / 5) * 20, 20)  # Max 20 points

        complexity = element_score + color_score + font_score + animation_score

        return {
            'complexity_score': round(complexity, 1),
            'metrics': metrics
        }

    def test_component_attention_budget(self, page, component_name):
        """Test if component stays within attention budget"""
        issues = []

        # Load component page
        file_path = Path(__file__).parent / 'docs' / component_name
        page.goto(f'file://{file_path}')
        page.wait_for_load_state('networkidle')

        # Calculate visual complexity
        complexity = self.calculate_visual_complexity(page)

        # Thresholds:
        # 0-30: Low complexity (good)
        # 31-60: Medium complexity (acceptable)
        # 61-100: High complexity (warning)
        severity = 'info'
        if complexity['complexity_score'] > 60:
            severity = 'warning'
            issues.append({
                'type': 'high_visual_complexity',
                'score': complexity['complexity_score'],
                'severity': severity,
                'message': f"Visual complexity {complexity['complexity_score']}/100 exceeds recommended threshold"
            })
        elif complexity['complexity_score'] > 30:
            severity = 'info'
            issues.append({
                'type': 'medium_visual_complexity',
                'score': complexity['complexity_score'],
                'severity': severity,
                'message': f"Visual complexity {complexity['complexity_score']}/100 is acceptable"
            })

        return {
            'component': component_name,
            'passed': len([i for i in issues if i['severity'] in ['error', 'warning']]) == 0,
            'complexity': complexity,
            'issues': issues
        }

    def test_interactive_element_count(self, page, component_name):
        """Test number of interactive elements (attention budget)"""
        issues = []

        file_path = Path(__file__).parent / 'docs' / component_name
        page.goto(f'file://{file_path}')
        page.wait_for_load_state('networkidle')

        # Count interactive elements
        interactive_count = page.locator('button, a[href], input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])').count()

        # Thresholds based on Miller's Law (7±2 items)
        # 0-9 items: Good (within working memory)
        # 10-15 items: Warning (approaching cognitive overload)
        # 16+ items: Error (too many choices)

        if interactive_count > 15:
            issues.append({
                'type': 'too_many_interactive_elements',
                'count': interactive_count,
                'recommended': '≤9',
                'severity': 'error',
                'message': f"{interactive_count} interactive elements exceeds cognitive load limit (Miller's Law: 7±2)"
            })
        elif interactive_count > 9:
            issues.append({
                'type': 'high_interactive_count',
                'count': interactive_count,
                'recommended': '≤9',
                'severity': 'warning',
                'message': f"{interactive_count} interactive elements approaches cognitive overload"
            })

        return {
            'component': component_name,
            'passed': len([i for i in issues if i['severity'] == 'error']) == 0,
            'interactive_count': interactive_count,
            'issues': issues
        }

    def test_animation_attention_cost(self, page, component_name):
        """Test that animations don't consume too much attention"""
        issues = []

        file_path = Path(__file__).parent / 'docs' / component_name
        page.goto(f'file://{file_path}')
        page.wait_for_load_state('networkidle')

        # Check for animations
        animations = page.evaluate("""() => {
            const elements = document.querySelectorAll('*');
            let autoplayAnimations = 0;
            let longAnimations = 0;
            let infiniteAnimations = 0;

            elements.forEach(el => {
                const style = window.getComputedStyle(el);
                const animations = style.animation;

                if (animations && animations !== 'none') {
                    // Check for autoplay (not triggered by hover/focus)
                    if (!el.matches(':hover') && !el.matches(':focus')) {
                        autoplayAnimations++;
                    }

                    // Parse animation duration
                    const durationMatch = animations.match(/([\\d.]+)s/);
                    if (durationMatch && parseFloat(durationMatch[1]) > 3) {
                        longAnimations++;
                    }

                    // Check for infinite animations
                    if (animations.includes('infinite')) {
                        infiniteAnimations++;
                    }
                }
            });

            return { autoplayAnimations, longAnimations, infiniteAnimations };
        }""")

        if animations['autoplayAnimations'] > 3:
            issues.append({
                'type': 'too_many_autoplay_animations',
                'count': animations['autoplayAnimations'],
                'severity': 'warning',
                'message': f"{animations['autoplayAnimations']} autoplay animations consume attention budget"
            })

        if animations['infiniteAnimations'] > 0:
            issues.append({
                'type': 'infinite_animations',
                'count': animations['infiniteAnimations'],
                'severity': 'warning',
                'message': 'Infinite animations continuously consume attention'
            })

        return {
            'component': component_name,
            'passed': len([i for i in issues if i['severity'] == 'error']) == 0,
            'animations': animations,
            'issues': issues
        }

    def test_color_palette_size(self, page, component_name):
        """Test that color palette is constrained"""
        issues = []

        file_path = Path(__file__).parent / 'docs' / component_name
        page.goto(f'file://{file_path}')
        page.wait_for_load_state('networkidle')

        # Count unique colors
        colors = page.evaluate("""() => {
            const elements = document.querySelectorAll('*');
            const colors = new Set();

            elements.forEach(el => {
                const style = window.getComputedStyle(el);
                colors.add(style.color);
                colors.add(style.backgroundColor);
                colors.add(style.borderColor);
            });

            // Remove transparent/none
            colors.delete('rgba(0, 0, 0, 0)');
            colors.delete('transparent');
            colors.delete('none');

            return colors.size;
        }""")

        # Threshold: More than 12 unique colors indicates poor color system
        if colors > 12:
            issues.append({
                'type': 'too_many_colors',
                'count': colors,
                'recommended': '≤12',
                'severity': 'warning',
                'message': f"{colors} unique colors exceeds recommended palette size"
            })

        return {
            'component': component_name,
            'passed': len([i for i in issues if i['severity'] == 'error']) == 0,
            'color_count': colors,
            'issues': issues
        }

    def test_focus_trap_attention(self, page, component_name):
        """Test that focus trapping doesn't consume excessive attention"""
        issues = []

        file_path = Path(__file__).parent / 'docs' / component_name
        page.goto(f'file://{file_path}')
        page.wait_for_load_state('networkidle')

        # Check for modal/dialog components that should trap focus
        has_modal = page.locator('semantic-modal, [role="dialog"]').count() > 0

        if has_modal:
            # Test focus trap cycle length
            focusable = page.locator('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])').all()
            focusable_count = len(focusable)

            # If modal has more than 15 focusable elements, focus cycling becomes cognitive burden
            if focusable_count > 15:
                issues.append({
                    'type': 'long_focus_trap',
                    'count': focusable_count,
                    'severity': 'warning',
                    'message': f"Focus trap contains {focusable_count} elements, making keyboard navigation difficult"
                })

        return {
            'component': component_name,
            'passed': len([i for i in issues if i['severity'] == 'error']) == 0,
            'issues': issues
        }

    def run_all_tests(self):
        """Run all attention budget tests"""
        print("\n🧠 Running attention budget tests...\n")

        components = [
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

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={'width': 1400, 'height': 1200})

            for component in components:
                print(f"\n📋 Testing {component}:")

                # Run all attention tests for this component
                tests = [
                    ('Visual Complexity', lambda: self.test_component_attention_budget(page, component)),
                    ('Interactive Elements', lambda: self.test_interactive_element_count(page, component)),
                    ('Animation Cost', lambda: self.test_animation_attention_cost(page, component)),
                    ('Color Palette', lambda: self.test_color_palette_size(page, component)),
                    ('Focus Trap', lambda: self.test_focus_trap_attention(page, component))
                ]

                for test_name, test_func in tests:
                    print(f"  🔍 {test_name}...", end='')
                    result = test_func()
                    self.results.append({
                        'test': test_name,
                        'component': component,
                        'passed': result['passed'],
                        'issues': result.get('issues', [])
                    })

                    error_count = len([i for i in result.get('issues', []) if i['severity'] == 'error'])
                    warning_count = len([i for i in result.get('issues', []) if i['severity'] == 'warning'])

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
        results_path = Path(__file__).parent / 'test-results' / 'results-attention.json'
        results_path.parent.mkdir(exist_ok=True)
        with open(results_path, 'w') as f:
            json.dump(self.results, f, indent=2)

        print(f"\n📊 Attention budget tests complete!")
        print(f"   Passed: {passed}/{total}")
        print(f"   Results: {results_path}")

        # Exit with error if any tests failed
        if passed < total:
            exit(1)

if __name__ == '__main__':
    tester = AttentionTester()
    tester.run_all_tests()
