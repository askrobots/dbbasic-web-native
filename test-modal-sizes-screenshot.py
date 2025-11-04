from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto('file:///Users/danq/dbbasic-web-native/test-modal-sizes.html')
    page.wait_for_timeout(1000)

    # Open a modal to show in screenshot
    page.click('#btn-details')
    page.wait_for_timeout(500)

    page.screenshot(path='test-modal-sizes-screenshot.png', full_page=False)
    browser.close()
    print("Screenshot saved to test-modal-sizes-screenshot.png")
