from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.set_viewport_size({"width": 2560, "height": 1440})
    page.goto('file:///Users/danq/dbbasic-web-native/demo-saas-landing.html')
    page.wait_for_timeout(1500)

    page.screenshot(path='demo-saas-landing-wide-screenshot.png', full_page=True)
    browser.close()
    print("Screenshot saved to demo-saas-landing-wide-screenshot.png")
