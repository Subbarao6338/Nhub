import asyncio
from playwright.async_api import async_playwright
import os

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Base URL
        base_url = "http://localhost:5175"

        # 1. Verify Sound Meter (Direct Launch)
        print("Verifying Sound Meter...")
        await page.goto(f"{base_url}/?tab=toolbox&tool=soundmeter")
        await page.wait_for_selector(".sensor-circle")
        await page.screenshot(path="/home/jules/verification/soundmeter_verify.png")

        # 2. Verify QR Scanner Reset Flow
        print("Verifying QR Scanner Reset Flow...")
        await page.goto(f"{base_url}/?tab=toolbox&tool=qr-scan")
        await page.wait_for_selector("#reader")
        # We can't easily mock a scan result here without complex injection,
        # but we can verify the UI state.
        await page.screenshot(path="/home/jules/verification/qrscanner_verify.png")

        # 3. Verify PDF Crop (Direct Launch)
        print("Verifying PDF Crop...")
        await page.goto(f"{base_url}/?tab=toolbox&tool=pdf-crop")
        await page.wait_for_selector("input[type='file']")
        await page.screenshot(path="/home/jules/verification/pdfcrop_verify.png")

        # 4. Verify Toolbox Categories (Scrollable Check)
        print("Verifying Toolbox Scrollable Tabs...")
        await page.goto(f"{base_url}/?tab=toolbox")
        await page.wait_for_selector(".pill-group")
        await page.screenshot(path="/home/jules/verification/toolbox_tabs_verify.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
