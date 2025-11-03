#!/usr/bin/env python3
"""Quick test of AI vision analysis on one component"""

import os
import base64
from pathlib import Path
from anthropic import Anthropic

# Load .env
env_path = Path(__file__).parent / '.env'
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip()

api_key = os.environ.get('ANTHROPIC_API_KEY')
if not api_key:
    print("❌ No API key found")
    exit(1)

client = Anthropic(api_key=api_key)

# Test on semantic-action screenshot
screenshot = Path(__file__).parent / 'screenshots' / 'semantic-action.html.png'

if not screenshot.exists():
    print(f"❌ Screenshot not found: {screenshot}")
    print("Run: python3 test_visual_ai.py first to capture screenshots")
    exit(1)

print(f"🤖 Testing AI vision on {screenshot.name}...\n")

# Encode image
with open(screenshot, 'rb') as f:
    image_data = base64.standard_b64encode(f.read()).decode('utf-8')

# Prompt
prompt = """Analyze this component screenshot for WCAG AA contrast compliance:

1. Identify all text elements
2. Measure approximate contrast ratios between text and backgrounds
3. Flag any text below 4.5:1 contrast (normal text) or 3:1 (large text 18pt+)
4. List specific failures with colors if detected

Return ONLY valid JSON (no markdown):
{
  "passed": true/false,
  "issues": [
    {"element": "Save button", "contrast": "3.2:1", "colors": "white on #007aff", "severity": "fail"}
  ]
}"""

# Call API
print("Sending to Claude Sonnet 4.5...")
message = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": image_data
                }
            },
            {
                "type": "text",
                "text": prompt
            }
        ]
    }]
)

print("\n✅ Response received!\n")
print("Raw response:")
print(message.content[0].text)
