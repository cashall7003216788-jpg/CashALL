import asyncio
import json
import re
from playwright.async_api import async_playwright

async def get_brand_images(brand_slug):
    url = f"https://www.cashify.in/sell-old-mobile-phone/{brand_slug}"
    images = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=12000)
            await page.wait_for_timeout(2000)
            
            # scroll down to load lazy images
            for _ in range(5):
                await page.evaluate("window.scrollBy(0, 1000)")
                await page.wait_for_timeout(500)
            
            # find all model anchor containers
            cards = await page.query_selector_all('a[href*="/sell-old-mobile-phone/used-"]')
            for card in cards:
                href = await card.get_attribute('href')
                img = await card.query_selector('img')
                if img:
                    src = await img.get_attribute('src') or await img.get_attribute('data-src')
                    alt = await img.get_attribute('alt') or ''
                    txt = await card.inner_text()
                    txt_clean = re.sub(r'[\r\n\t]+', ' ', txt).strip()
                    if src and not src.endswith('.svg') and 'logo' not in src.lower():
                        images[txt_clean] = src
        except Exception as e:
            print(f"Error on {brand_slug}: {e}")
        await browser.close()
    return images

async def main():
    apple_imgs = await get_brand_images("apple")
    print(f"Extracted {len(apple_imgs)} Apple images:")
    for k, v in list(apple_imgs.items())[:5]:
        print(f"  {k} => {v}")

if __name__ == '__main__':
    asyncio.run(main())
