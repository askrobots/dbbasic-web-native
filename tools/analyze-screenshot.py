#!/usr/bin/env python3
import os
import base64
import json
from pathlib import Path
from anthropic import Anthropic

# Load API key
def load_env():
    env_path = Path.cwd() / '.env'
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

load_env()

screenshot_path = '/Users/danq/dbbasic-web-native/demo-fixed-layout.png'

# Encode image
with open(screenshot_path, 'rb') as f:
    image_data = base64.standard_b64encode(f.read()).decode('utf-8')

# Analyze
client = Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))

prompt = """Analyze this SaaS landing page for layout and alignment issues.

Focus on:
1. HEADER: Is "ProductName" logo visible? Where is it positioned (left edge, centered, or somewhere else)? Where are the navigation links (Features, Pricing, Testimonials) and "Sign Up Free" button positioned?

2. HERO SECTION: Are the heading, buttons, and badges properly centered? Specifically check if the two small badges (green one and outline one) are centered under the buttons or off to one side.

3. "EVERYTHING YOU NEED" SECTION: Are the 3 feature cards properly distributed across the full width, or are they bunched on the left/centered with empty space?

Describe EXACTLY what you see with specific positions. Be very precise about whether elements are at the left edge, centered, or have proper spacing."""

response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=2048,
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

print("\n" + "="*80)
print("AI VISION ANALYSIS OF SCREENSHOT")
print("="*80 + "\n")
print(response.content[0].text)
print("\n" + "="*80 + "\n")
