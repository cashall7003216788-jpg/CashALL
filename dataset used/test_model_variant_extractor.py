"""
Test script to extract ALL storage variants and their Cashify prices directly from model pages!
"""

import asyncio
from playwright.async_api import async_playwright
import re

TEST_MODEL_PAGES = [
    "https://www.cashify.in/sell-old-mobile-phone/used-iphone-6-plus",
    "https://www.cashify.in/sell-old-mobile-phone/used-apple-iphone-15",
    "https://www.cashify.in/sell-old-mobile-phone/used-samsung-galaxy-s24-ultra",
    "https://www.cashify.in/sell-old-mobile-phone/used-oneplus-12",
]

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
        page = await context.new_page()

        for model_url in TEST_MODEL_PAGES:
            print(f"\n========================================")
            print(f"MODEL URL: {model_url}")
            await page.goto(model_url, wait_until="domcontentloaded", timeout=25000)
            await asyncio.sleep(2)

            variant_links = await page.evaluate('''() => {
                const results = [];
                // Look for variant anchors on the page
                const anchors = Array.from(document.querySelectorAll('a[href*="/sell-old-mobile-phone/used-"]'));
                for (const a of anchors) {
                    const text = a.innerText.trim();
                    const href = a.href;
                    // Check if it's a storage variant (e.g. "16 GB", "64 GB", "128 GB", "256 GB")
                    if (text.match(/\\d+\\s*(GB|TB)/i) || href.match(/\\d+-gb/i) || href.match(/\\d+gb/i)) {
                        results.push({ text, href });
                    }
                }
                return results;
            }''')

            print(f"Extracted {len(variant_links)} Storage Variants:")
            for v in variant_links:
                print(f"  Variant Option: {v['text']} -> URL: {v['href']}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
