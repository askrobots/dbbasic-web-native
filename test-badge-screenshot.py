from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.set_viewport_size({"width": 1280, "height": 2600})
    page.goto('file:///Users/danq/dbbasic-web-native/test-badge.html')
    page.wait_for_timeout(1500)  # Wait for animations
    page.screenshot(path='test-badge-screenshot.png', full_page=True)
    browser.close()
    print("Screenshot saved to test-badge-screenshot.png")
