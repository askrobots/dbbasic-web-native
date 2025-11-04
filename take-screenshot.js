const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('file://' + process.cwd() + '/demo-saas-landing.html');
    await page.screenshot({ path: 'demo-fixed-layout.png', fullPage: false });
    await browser.close();
    console.log('Screenshot saved to demo-fixed-layout.png');
})();
