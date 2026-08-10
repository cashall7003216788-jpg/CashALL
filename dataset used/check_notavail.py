"""Check what price text appears on the iPhone 6 variant page."""
import asyncio, re, sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from playwright.async_api import async_playwright

async def check():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
            locale='en-IN'
        )
        page = await ctx.new_page()

        # Test a known working variant URL
        test_urls = [
            'https://www.cashify.in/sell-old-mobile-phone/used-apple-iphone-6',
            'https://www.cashify.in/sell-old-mobile-phone/used-apple-iphone-6-1-gb-16-gb',
        ]
        for url in test_urls:
            print(f"\n=== {url} ===")
            await page.goto(url, wait_until='domcontentloaded', timeout=35000)
            await asyncio.sleep(2)
            await page.evaluate("window.scrollBy(0, 500)")
            await asyncio.sleep(0.5)
            body = await page.inner_text('body')
            # Show lines containing price-related words
            for line in body.split('\n'):
                line = line.strip()
                if any(w in line.lower() for w in ['upto', 'up to', 'price', 'rs', 'value', 'earn', '₹']):
                    if line:
                        print(f"  >> {line}")
        await browser.close()

asyncio.run(check())
