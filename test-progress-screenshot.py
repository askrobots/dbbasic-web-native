from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.set_viewport_size({"width": 1280, "height": 2400})
    page.goto('file:///Users/danq/dbbasic-web-native/test-progress.html')
    page.wait_for_timeout(1500)  # Wait a bit for spinners to be visible
    page.screenshot(path='test-progress-screenshot.png', full_page=True)
    browser.close()
    print("Screenshot saved to test-progress-screenshot.png")
