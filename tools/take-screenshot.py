#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
import os
import sys

def take_screenshot(html_file='demo-saas-landing.html', output_file='demo-fixed-layout.png'):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})
        page.goto(f'file://{os.getcwd()}/{html_file}')
        page.screenshot(path=output_file, full_page=True)
        browser.close()
        print(f'Screenshot saved to {output_file}')

if __name__ == '__main__':
    html_file = sys.argv[1] if len(sys.argv) > 1 else 'demo-saas-landing.html'
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'demo-fixed-layout.png'
    take_screenshot(html_file, output_file)
