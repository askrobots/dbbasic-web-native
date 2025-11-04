from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('file:///Users/danq/dbbasic-web-native/test-disclosure.html')
    page.wait_for_timeout(1000)

    result = page.evaluate('''
        () => {
            const disclosure = document.querySelector('semantic-disclosure');
            const disclosureItems = disclosure.querySelectorAll('disclosure-item');
            const container = disclosure.shadowRoot.querySelector('.disclosure-container');
            return {
                disclosureItemsFound: disclosureItems.length,
                containerChildren: container ? container.children.length : 0,
                containerHTML: container ? container.innerHTML.substring(0, 200) : 'null'
            };
        }
    ''')

    print(result)
    browser.close()
