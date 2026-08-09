import asyncio
import re
import json
import urllib.parse
from playwright.async_api import async_playwright

dataset_path = r'c:\Users\DELL\OneDrive\Desktop\CashALL\Cashify_Mobile_Phones_Dataset.txt'

with open(dataset_path, 'r', encoding='utf-8') as f:
    text = f.read()

missing_items = []
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
            missing_items.append({
                'brand': current_brand,
                'model': current_model,
                'variant': variant
            })

print(f"Total missing items to resolve: {len(missing_items)}")

def clean_slug(s):
    s = s.lower()
    s = re.sub(r'[^\w\s-]', '', s)
    s = re.sub(r'[\s_]+', '-', s)
    return s.strip('-')

async def find_cashify_price_for_item(page, item):
    brand = item['brand']
    model = item['model']
    variant = item['variant']
    
    print(f"\nSearching Cashify for: {brand} | {model} | {variant}")
    
    # 1. Search page on Cashify
    query = f"{brand} {model}".replace(' ', '%20')
    search_url = f"https://www.cashify.in/sell-old-mobile-phone/search?name={query}"
    
    found_urls = set()
    try:
        await page.goto(search_url, wait_until="domcontentloaded", timeout=12000)
        await page.wait_for_timeout(2000)
        links = await page.query_selector_all('a[href*="/sell-old-mobile-phone/used-"]')
        for link in links:
            href = await link.get_attribute('href')
            if href:
                found_urls.add(href)
    except Exception as e:
        print(f"   Search navigation error: {e}")

    # 2. Try candidate URLs
    model_slug = clean_slug(model)
    if not model_slug.startswith('used-'):
        model_slug = 'used-' + model_slug
    
    variant_slug_part = clean_slug(variant) if variant != 'Standard' else ''
    
    candidates = list(found_urls)
    if variant_slug_part:
        candidates.append(f"https://www.cashify.in/sell-old-mobile-phone/{model_slug}-{variant_slug_part}")
    candidates.append(f"https://www.cashify.in/sell-old-mobile-phone/{model_slug}")

    # Common variant additions if Standard
    if variant == 'Standard':
        for default_v in ['64-gb', '128-gb', '256-gb', '4-gb-64-gb', '6-gb-128-gb', '8-gb-128-gb']:
            candidates.append(f"https://www.cashify.in/sell-old-mobile-phone/{model_slug}-{default_v}")

    for url in candidates:
        if not url.startswith('http'):
            url = f"https://www.cashify.in{url}" if url.startswith('/') else f"https://www.cashify.in/{url}"
        
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=10000)
            await page.wait_for_timeout(1500)
            body_text = await page.inner_text('body')
            body_text_flat = re.sub(r'[\r\n\t]+', ' ', body_text)
            
            match = re.search(r'Get\s*Upto[^\u20b9\d]*[\u20b9Rs\.]*\s*([\d,]+)', body_text_flat, re.IGNORECASE)
            if match:
                price_str = match.group(1).replace(',', '')
                if price_str.isdigit() and int(price_str) > 0:
                    formatted_price = f"Rs.{int(price_str):,}"
                    print(f"   SUCCESS! Found price: {formatted_price} at {url}")
                    return formatted_price, url
        except Exception as e:
            pass

    return None, None

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        page = await context.new_page()

        results = {}
        for item in missing_items:
            key = f"{item['brand']} | {item['model']} | {item['variant']}"
            price, url = await find_cashify_price_for_item(page, item)
            if price:
                results[key] = price
            else:
                print(f"   NOT FOUND on Cashify for {key}")
                results[key] = "NOT_FOUND_ON_CASHIFY"

        await browser.close()

    with open(r'c:\Users\DELL\OneDrive\Desktop\CashALL\resolved_missing.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)

if __name__ == '__main__':
    asyncio.run(main())
