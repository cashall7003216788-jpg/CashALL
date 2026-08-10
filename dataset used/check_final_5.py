import asyncio
import re
import json
from playwright.async_api import async_playwright

final_5 = [
    ("APPLE", "Apple iPhone SE 2020", ["used-apple-iphone-se-2020-64-gb", "used-apple-iphone-se-2020-128-gb", "used-apple-iphone-se-2020-256-gb"]),
    ("APPLE", "Apple iPhone Air", ["used-apple-iphone-air-256-gb", "used-apple-iphone-air-512-gb", "used-apple-iphone-air-128-gb"]),
    ("XIAOMI", "Xiaomi Redmi Note 4", ["used-xiaomi-redmi-note-4-4-gb-64-gb", "used-xiaomi-redmi-note-4-3-gb-32-gb", "used-xiaomi-redmi-note-4-2-gb-32-gb"]),
    ("VIVO", "Vivo V50 Elite", ["used-vivo-v50-elite-8-gb-128-gb", "used-vivo-v50-elite-8-gb-256-gb"]),
    ("IQOO", "iQOO 15R", ["used-iqoo-15r-8-gb-128-gb", "used-iqoo-15r-12-gb-256-gb"])
]

async def check():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        
        found = {}
        for brand, model, slugs in final_5:
            key = f"{brand} | {model}"
            p_val = None
            for slug in slugs:
                url = f"https://www.cashify.in/sell-old-mobile-phone/{slug}"
                try:
                    await page.goto(url, wait_until="domcontentloaded", timeout=8000)
                    await page.wait_for_timeout(1000)
                    text = await page.inner_text('body')
                    text_flat = re.sub(r'[\r\n\t]+', ' ', text)
                    m = re.search(r'Get\s*Upto[^\u20b9\d]*[\u20b9Rs\.]*\s*([\d,]+)', text_flat, re.IGNORECASE)
                    if m and int(m.group(1).replace(',', '')) > 0:
                        p_val = f"Rs.{int(m.group(1).replace(',', '')):,}"
                        print(f"MATCH: {key} => {p_val} ({slug})")
                        break
                except Exception:
                    pass
            found[key] = p_val
            if not p_val:
                print(f"NOT MATCHED on Cashify: {key}")
                
        await browser.close()
        with open(r'c:\Users\DELL\OneDrive\Desktop\CashALL\final_5_results.json', 'w') as f:
            json.dump(found, f, indent=2)

if __name__ == '__main__':
    asyncio.run(check())
