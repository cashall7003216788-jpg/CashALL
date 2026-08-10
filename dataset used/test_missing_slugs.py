import asyncio
import re
from playwright.async_api import async_playwright

with open(r'c:\Users\DELL\OneDrive\Desktop\CashALL\Cashify_Mobile_Phones_Dataset.txt', 'r', encoding='utf-8') as f:
    text = f.read()

missing = []
current_brand = ''
current_model = ''

for line in text.splitlines():
    if line.startswith('===') or (line.isupper() and len(line) < 30 and not line.startswith('MODEL') and not line.startswith('VARIANT') and not line.startswith('FINAL')):
        if line.strip() and not line.startswith('='):
            current_brand = line.strip()
    elif line.startswith('MODEL:'):
        current_model = line.replace('MODEL:', '').strip()
    elif line.startswith('Variant:'):
        variant = line.replace('Variant:', '').strip()
    elif line.startswith('Cashify Price:'):
        price = line.replace('Cashify Price:', '').strip()
        if 'NOT AVAILABLE' in price or 'Rs.' not in price or price == 'Rs.':
            missing.append((current_brand, current_model, variant))

print(f"Total missing: {len(missing)}")

async def test_slugs():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        test_cases = [
            ("Apple iPhone SE 2020", "used-apple-iphone-se-2020-64-gb"),
            ("Google Pixel 7", "used-google-pixel-7-8-gb-128-gb"),
            ("Xiaomi Redmi Note 4", "used-xiaomi-redmi-note-4-4-gb-64-gb"),
            ("Samsung Galaxy Note 8", "used-samsung-galaxy-note-8-6-gb-64-gb"),
            ("OnePlus Nord CE4 5G", "used-oneplus-nord-ce4-5g-8-gb-128-gb")
        ]

        for model, slug in test_cases:
            url = f"https://www.cashify.in/sell-old-mobile-phone/{slug}"
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=10000)
                await page.wait_for_timeout(2000)
                body_text = await page.inner_text('body')
                prices = re.findall(r'Get\s*Upto[^\u20b9\d]*[\u20b9Rs\.]*\s*([\d,]+)', body_text, re.IGNORECASE)
                print(f"Model: {model} | URL: {url}")
                print(f"   Matches: {prices}")
            except Exception as e:
                print(f"   Error: {e}")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_slugs())
