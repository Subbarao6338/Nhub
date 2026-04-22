from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173")
        time.sleep(5) # Wait for load

        # 1. Check Social Downloader
        page.goto("http://localhost:5173?tab=toolbox&tool=social-downloader")
        time.sleep(2)
        page.screenshot(path="verification/social_downloader.png")

        # 2. Check Web to MD
        page.goto("http://localhost:5173?tab=toolbox&tool=web-to-md")
        time.sleep(2)
        page.screenshot(path="verification/web_to_md.png")

        # 3. Check fixed tool - Timestamp
        page.goto("http://localhost:5173?tab=toolbox&tool=timestamp-conv")
        time.sleep(2)
        page.screenshot(path="verification/timestamp_conv.png")

        browser.close()

if __name__ == "__main__":
    run()
