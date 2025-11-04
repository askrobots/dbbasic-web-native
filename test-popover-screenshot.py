from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.set_viewport_size({"width": 1280, "height": 2200})
    page.goto('file:///Users/danq/dbbasic-web-native/test-popover.html')
    page.wait_for_timeout(1000)

    # Hover over the first popover to make it visible
    first_trigger = page.locator('.tooltip-text').first
    first_trigger.hover()
    page.wait_for_timeout(500)

    page.screenshot(path='test-popover-screenshot.png', full_page=True)
    browser.close()
    print("Screenshot saved to test-popover-screenshot.png")
