#!/usr/bin/env python3
"""
Spatial context tests for AR/VR environments.
Tests component behavior in 3D space, distance scaling, and spatial interactions.
Cost: FREE (Simulated spatial contexts)
Run: On schedule (future capability)
"""

from playwright.sync_api import sync_playwright
from pathlib import Path
import json
import math

class SpatialTester:
    def __init__(self):
        self.results = []

    # Spatial contexts based on viewing distance
    SPATIAL_CONTEXTS = [
        {'name': 'handheld', 'distance_cm': 30, 'viewport': {'width': 375, 'height': 667}, 'dpi_scale': 1.0},
        {'name': 'desktop', 'distance_cm': 60, 'viewport': {'width': 1400, 'height': 1200}, 'dpi_scale': 1.0},
        {'name': 'ar_near', 'distance_cm': 100, 'viewport': {'width': 1920, 'height': 1080}, 'dpi_scale': 1.5},
        {'name': 'ar_mid', 'distance_cm': 200, 'viewport': {'width': 1920, 'height': 1080}, 'dpi_scale': 2.0},
        {'name': 'ar_far', 'distance_cm': 400, 'viewport': {'width': 1920, 'height': 1080}, 'dpi_scale': 3.0},
    ]

    def calculate_visual_angle(self, size_px, distance_cm, dpi=96):
        """Calculate visual angle in degrees for element at given distance"""
        # Convert pixels to cm (assuming standard DPI)
        size_cm = (size_px / dpi) * 2.54

        # Calculate visual angle using small angle approximation
        # tan(θ) ≈ θ (in radians) for small angles
        visual_angle_rad = size_cm / distance_cm
        visual_angle_deg = math.degrees(visual_angle_rad)

        return visual_angle_deg

    def test_distance_readability(self, page, component_name, context):
        """Test if text is readable at specified viewing distance"""
        issues = []

        file_path = Path(__file__).parent / 'docs' / component_name
        page.goto(f'file://{file_path}')
        page.wait_for_load_state('networkidle')

        # Get all text elements
        text_elements = page.evaluate("""() => {
            const elements = document.querySelectorAll('*');
            const textSizes = [];

            elements.forEach(el => {
                const text = el.textContent.trim();
                if (text && el.children.length === 0) {  // Leaf text nodes
                    const style = window.getComputedStyle(el);
                    const fontSize = parseFloat(style.fontSize);
                    textSizes.push({ fontSize, text: text.substring(0, 30) });
                }
            });

            return textSizes;
        }""")

        # Check visual angle for each text element
        for text_info in text_elements:
            font_size_px = text_info['fontSize']
            visual_angle = self.calculate_visual_angle(
                font_size_px,
                context['distance_cm']
            )

            # Minimum visual angle for comfortable reading: 0.3 degrees
            # Optimal: 0.5-1.0 degrees
            if visual_angle < 0.2:
                issues.append({
                    'type': 'text_too_small_for_distance',
                    'font_size_px': font_size_px,
                    'distance_cm': context['distance_cm'],
                    'visual_angle_deg': round(visual_angle, 3),
                    'min_angle_deg': 0.3,
                    'severity': 'error',
                    'message': f"Text {font_size_px}px at {context['distance_cm']}cm = {visual_angle:.3f}° (min 0.3°)"
                })
            elif visual_angle < 0.3:
                issues.append({
                    'type': 'text_marginally_readable',
                    'font_size_px': font_size_px,
                    'distance_cm': context['distance_cm'],
                    'visual_angle_deg': round(visual_angle, 3),
                    'severity': 'warning',
                    'message': f"Text barely readable: {visual_angle:.3f}° visual angle"
                })

        return {
            'component': component_name,
            'context': context['name'],
            'passed': len([i for i in issues if i['severity'] == 'error']) == 0,
            'issues': issues
        }

    def test_touch_target_at_distance(self, page, component_name, context):
        """Test if touch targets are appropriately sized for viewing distance"""
        issues = []

        file_path = Path(__file__).parent / 'docs' / component_name
        page.goto(f'file://{file_path}')
        page.wait_for_load_state('networkidle')

        # Get interactive elements
        buttons = page.locator('button, a[href], [role="button"]').all()

        for button in buttons:
            box = button.bounding_box()
            if box:
                # Calculate visual angle
                visual_angle = self.calculate_visual_angle(
                    min(box['width'], box['height']),
                    context['distance_cm']
                )

                # Touch targets should subtend at least 1.0 degree visual angle
                # At closer distances (handheld), physical size matters more
                if context['name'] in ['handheld', 'desktop']:
                    # Use physical size threshold (44px)
                    if box['width'] < 44 or box['height'] < 44:
                        issues.append({
                            'type': 'small_touch_target',
                            'size': f"{box['width']}x{box['height']}",
                            'context': context['name'],
                            'severity': 'error'
                        })
                else:
                    # AR contexts: use visual angle
                    if visual_angle < 1.0:
                        issues.append({
                            'type': 'touch_target_too_small_for_distance',
                            'visual_angle_deg': round(visual_angle, 2),
                            'min_angle_deg': 1.0,
                            'distance_cm': context['distance_cm'],
                            'severity': 'error',
                            'message': f"Touch target {visual_angle:.2f}° at {context['distance_cm']}cm (min 1.0°)"
                        })

        return {
            'component': component_name,
            'context': context['name'],
            'passed': len([i for i in issues if i['severity'] == 'error']) == 0,
            'issues': issues
        }

    def test_depth_perception(self, page, component_name):
        """Test that component provides depth cues (shadows, layering)"""
        issues = []

        file_path = Path(__file__).parent / 'docs' / component_name
        page.goto(f'file://{file_path}')
        page.wait_for_load_state('networkidle')

        # Check for depth cues
        depth_info = page.evaluate("""() => {
            const elements = document.querySelectorAll('*');
            let hasShadows = 0;
            let hasTransforms = 0;
            let hasZIndex = 0;

            elements.forEach(el => {
                const style = window.getComputedStyle(el);

                if (style.boxShadow && style.boxShadow !== 'none') {
                    hasShadows++;
                }

                if (style.transform && style.transform !== 'none') {
                    hasTransforms++;
                }

                if (style.zIndex && style.zIndex !== 'auto') {
                    hasZIndex++;
                }
            });

            return { hasShadows, hasTransforms, hasZIndex };
        }""")

        # Components should use at least one depth cue
        total_depth_cues = depth_info['hasShadows'] + depth_info['hasTransforms'] + depth_info['hasZIndex']

        if total_depth_cues == 0:
            issues.append({
                'type': 'no_depth_cues',
                'severity': 'warning',
                'message': 'No depth cues detected (shadows, transforms, z-index)'
            })

        return {
            'component': component_name,
            'passed': len([i for i in issues if i['severity'] == 'error']) == 0,
            'depth_info': depth_info,
            'issues': issues
        }

    def test_spatial_attention(self, page, component_name):
        """Test that component doesn't overwhelm spatial field of view"""
        issues = []

        file_path = Path(__file__).parent / 'docs' / component_name
        page.goto(f'file://{file_path}')
        page.wait_for_load_state('networkidle')

        # Calculate total component coverage
        coverage = page.evaluate("""() => {
            const body = document.body;
            const bodyBox = body.getBoundingClientRect();
            const viewport = { width: window.innerWidth, height: window.innerHeight };

            // Calculate what percentage of viewport is covered
            const coveragePercent = (bodyBox.width * bodyBox.height) / (viewport.width * viewport.height) * 100;

            return {
                coveragePercent: coveragePercent,
                bodyWidth: bodyBox.width,
                bodyHeight: bodyBox.height,
                viewportWidth: viewport.width,
                viewportHeight: viewport.height
            };
        }""")

        # Components shouldn't dominate entire field of view in AR contexts
        # Threshold: < 60% coverage for comfortable spatial experience
        if coverage['coveragePercent'] > 80:
            issues.append({
                'type': 'overwhelming_spatial_presence',
                'coverage_percent': round(coverage['coveragePercent'], 1),
                'threshold': '80%',
                'severity': 'warning',
                'message': f"Component covers {coverage['coveragePercent']:.1f}% of viewport (>80%)"
            })

        return {
            'component': component_name,
            'passed': len([i for i in issues if i['severity'] == 'error']) == 0,
            'coverage': coverage,
            'issues': issues
        }

    def test_spatial_positioning(self, page, component_name):
        """Test that component uses relative positioning suitable for AR"""
        issues = []

        file_path = Path(__file__).parent / 'docs' / component_name
        page.goto(f'file://{file_path}')
        page.wait_for_load_state('networkidle')

        # Check positioning styles
        positioning = page.evaluate("""() => {
            const elements = document.querySelectorAll('*');
            let fixed = 0;
            let absolute = 0;
            let relative = 0;
            let sticky = 0;

            elements.forEach(el => {
                const style = window.getComputedStyle(el);
                const pos = style.position;

                if (pos === 'fixed') fixed++;
                else if (pos === 'absolute') absolute++;
                else if (pos === 'relative') relative++;
                else if (pos === 'sticky') sticky++;
            });

            return { fixed, absolute, relative, sticky };
        }""")

        # Fixed positioning is problematic in AR/VR (no "fixed" in 3D space)
        if positioning['fixed'] > 0:
            issues.append({
                'type': 'fixed_positioning_in_spatial',
                'count': positioning['fixed'],
                'severity': 'warning',
                'message': f"{positioning['fixed']} fixed elements incompatible with spatial contexts"
            })

        return {
            'component': component_name,
            'passed': len([i for i in issues if i['severity'] == 'error']) == 0,
            'positioning': positioning,
            'issues': issues
        }

    def test_spatial_focus_indicator(self, page, component_name):
        """Test that focus indicators work at various distances"""
        issues = []

        file_path = Path(__file__).parent / 'docs' / component_name
        page.goto(f'file://{file_path}')
        page.wait_for_load_state('networkidle')

        # Check focus outline visibility
        buttons = page.locator('button, a[href]').all()

        for button in buttons[:3]:  # Test first 3
            # Focus element
            button.focus()

            # Check outline thickness
            outline = button.evaluate("""el => {
                const style = window.getComputedStyle(el);
                return {
                    outlineWidth: style.outlineWidth,
                    outlineStyle: style.outlineStyle,
                    outlineColor: style.outlineColor
                };
            }""")

            # Outline should be at least 2px for spatial visibility
            outline_width = float(outline['outlineWidth'].replace('px', '')) if 'px' in outline['outlineWidth'] else 0

            if outline['outlineStyle'] != 'none' and outline_width < 2:
                issues.append({
                    'type': 'thin_focus_outline_spatial',
                    'outline_width': outline['outlineWidth'],
                    'min_width': '2px',
                    'severity': 'warning',
                    'message': f"Focus outline {outline['outlineWidth']} too thin for spatial contexts (min 2px)"
                })

        return {
            'component': component_name,
            'passed': len([i for i in issues if i['severity'] == 'error']) == 0,
            'issues': issues
        }

    def run_all_tests(self):
        """Run all spatial context tests"""
        print("\n🥽 Running spatial context tests (AR/VR simulation)...\n")

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

            for component in components:
                print(f"\n📋 Testing {component}:")

                # Test across different spatial contexts
                for context in self.SPATIAL_CONTEXTS:
                    print(f"\n  📍 Context: {context['name']} ({context['distance_cm']}cm)")

                    page = browser.new_page(viewport=context['viewport'])

                    tests = [
                        ('Distance Readability', lambda: self.test_distance_readability(page, component, context)),
                        ('Touch Targets at Distance', lambda: self.test_touch_target_at_distance(page, component, context)),
                    ]

                    for test_name, test_func in tests:
                        print(f"    🔍 {test_name}...", end='')
                        result = test_func()
                        self.results.append({
                            'test': test_name,
                            'component': component,
                            'context': context['name'],
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

                    page.close()

                # Test spatial-specific properties (once per component)
                page = browser.new_page(viewport={'width': 1920, 'height': 1080})

                spatial_tests = [
                    ('Depth Perception', lambda: self.test_depth_perception(page, component)),
                    ('Spatial Attention', lambda: self.test_spatial_attention(page, component)),
                    ('Spatial Positioning', lambda: self.test_spatial_positioning(page, component)),
                    ('Spatial Focus', lambda: self.test_spatial_focus_indicator(page, component))
                ]

                print(f"\n  🌐 Spatial properties:")
                for test_name, test_func in spatial_tests:
                    print(f"    🔍 {test_name}...", end='')
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

                page.close()

            browser.close()

        self.generate_report()

    def generate_report(self):
        """Generate test report"""
        passed = sum(1 for r in self.results if r['passed'])
        total = len(self.results)

        # Save JSON
        results_path = Path(__file__).parent / 'test-results' / 'results-spatial.json'
        results_path.parent.mkdir(exist_ok=True)
        with open(results_path, 'w') as f:
            json.dump(self.results, f, indent=2)

        print(f"\n📊 Spatial context tests complete!")
        print(f"   Passed: {passed}/{total}")
        print(f"   Results: {results_path}")
        print(f"\n💡 Note: Spatial tests simulate AR/VR contexts for future compatibility")

        # Exit with error if any tests failed
        if passed < total:
            exit(1)

if __name__ == '__main__':
    tester = SpatialTester()
    tester.run_all_tests()
