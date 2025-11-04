from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    errors = []
    page.on("console", lambda msg: print(f"Console {msg.type}: {msg.text}"))
    page.on("pageerror", lambda exc: errors.append(str(exc)))

    page.goto('file:///Users/danq/dbbasic-web-native/test-disclosure.html')
    page.wait_for_timeout(1000)

    if errors:
        print("\nErrors:")
        for error in errors:
            print(error)
    else:
        print("\nNo errors detected")

    browser.close()
