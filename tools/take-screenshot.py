#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
import os

def take_screenshot():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})
        page.goto(f'file://{os.getcwd()}/demo-saas-landing.html')
        page.screenshot(path='demo-fixed-layout.png')
        browser.close()
        print('Screenshot saved to demo-fixed-layout.png')

if __name__ == '__main__':
    take_screenshot()
