from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.set_viewport_size({"width": 1440, "height": 3000})
    page.goto('file:///Users/danq/dbbasic-web-native/test-card-grid.html')
    page.wait_for_timeout(1500)

    page.screenshot(path='test-card-grid-screenshot.png', full_page=True)
    browser.close()
    print("Screenshot saved to test-card-grid-screenshot.png")
