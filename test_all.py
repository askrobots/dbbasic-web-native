#!/usr/bin/env python3
"""
Unified test runner for semantic components.
Runs tests in optimal order: fast → medium → slow (expensive).

Usage:
  python3 test_all.py                    # Run all tests (except spatial)
  python3 test_all.py --fast             # Only tier 1 free tests
  python3 test_all.py --skip-vision      # Skip expensive vision tests
  python3 test_all.py --spatial          # Include AR/VR spatial tests
"""

import subprocess
import sys
import time
from pathlib import Path

class TestRunner:
    def __init__(self, args):
        self.args = args
        self.results = {}

    def run_test(self, name, command, cost_label):
        """Run a test suite and capture results"""
        print(f"\n{'='*60}")
        print(f"🧪 {name} ({cost_label})")
        print(f"{'='*60}\n")

        start_time = time.time()
        result = subprocess.run(command, shell=True)
        elapsed = time.time() - start_time

        self.results[name] = {
            'passed': result.returncode == 0,
            'elapsed': elapsed,
            'cost': cost_label
        }

        return result.returncode == 0

    def run_all(self):
        """Run all test suites in optimal order"""
        all_passed = True

        # Tier 1: Free tests (always run)
        print("\n🏃 TIER 1: FREE TESTS (DOM validation)")
        if not self.run_test(
            "Structural Tests",
            "python3 test_structure.py",
            "FREE"
        ):
            all_passed = False

        if not self.run_test(
            "Integration Tests",
            "python3 test_integration.py",
            "FREE"
        ):
            all_passed = False

        # Tier 2: Cheap tests (if not --fast-only)
        if '--fast' not in sys.argv:
            print("\n🏃 TIER 2: CHEAP TESTS (Text AI + Context)")
            if not self.run_test(
                "Voice Command Tests",
                "python3 test_voice.py",
                "~$0.01"
            ):
                all_passed = False

            if not self.run_test(
                "Context Tests (Mobile/Tablet/Desktop)",
                "python3 test_context.py",
                "FREE"
            ):
                all_passed = False

            if not self.run_test(
                "Gesture Tests",
                "python3 test_gestures.py",
                "FREE"
            ):
                all_passed = False

            if not self.run_test(
                "Attention Budget Tests",
                "python3 test_attention.py",
                "FREE"
            ):
                all_passed = False

            if not self.run_test(
                "Performance Tests",
                "python3 test_performance.py",
                "FREE"
            ):
                all_passed = False

        # Tier 3: Expensive tests (if not --skip-vision)
        if '--skip-vision' not in sys.argv and '--fast' not in sys.argv:
            print("\n🏃 TIER 3: EXPENSIVE TESTS (Vision AI)")
            if not self.run_test(
                "Visual Accessibility Tests",
                "python3 test_visual_ai.py",
                "~$0.50"
            ):
                all_passed = False

        # Tier 4: Future tests (if --spatial flag)
        if '--spatial' in sys.argv:
            print("\n🏃 TIER 4: FUTURE TESTS (AR/VR Spatial)")
            if not self.run_test(
                "Spatial Context Tests (AR/VR)",
                "python3 test_spatial.py",
                "FREE"
            ):
                all_passed = False

        # Print summary
        self.print_summary()

        return all_passed

    def print_summary(self):
        """Print test results summary"""
        print(f"\n{'='*60}")
        print("📊 TEST SUMMARY")
        print(f"{'='*60}\n")

        total_time = sum(r['elapsed'] for r in self.results.values())
        passed = sum(1 for r in self.results.values() if r['passed'])
        total = len(self.results)

        for name, result in self.results.items():
            status = "✅ PASSED" if result['passed'] else "❌ FAILED"
            print(f"{status} - {name} ({result['elapsed']:.1f}s, {result['cost']})")

        print(f"\n{'='*60}")
        print(f"Results: {passed}/{total} test suites passed")
        print(f"Total time: {total_time:.1f}s")
        print(f"{'='*60}\n")

        # Show where to find detailed results
        print("📁 Detailed results:")
        print("   - test-results/results-structure.json")
        print("   - test-results/results-integration.json")
        print("   - test-results/results-voice.json")
        print("   - test-results/results-context.json")
        print("   - test-results/results-gestures.json")
        print("   - test-results/results-attention.json")
        print("   - test-results/results-performance.json")
        print("   - test-results/results-ai.json")
        print("   - test-results/results-spatial.json (with --spatial)")
        print("   - test-results/accessibility-report-ai.html")

if __name__ == '__main__':
    runner = TestRunner(sys.argv)
    success = runner.run_all()
    sys.exit(0 if success else 1)
