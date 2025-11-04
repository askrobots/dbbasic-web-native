from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('file:///Users/danq/dbbasic-web-native/test-tabs.html')
    page.wait_for_timeout(1000)

    result = page.evaluate('''
        () => {
            const tabs = document.querySelector('semantic-tabs');
            const tabItems = tabs.querySelectorAll('tab-item');
            const tabPanels = tabs.querySelectorAll('tab-panel');
            const tabList = tabs.shadowRoot.querySelector('.tab-list');
            const panelsContainer = tabs.shadowRoot.querySelector('.tab-panels');
            return {
                tabItemsFound: tabItems.length,
                tabPanelsFound: tabPanels.length,
                tabListChildren: tabList.children.length,
                panelsContainerChildren: panelsContainer.children.length
            };
        }
    ''')

    print(result)
    browser.close()
