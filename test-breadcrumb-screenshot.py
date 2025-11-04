from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.set_viewport_size({"width": 1280, "height": 2400})
    page.goto('file:///Users/danq/dbbasic-web-native/test-breadcrumb.html')
    page.wait_for_timeout(1000)

    page.screenshot(path='test-breadcrumb-screenshot.png', full_page=True)
    browser.close()
    print("Screenshot saved to test-breadcrumb-screenshot.png")
