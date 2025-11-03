#!/usr/bin/env python3
"""
Performance benchmark tests.
Tests load time, render time, memory usage, and component initialization.
Cost: FREE (Performance metrics from browser)
Run: On PR
"""

from playwright.sync_api import sync_playwright
from pathlib import Path
import json
import time

class PerformanceTester:
    def __init__(self):
        self.results = []

    def test_component_load_time(self, page, component_name):
        """Test component page load time"""
        issues = []

        file_path = Path(__file__).parent / 'docs' / component_name

        # Measure load time
        start_time = time.time()
        page.goto(f'file://{file_path}')
        page.wait_for_load_state('networkidle')
        load_time = (time.time() - start_time) * 1000  # Convert to ms

        # Get performance metrics from browser
        metrics = page.evaluate("""() => {
            const perfData = window.performance.timing;
            const navigation = performance.getEntriesByType('navigation')[0];

            return {
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
                domComplete: perfData.domComplete - perfData.navigationStart,
                loadComplete: perfData.loadEventEnd - perfData.navigationStart,
                // Modern metrics if available
                navigationStart: navigation ? navigation.startTime : 0,
                responseEnd: navigation ? navigation.responseEnd : 0,
                domInteractive: navigation ? navigation.domInteractive : 0
            };
        }""")

        # Thresholds:
        # < 100ms: Excellent
        # 100-300ms: Good
        # 300-500ms: Acceptable
        # > 500ms: Slow

        if load_time > 500:
            issues.append({
                'type': 'slow_load_time',
                'load_time': f"{load_time:.0f}ms",
                'threshold': '500ms',
                'severity': 'error',
                'message': f"Load time {load_time:.0f}ms exceeds 500ms threshold"
            })
        elif load_time > 300:
            issues.append({
                'type': 'acceptable_load_time',
                'load_time': f"{load_time:.0f}ms",
                'severity': 'warning',
                'message': f"Load time {load_time:.0f}ms is acceptable but could be improved"
            })

        return {
            'component': component_name,
            'passed': len([i for i in issues if i['severity'] == 'error']) == 0,
            'load_time_ms': round(load_time, 2),
            'metrics': metrics,
            'issues': issues
        }

    def test_web_component_registration(self, page, component_name):
        """Test how quickly web components are registered and upgraded"""
        issues = []

        file_path = Path(__file__).parent / 'docs' / component_name

        # Inject performance measurement
        page.goto(f'file://{file_path}')

        # Measure time until web components are defined
        registration_time = page.evaluate("""() => {
            const start = performance.now();
            const components = [
                'semantic-action',
                'semantic-card',
                'semantic-input',
                'semantic-modal',
                'semantic-navigator',
                'semantic-list',
                'semantic-menu',
                'semantic-feedback',
                'semantic-adjuster'
            ];

            const promises = components.map(name => customElements.whenDefined(name));
            return Promise.all(promises).then(() => performance.now() - start);
        }""")

        # Web components should be registered quickly
        # < 50ms: Excellent
        # 50-100ms: Good
        # > 100ms: Slow

        if registration_time > 100:
            issues.append({
                'type': 'slow_component_registration',
                'registration_time': f"{registration_time:.1f}ms",
                'threshold': '100ms',
                'severity': 'warning',
                'message': f"Web component registration took {registration_time:.1f}ms"
            })

        return {
            'component': component_name,
            'passed': len([i for i in issues if i['severity'] == 'error']) == 0,
            'registration_time_ms': round(registration_time, 2),
            'issues': issues
        }

    def test_render_performance(self, page, component_name):
        """Test first paint and first contentful paint"""
        issues = []

        file_path = Path(__file__).parent / 'docs' / component_name
        page.goto(f'file://{file_path}')
        page.wait_for_load_state('networkidle')

        # Get paint metrics
        paint_metrics = page.evaluate("""() => {
            const paints = performance.getEntriesByType('paint');
            const result = {};

            paints.forEach(paint => {
                result[paint.name] = paint.startTime;
            });

            return result;
        }""")

        # First Contentful Paint thresholds:
        # < 1000ms: Good
        # 1000-2500ms: Needs improvement
        # > 2500ms: Poor

        fcp = paint_metrics.get('first-contentful-paint', 0)
        if fcp > 2500:
            issues.append({
                'type': 'poor_fcp',
                'fcp': f"{fcp:.0f}ms",
                'threshold': '2500ms',
                'severity': 'error',
                'message': f"First Contentful Paint {fcp:.0f}ms exceeds 2500ms"
            })
        elif fcp > 1000:
            issues.append({
                'type': 'slow_fcp',
                'fcp': f"{fcp:.0f}ms",
                'severity': 'warning',
                'message': f"First Contentful Paint {fcp:.0f}ms could be improved"
            })

        return {
            'component': component_name,
            'passed': len([i for i in issues if i['severity'] == 'error']) == 0,
            'paint_metrics': paint_metrics,
            'issues': issues
        }

    def test_memory_usage(self, page, component_name):
        """Test memory footprint of component"""
        issues = []

        file_path = Path(__file__).parent / 'docs' / component_name
        page.goto(f'file://{file_path}')
        page.wait_for_load_state('networkidle')

        # Get memory info (Chromium-specific)
        memory = page.evaluate("""() => {
            if (performance.memory) {
                return {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                };
            }
            return null;
        }""")

        if memory:
            # Convert to MB
            used_mb = memory['usedJSHeapSize'] / (1024 * 1024)

            # Threshold: Single component page shouldn't use more than 10MB
            if used_mb > 10:
                issues.append({
                    'type': 'high_memory_usage',
                    'used_mb': f"{used_mb:.2f}MB",
                    'threshold': '10MB',
                    'severity': 'warning',
                    'message': f"Memory usage {used_mb:.2f}MB exceeds 10MB for single component"
                })

            return {
                'component': component_name,
                'passed': len([i for i in issues if i['severity'] == 'error']) == 0,
                'memory_mb': round(used_mb, 2),
                'issues': issues
            }
        else:
            return {
                'component': component_name,
                'passed': True,
                'memory_mb': None,
                'issues': [{'type': 'memory_api_unavailable', 'severity': 'info'}]
            }

    def test_dom_complexity(self, page, component_name):
        """Test DOM tree size and depth"""
        issues = []

        file_path = Path(__file__).parent / 'docs' / component_name
        page.goto(f'file://{file_path}')
        page.wait_for_load_state('networkidle')

        dom_metrics = page.evaluate("""() => {
            // Count DOM nodes
            const allElements = document.querySelectorAll('*');
            const nodeCount = allElements.length;

            // Calculate max DOM depth
            function getDepth(element) {
                let depth = 0;
                let current = element;
                while (current.parentElement) {
                    depth++;
                    current = current.parentElement;
                }
                return depth;
            }

            let maxDepth = 0;
            allElements.forEach(el => {
                const depth = getDepth(el);
                if (depth > maxDepth) maxDepth = depth;
            });

            // Count shadow DOM elements
            const componentsWithShadow = Array.from(allElements).filter(
                el => el.shadowRoot
            ).length;

            return {
                nodeCount,
                maxDepth,
                shadowDomCount: componentsWithShadow
            };
        }""")

        # Thresholds:
        # DOM nodes: < 1500 good, 1500-3000 acceptable, > 3000 excessive
        # DOM depth: < 32 good, > 32 problematic

        if dom_metrics['nodeCount'] > 3000:
            issues.append({
                'type': 'excessive_dom_size',
                'node_count': dom_metrics['nodeCount'],
                'threshold': '3000',
                'severity': 'error',
                'message': f"DOM has {dom_metrics['nodeCount']} nodes (>3000 threshold)"
            })
        elif dom_metrics['nodeCount'] > 1500:
            issues.append({
                'type': 'large_dom_size',
                'node_count': dom_metrics['nodeCount'],
                'severity': 'warning',
                'message': f"DOM has {dom_metrics['nodeCount']} nodes (>1500)"
            })

        if dom_metrics['maxDepth'] > 32:
            issues.append({
                'type': 'excessive_dom_depth',
                'max_depth': dom_metrics['maxDepth'],
                'threshold': '32',
                'severity': 'warning',
                'message': f"DOM depth is {dom_metrics['maxDepth']} levels (>32)"
            })

        return {
            'component': component_name,
            'passed': len([i for i in issues if i['severity'] == 'error']) == 0,
            'dom_metrics': dom_metrics,
            'issues': issues
        }

    def test_reflow_performance(self, page, component_name):
        """Test layout reflow performance"""
        issues = []

        file_path = Path(__file__).parent / 'docs' / component_name
        page.goto(f'file://{file_path}')
        page.wait_for_load_state('networkidle')

        # Trigger reflows and measure
        reflow_time = page.evaluate("""() => {
            const start = performance.now();
            const iterations = 100;

            // Force layout reflows
            for (let i = 0; i < iterations; i++) {
                document.body.offsetHeight;  // Force reflow
            }

            return (performance.now() - start) / iterations;
        }""")

        # Each reflow should be < 1ms on average
        if reflow_time > 1:
            issues.append({
                'type': 'slow_reflow',
                'reflow_time': f"{reflow_time:.2f}ms",
                'threshold': '1ms',
                'severity': 'warning',
                'message': f"Layout reflow takes {reflow_time:.2f}ms (>1ms)"
            })

        return {
            'component': component_name,
            'passed': len([i for i in issues if i['severity'] == 'error']) == 0,
            'reflow_time_ms': round(reflow_time, 3),
            'issues': issues
        }

    def run_all_tests(self):
        """Run all performance tests"""
        print("\n⚡ Running performance tests...\n")

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

                tests = [
                    ('Load Time', lambda: self.test_component_load_time(page, component)),
                    ('Component Registration', lambda: self.test_web_component_registration(page, component)),
                    ('Render Performance', lambda: self.test_render_performance(page, component)),
                    ('Memory Usage', lambda: self.test_memory_usage(page, component)),
                    ('DOM Complexity', lambda: self.test_dom_complexity(page, component)),
                    ('Reflow Performance', lambda: self.test_reflow_performance(page, component))
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
        results_path = Path(__file__).parent / 'test-results' / 'results-performance.json'
        results_path.parent.mkdir(exist_ok=True)
        with open(results_path, 'w') as f:
            json.dump(self.results, f, indent=2)

        print(f"\n📊 Performance tests complete!")
        print(f"   Passed: {passed}/{total}")
        print(f"   Results: {results_path}")

        # Exit with error if any tests failed
        if passed < total:
            exit(1)

if __name__ == '__main__':
    tester = PerformanceTester()
    tester.run_all_tests()
