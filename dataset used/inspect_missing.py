import asyncio
import re
import json
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

print(f"Total missing variants: {len(missing)}")

async def inspect():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        page = await context.new_page()

        for brand, model, variant in missing[:10]:
            print(f"\n========================================\nChecking: {brand} | {model} | {variant}")
            # Try search on Cashify
            search_query = f"{brand} {model}".replace(' ', '%20')
            url = f"https://www.cashify.in/sell-old-mobile-phone/search?name={search_query}"
            print(f"URL: {url}")
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=10000)
                await page.wait_for_timeout(2000)
                links = await page.query_selector_all('a[href*="/sell-old-mobile-phone/used-"]')
                print(f"Found {len(links)} links on search page.")
                for link in links[:5]:
                    txt = await link.inner_text()
                    href = await link.get_attribute('href')
                    txt_clean = re.sub(r'[\r\n\t]+', ' ', txt).strip()
                    print(f"   -> Link: {txt_clean} | Href: {href}")
            except Exception as e:
                print(f"Error: {e}")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(inspect())
