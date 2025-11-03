#!/usr/bin/env python3
"""
Single Component AI Vision Test
Tests just one component at a time for quick verification
Usage: python3 test_single_visual.py <component-name>
Example: python3 test_single_visual.py semantic-card
"""

import sys
import json
import base64
import anthropic
import os
import time
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright

# Configuration
SCREENSHOT_DIR = Path("screenshots")
RESULTS_DIR = Path("test-results")
API_LOG_FILE = Path("test-results/api-calls.log")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# API cost tracking
API_COSTS = {
    "claude-sonnet-4-5": {
        "input": 3.00 / 1_000_000,   # $3 per million input tokens
        "output": 15.00 / 1_000_000  # $15 per million output tokens
    }
}

MODEL = "claude-sonnet-4-5"

api_call_stats = {
    "total_calls": 0,
    "total_input_tokens": 0,
    "total_output_tokens": 0,
    "total_cost": 0.0,
    "calls": []
}

if not ANTHROPIC_API_KEY:
    print("❌ ANTHROPIC_API_KEY environment variable not set")
    sys.exit(1)

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

COMPONENTS = [
    "semantic-action",
    "semantic-card",
    "semantic-input",
    "semantic-modal",
    "semantic-navigator",
    "semantic-list",
    "semantic-menu",
    "semantic-feedback",
    "semantic-adjuster"
]

def take_screenshot(component_name):
    """Take screenshot of a single component"""
    print(f"📸 Taking screenshot of {component_name}.html...")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1400, "height": 1200})

        file_path = Path(f"docs/{component_name}.html").absolute()
        page.goto(f"file://{file_path}")
        page.wait_for_timeout(1000)

        screenshot_path = SCREENSHOT_DIR / f"{component_name}.html.png"
        page.screenshot(path=str(screenshot_path), full_page=True)

        browser.close()

    print(f"✅ Screenshot saved: {screenshot_path}")
    return screenshot_path

def log_api_call(test_name, model, input_tokens, output_tokens, cost):
    """Log API call for cost tracking"""
    global api_call_stats

    call_data = {
        "timestamp": datetime.now().isoformat(),
        "test": test_name,
        "model": model,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cost": cost
    }

    api_call_stats["total_calls"] += 1
    api_call_stats["total_input_tokens"] += input_tokens
    api_call_stats["total_output_tokens"] += output_tokens
    api_call_stats["total_cost"] += cost
    api_call_stats["calls"].append(call_data)

    # Append to log file
    with open(API_LOG_FILE, "a") as f:
        f.write(f"{datetime.now().isoformat()} | {test_name:25s} | Input: {input_tokens:6d} | Output: {output_tokens:5d} | Cost: ${cost:.4f}\n")

def analyze_with_vision(component_name, screenshot_path):
    """Analyze component with Claude's vision API"""
    print(f"🤖 Analyzing {component_name} with AI vision...")

    # Read and encode image
    with open(screenshot_path, "rb") as f:
        image_data = base64.standard_b64encode(f.read()).decode("utf-8")

    results = {
        "component": component_name,
        "screenshot": str(screenshot_path),
        "tests": {}
    }

    # Test 1: Contrast
    print(f"  🔍 Testing contrast...")
    contrast_response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_data,
                    },
                },
                {
                    "type": "text",
                    "text": """Analyze this component documentation page for WCAG AA contrast compliance (4.5:1 minimum for normal text, 3:1 for large text).

Check all text elements including:
- Headings and titles
- Body text and descriptions
- Code examples
- Table text
- State labels and descriptions
- Button text

For each contrast failure, report:
- Element description
- Estimated contrast ratio
- Colors involved
- Severity (fail if below 4.5:1, warning if 4.5-7.0:1)

Return JSON: {"passed": true/false, "issues": [{"element": "...", "contrast": "...", "colors": "...", "severity": "fail/warning"}]}"""
                }
            ]
        }]
    )

    # Log API call
    usage = contrast_response.usage
    cost = (usage.input_tokens * API_COSTS[MODEL]["input"]) + (usage.output_tokens * API_COSTS[MODEL]["output"])
    log_api_call(f"{component_name}:contrast", MODEL, usage.input_tokens, usage.output_tokens, cost)

    contrast_text = contrast_response.content[0].text
    # Extract JSON from response
    try:
        if "```json" in contrast_text:
            contrast_text = contrast_text.split("```json")[1].split("```")[0].strip()
        results["tests"]["contrast"] = json.loads(contrast_text)
    except:
        results["tests"]["contrast"] = {"passed": False, "issues": [{"element": "parse_error", "contrast": "N/A", "colors": contrast_text[:200], "severity": "fail"}]}

    # Test 2: State Differentiation
    print(f"  🔍 Testing state differentiation...")
    states_response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_data,
                    },
                },
                {
                    "type": "text",
                    "text": """Look at the "Interactive States" section. Are the different states (Default, Hover, Active, Focus, Disabled) visually distinguishable?

Each state should look CLEARLY different from the others. Check for:
- Color changes
- Size/scale changes
- Shadow/elevation changes
- Border changes
- Visual effects (brightness, blur, etc)

Report any states that look identical or too similar.

Return JSON: {"passed": true/false, "issues": [{"states": "which states look the same", "problem": "description", "severity": "fail/warning"}]}"""
                }
            ]
        }]
    )

    # Log API call
    usage = states_response.usage
    cost = (usage.input_tokens * API_COSTS[MODEL]["input"]) + (usage.output_tokens * API_COSTS[MODEL]["output"])
    log_api_call(f"{component_name}:state_differentiation", MODEL, usage.input_tokens, usage.output_tokens, cost)

    states_text = states_response.content[0].text
    try:
        if "```json" in states_text:
            states_text = states_text.split("```json")[1].split("```")[0].strip()
        results["tests"]["state_differentiation"] = json.loads(states_text)
    except:
        results["tests"]["state_differentiation"] = {"passed": False, "issues": [{"states": "parse_error", "problem": states_text[:200], "severity": "fail"}]}

    # Test 3: Affordance
    print(f"  🔍 Testing affordance...")
    affordance_response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_data,
                    },
                },
                {
                    "type": "text",
                    "text": """Check if interactive elements clearly look interactive (buttons, inputs, cards, etc).

Good affordance signals:
- Buttons look pressable (3D depth, shadows, borders)
- Inputs have clear input fields
- Clickable cards have hover effects shown
- Links are underlined or colored distinctly

Report any interactive elements that don't look interactive.

Return JSON: {"passed": true/false, "issues": [{"element": "...", "problem": "...", "severity": "fail/warning"}]}"""
                }
            ]
        }]
    )

    # Log API call
    usage = affordance_response.usage
    cost = (usage.input_tokens * API_COSTS[MODEL]["input"]) + (usage.output_tokens * API_COSTS[MODEL]["output"])
    log_api_call(f"{component_name}:affordance", MODEL, usage.input_tokens, usage.output_tokens, cost)

    affordance_text = affordance_response.content[0].text
    try:
        if "```json" in affordance_text:
            affordance_text = affordance_text.split("```json")[1].split("```")[0].strip()
        results["tests"]["affordance"] = json.loads(affordance_text)
    except:
        results["tests"]["affordance"] = {"passed": False, "issues": [{"element": "parse_error", "problem": affordance_text[:200], "severity": "fail"}]}

    # Test 4: Visual Feedback
    print(f"  🔍 Testing visual feedback...")
    feedback_response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_data,
                    },
                },
                {
                    "type": "text",
                    "text": """Check if state changes provide clear visual feedback.

Look at the Interactive States section - do hover/active/focus states show OBVIOUS changes?
- Hover should be clearly visible (lift, glow, color change)
- Active/pressed should be obvious (scale down, darker)
- Focus should have clear outline
- Disabled should look clearly disabled (greyed out)

Report any states with insufficient visual feedback.

Return JSON: {"passed": true/false, "issues": [{"state": "...", "problem": "...", "severity": "fail/warning"}]}"""
                }
            ]
        }]
    )

    # Log API call
    usage = feedback_response.usage
    cost = (usage.input_tokens * API_COSTS[MODEL]["input"]) + (usage.output_tokens * API_COSTS[MODEL]["output"])
    log_api_call(f"{component_name}:visual_feedback", MODEL, usage.input_tokens, usage.output_tokens, cost)

    feedback_text = feedback_response.content[0].text
    try:
        if "```json" in feedback_text:
            feedback_text = feedback_text.split("```json")[1].split("```")[0].strip()
        results["tests"]["visual_feedback"] = json.loads(feedback_text)
    except:
        results["tests"]["visual_feedback"] = {"passed": False, "issues": [{"state": "parse_error", "problem": feedback_text[:200], "severity": "fail"}]}

    # Determine overall pass/fail
    results["passed"] = all(
        test.get("passed", False)
        for test in results["tests"].values()
    )

    return results

def print_results(results):
    """Print results in a readable format"""
    component = results["component"]

    print(f"\n{'='*60}")
    print(f"📊 Results for {component}")
    print(f"{'='*60}\n")

    for test_name, test_data in results["tests"].items():
        status = "✅ PASSED" if test_data.get("passed", False) else "❌ FAILED"
        print(f"{test_name.upper()}: {status}")

        if test_data.get("issues"):
            for issue in test_data["issues"]:
                severity = issue.get("severity", "unknown")
                emoji = "❌" if severity == "fail" else "⚠️"
                print(f"  {emoji} {issue}")
        print()

    overall = "✅ PASSED" if results["passed"] else "❌ FAILED"
    print(f"Overall: {overall}\n")

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 test_single_visual.py <component-name>")
        print(f"Available components: {', '.join(COMPONENTS)}")
        sys.exit(1)

    component_name = sys.argv[1]

    if component_name not in COMPONENTS:
        print(f"❌ Unknown component: {component_name}")
        print(f"Available components: {', '.join(COMPONENTS)}")
        sys.exit(1)

    # Ensure directories exist
    SCREENSHOT_DIR.mkdir(exist_ok=True)
    RESULTS_DIR.mkdir(exist_ok=True)

    # Take screenshot
    screenshot_path = take_screenshot(component_name)

    # Analyze with AI
    results = analyze_with_vision(component_name, screenshot_path)

    # Save results
    result_file = RESULTS_DIR / f"result-{component_name}.json"
    with open(result_file, "w") as f:
        json.dump(results, f, indent=2)
    print(f"💾 Results saved to {result_file}")

    # Print results
    print_results(results)

    # Print API cost summary
    print(f"\n{'='*60}")
    print(f"💰 API Cost Summary")
    print(f"{'='*60}")
    print(f"Total API Calls: {api_call_stats['total_calls']}")
    print(f"Input Tokens:    {api_call_stats['total_input_tokens']:,}")
    print(f"Output Tokens:   {api_call_stats['total_output_tokens']:,}")
    print(f"Total Cost:      ${api_call_stats['total_cost']:.4f}")
    print()

    # Exit with appropriate code
    sys.exit(0 if results["passed"] else 1)

if __name__ == "__main__":
    main()
