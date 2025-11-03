#!/usr/bin/env python3
"""
Single-component AI vision testing.
Cost-efficient way to test only changed components.
Cost: ~$0.06 per component (3 tests × $0.02)
Run: On changed files in PR
"""

import sys
from test_visual_ai import VisualAIAnalyzer
import os

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 test_visual_single.py <component-name>")
        print("\nExamples:")
        print("  python3 test_visual_single.py semantic-modal")
        print("  python3 test_visual_single.py semantic-action")
        print("\nAvailable components:")
        print("  - semantic-action")
        print("  - semantic-card")
        print("  - semantic-input")
        print("  - semantic-modal")
        print("  - semantic-navigator")
        print("  - semantic-list")
        print("  - semantic-menu")
        print("  - semantic-feedback")
        print("  - semantic-adjuster")
        sys.exit(1)

    component = sys.argv[1]
    if not component.endswith('.html'):
        component = f"{component}.html"

    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        print("❌ ANTHROPIC_API_KEY environment variable not set")
        sys.exit(1)

    analyzer = VisualAIAnalyzer(api_key)

    # Filter to only test this component
    analyzer.COMPONENT_PAGES = [component]

    print(f"\n🔍 Testing single component: {component}")
    print(f"   Cost: ~$0.06 (3 AI vision tests)\n")

    analyzer.run_all_tests()

if __name__ == '__main__':
    main()
