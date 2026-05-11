import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.type}: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"BROWSER EXCEPTION: {exc}"))

        try:
            print("Navigating to toolbox...")
            await page.goto('http://localhost:3000/?tab=toolbox', wait_until='networkidle')
            await page.wait_for_selector('.card', timeout=15000)

            hubs = ['pdf-main', 'dev-main', 'edu-main', 'network-main']
            for hub_id in hubs:
                print(f"Verifying hub: {hub_id}")
                selector = f'#card-{hub_id}'

                # Try to scroll into view
                card = page.locator(selector)
                try:
                    await card.scroll_into_view_if_needed()
                    await asyncio.sleep(1) # Wait for animation
                except:
                    pass

                if await card.count() > 0:
                    await card.click()
                    try:
                        # Wait for either pill-group or tool-form
                        await page.wait_for_selector('.pill-group, .tool-form', timeout=10000)
                        print(f"Hub {hub_id} loaded successfully.")
                        await page.screenshot(path=f'hub_{hub_id}.png')
                    except Exception as e:
                        print(f"Failed to load hub {hub_id}: {e}")
                        await page.screenshot(path=f'error_{hub_id}.png')

                    # Go back
                    back_btn = page.locator('button.icon-btn:has(span.material-icons:text("arrow_back"))')
                    if await back_btn.count() > 0:
                        await back_btn.click()
                        await page.wait_for_selector('.card', timeout=10000)
                else:
                    print(f"Card for {hub_id} not found!")
                    # Check if it's in another category
                    all_ids = await page.evaluate("() => Array.from(document.querySelectorAll('.card')).map(c => c.id)")
                    print(f"Found card IDs: {all_ids}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
