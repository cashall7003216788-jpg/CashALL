import asyncio
import re
import json
from playwright.async_api import async_playwright

remaining_items = [
    ("APPLE", "Apple iPhone SE 2020", "Standard"),
    ("APPLE", "Apple iPhone Air", "Standard"),
    ("XIAOMI", "Xiaomi Redmi Note 4", "Standard"),
    ("SAMSUNG", "Samsung Galaxy A6", "4 GB/64 GB"),
    ("SAMSUNG", "Samsung Galaxy Note 9", "Standard"),
    ("ONEPLUS", "OnePlus Nord CE 5", "Standard"),
    ("POCO", "POCO C85x", "Standard"),
    ("VIVO", "Vivo V50 Elite", "Standard"),
    ("VIVO", "Vivo V70 Elite", "Standard"),
    ("MOTOROLA", "Motorola Moto Edge 60 Pro", "Standard"),
    ("IQOO", "iQOO 11 5G", "16 GB/256 GB"),
    ("IQOO", "iQOO 15R", "Standard")
]

# Let's test specific Cashify URL variations first for these 12:
EXTRA_SLUGS = {
    "Apple iPhone SE 2020": ["used-apple-iphone-se-2020", "used-apple-iphone-se-2020-64-gb", "used-apple-iphone-se-2020-128-gb"],
    "Xiaomi Redmi Note 4": ["used-xiaomi-redmi-note-4", "used-xiaomi-redmi-note-4-3-gb-32-gb", "used-xiaomi-redmi-note-4-4-gb-64-gb"],
    "Samsung Galaxy A6": ["used-samsung-galaxy-a6", "used-samsung-galaxy-a6-4-gb-64-gb", "used-samsung-galaxy-a6-3-gb-32-gb"],
    "Samsung Galaxy Note 9": ["used-samsung-galaxy-note-9", "used-samsung-galaxy-note-9-6-gb-128-gb"],
    "iQOO 11 5G": ["used-iqoo-11-5g-16-gb-256-gb", "used-iqoo-11-5g-8-gb-256-gb"],
    "Apple iPhone Air": ["used-apple-iphone-air-256-gb", "used-apple-iphone-air-512-gb"],
    "OnePlus Nord CE 5": ["used-oneplus-nord-ce-5-8-gb-128-gb"],
    "POCO C85x": ["used-poco-c85x-4-gb-128-gb"],
    "Vivo V50 Elite": ["used-vivo-v50-elite-8-gb-128-gb"],
    "Vivo V70 Elite": ["used-vivo-v70-elite-8-gb-256-gb"],
    "Motorola Moto Edge 60 Pro": ["used-motorola-moto-edge-60-pro-12-gb-256-gb"],
    "iQOO 15R": ["used-iqoo-15r-8-gb-128-gb"]
}

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        
        found = {}
        for brand, model, variant in remaining_items:
            key = f"{brand} | {model} | {variant}"
            slugs = EXTRA_SLUGS.get(model, [])
            price_found = None
            for slug in slugs:
                url = f"https://www.cashify.in/sell-old-mobile-phone/{slug}"
                try:
                    await page.goto(url, wait_until="domcontentloaded", timeout=8000)
                    await page.wait_for_timeout(1000)
                    text = await page.inner_text('body')
                    text_flat = re.sub(r'[\r\n\t]+', ' ', text)
                    m = re.search(r'Get\s*Upto[^\u20b9\d]*[\u20b9Rs\.]*\s*([\d,]+)', text_flat, re.IGNORECASE)
                    if m and int(m.group(1).replace(',', '')) > 0:
                        price_found = f"Rs.{int(m.group(1).replace(',', '')):,}"
                        print(f"FOUND for {key} => {price_found} ({slug})")
                        break
                except Exception:
                    pass

            if price_found:
                found[key] = price_found
            else:
                print(f"Still missing: {key}")
                found[key] = None
        
        await browser.close()
        with open(r'c:\Users\DELL\OneDrive\Desktop\CashALL\remaining_12_cashify.json', 'w') as f:
            json.dump(found, f, indent=2)

if __name__ == '__main__':
    asyncio.run(main())
