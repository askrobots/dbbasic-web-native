#!/usr/bin/env python3
"""
Text-based AI tests for voice command system.
Uses Claude Haiku (cheap) to validate voice hints and commands.
Cost: ~$0.01 per full run
Run: Every commit
"""

from anthropic import Anthropic
from pathlib import Path
import json
import os

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

class VoiceTester:
    def __init__(self, api_key):
        self.client = Anthropic(api_key=api_key)
        self.results = []
        self.docs_dir = Path(__file__).parent / 'docs'

    def test_voice_hints(self, component_name, html_content):
        """Test voice command hints using text AI"""

        prompt = f"""Analyze this HTML for voice command accessibility.

Component: {component_name}

Requirements:
1. Interactive elements should have clear voice commands
2. aria-label attributes should be present for screen readers
3. Voice hints should be actionable (e.g., "Say 'submit' to...")
4. Elements should be uniquely identifiable by voice

Check for:
- Missing aria-label on buttons/inputs
- Unclear or missing voice command hints
- Duplicate voice commands (ambiguous)
- Elements that can't be activated by voice

Respond with JSON:
{{
  "passed": true/false,
  "issues": [
    {{"type": "missing_aria_label", "element": "button text", "severity": "error"}},
    {{"type": "unclear_voice_hint", "element": "...", "severity": "warning"}}
  ]
}}

HTML:
{html_content[:5000]}
"""

        response = self.client.messages.create(
            model="claude-haiku-3-5-20241022",  # Cheapest model
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )

        try:
            result = json.loads(response.content[0].text)
            return result
        except:
            return {
                "passed": False,
                "issues": [{"type": "parse_error", "element": "response", "severity": "error"}]
            }

    def run_all_tests(self):
        """Test all components"""
        print("\n🎤 Running voice command tests...\n")

        for component in COMPONENT_PAGES:
            doc_path = self.docs_dir / component
            html_content = doc_path.read_text()

            print(f"🔍 Testing {component}...")
            result = self.test_voice_hints(component, html_content)

            test_result = {
                'component': component,
                'passed': result.get('passed', False),
                'issues': result.get('issues', []),
                'issue_count': len(result.get('issues', []))
            }

            self.results.append(test_result)

            if test_result['passed']:
                print(f"✅ {component} - PASSED")
            else:
                print(f"❌ {component} - {test_result['issue_count']} issues")

        self.generate_report()

    def generate_report(self):
        """Generate test report"""
        passed = sum(1 for r in self.results if r['passed'])
        total = len(self.results)

        # Save JSON
        results_path = Path(__file__).parent / 'test-results' / 'results-voice.json'
        results_path.parent.mkdir(exist_ok=True)
        with open(results_path, 'w') as f:
            json.dump(self.results, f, indent=2)

        print(f"\n📊 Voice tests complete!")
        print(f"   Passed: {passed}/{total}")
        print(f"   Results: {results_path}")

        # Exit with error if any tests failed
        if passed < total:
            exit(1)

if __name__ == '__main__':
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        print("❌ ANTHROPIC_API_KEY environment variable not set")
        exit(1)

    tester = VoiceTester(api_key)
    tester.run_all_tests()
