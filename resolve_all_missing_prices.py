import asyncio
import re
import json
import os
from playwright.async_api import async_playwright

dataset_path = r'c:\Users\DELL\OneDrive\Desktop\CashALL\Cashify_Mobile_Phones_Dataset.txt'

with open(dataset_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

missing_list = []
current_brand = ''
current_model = ''

for line in lines:
    line_str = line.strip()
    if line_str.startswith('===') or (line_str.isupper() and len(line_str) < 30 and not line_str.startswith('MODEL') and not line_str.startswith('VARIANT') and not line_str.startswith('FINAL')):
        if line_str and not line_str.startswith('='):
            current_brand = line_str
    elif line_str.startswith('MODEL:'):
        current_model = line_str.replace('MODEL:', '').strip()
    elif line_str.startswith('Variant:'):
        variant = line_str.replace('Variant:', '').strip()
    elif line_str.startswith('Cashify Price:'):
        price = line_str.replace('Cashify Price:', '').strip()
        if 'NOT AVAILABLE' in price or 'Rs.' not in price or price == 'Rs.':
            missing_list.append({
                'brand': current_brand,
                'model': current_model,
                'variant': variant
            })

print(f"Total missing variants found: {len(missing_list)}")

def clean_slug(s):
    s = s.lower()
    s = re.sub(r'[^\w\s-]', '', s)
    s = re.sub(r'[\s_]+', '-', s)
    return s.strip('-')

# Standard variants mapping for models where variant was 'Standard'
VARIANT_CANDIDATES = {
    'Apple iPhone SE 2020': ['64-gb', '128-gb', '256-gb'],
    'Apple iPhone Air': ['256-gb', '512-gb'],
    'Xiaomi Redmi Note 4': ['2-gb-32-gb', '3-gb-32-gb', '4-gb-64-gb'],
    'Xiaomi 11 Lite NE 5G': ['6-gb-128-gb', '8-gb-128-gb'],
    'Xiaomi 11T Pro 5G': ['8-gb-128-gb', '8-gb-256-gb', '12-gb-256-gb'],
    'Xiaomi Redmi Note 11': ['4-gb-64-gb', '6-gb-64-gb', '6-gb-128-gb'],
    'Xiaomi Redmi Note 11 Pro': ['6-gb-128-gb', '8-gb-128-gb'],
    'Xiaomi 12 Pro 5G': ['8-gb-256-gb', '12-gb-256-gb'],
    'Xiaomi Redmi Note 12': ['4-gb-128-gb', '6-gb-128-gb'],
    'Samsung Galaxy Note 8': ['6-gb-64-gb'],
    'Samsung Galaxy Note 9': ['6-gb-128-gb', '8-gb-512-gb'],
    'Samsung Galaxy S9 Plus': ['6-gb-64-gb', '6-gb-128-gb', '6-gb-256-gb'],
    'Samsung Galaxy Z Fold4': ['12-gb-256-gb', '12-gb-512-gb', '12-gb-1-tb'],
    'Samsung Galaxy Z Flip4': ['8-gb-128-gb', '8-gb-256-gb', '8-gb-512-gb'],
    'Samsung Galaxy Z Flip5': ['8-gb-256-gb', '8-gb-512-gb'],
    'Samsung Galaxy Z Fold5': ['12-gb-256-gb', '12-gb-512-gb', '12-gb-1-tb'],
    'Samsung Galaxy Z Flip6 5G': ['12-gb-256-gb', '12-gb-512-gb'],
    'Samsung Galaxy Z Fold6 5G': ['12-gb-256-gb', '12-gb-512-gb', '12-gb-1-tb'],
    'OnePlus Nord CE4 5G': ['8-gb-128-gb', '8-gb-256-gb'],
    'OnePlus Nord CE4 Lite 5G': ['8-gb-128-gb', '8-gb-256-gb'],
    'Vivo V15': ['6-gb-64-gb'],
    'Vivo S1': ['4-gb-128-gb', '6-gb-64-gb', '6-gb-128-gb'],
    'Vivo V21e 5G': ['8-gb-128-gb'],
    'Vivo V23 Pro': ['8-gb-128-gb', '12-gb-256-gb'],
    'Vivo T1': ['4-gb-128-gb', '6-gb-128-gb', '8-gb-128-gb'],
    'Vivo T1x': ['4-gb-64-gb', '4-gb-128-gb', '6-gb-128-gb'],
    'Vivo X90': ['8-gb-256-gb', '12-gb-256-gb'],
    'OPPO K1': ['4-gb-64-gb'],
    'OPPO Reno 10x Zoom': ['6-gb-128-gb', '8-gb-256-gb'],
    'OPPO K3': ['6-gb-64-gb', '8-gb-128-gb'],
    'OPPO A3x': ['4-gb-64-gb', '4-gb-128-gb'],
    'Realme X': ['4-gb-128-gb', '8-gb-128-gb'],
    'Realme X7': ['6-gb-128-gb', '8-gb-128-gb'],
    'Realme GT Master Edition': ['6-gb-128-gb', '8-gb-128-gb', '8-gb-256-gb'],
    'Realme GT Neo 2': ['8-gb-128-gb', '12-gb-256-gb'],
    'Realme GT 2': ['8-gb-128-gb', '12-gb-256-gb'],
    'Realme GT Neo 3': ['8-gb-128-gb', '8-gb-256-gb'],
    'Realme GT Neo 3T': ['6-gb-128-gb', '8-gb-128-gb', '8-gb-256-gb'],
    'Motorola Moto Edge 30 Ultra': ['8-gb-128-gb', '12-gb-256-gb'],
    'Motorola Moto Edge 50 Pro': ['8-gb-256-gb', '12-gb-256-gb'],
    'Google Pixel 7': ['8-gb-128-gb', '8-gb-256-gb'],
    'Google Pixel 7 Pro': ['12-gb-128-gb', '12-gb-256-gb'],
    'iQOO Z6': ['4-gb-128-gb', '6-gb-128-gb'],
    'iQOO Neo 6 5G': ['8-gb-128-gb', '12-gb-256-gb'],
    'iQOO Neo 7 5G': ['8-gb-128-gb', '12-gb-256-gb'],
}

async def fetch_price_for_slug(page, slug):
    url = f"https://www.cashify.in/sell-old-mobile-phone/{slug}"
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=10000)
        await page.wait_for_timeout(1500)
        body = await page.inner_text('body')
        body_flat = re.sub(r'[\r\n\t]+', ' ', body)
        match = re.search(r'Get\s*Upto[^\u20b9\d]*[\u20b9Rs\.]*\s*([\d,]+)', body_flat, re.IGNORECASE)
        if match:
            p_val = match.group(1).replace(',', '')
            if p_val.isdigit() and int(p_val) > 0:
                return f"Rs.{int(p_val):,}", url
    except Exception as e:
        pass
    return None, None

async def main():
    results = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        
        for item in missing_list:
            model = item['model']
            brand = item['brand']
            variant = item['variant']
            key = f"{brand} | {model} | {variant}"
            
            print(f"Resolving: {key}...")
            found_price = None
            found_url = None

            # Build list of potential slugs
            model_slug = 'used-' + clean_slug(model)
            slug_candidates = []
            
            if variant != 'Standard':
                v_slug = clean_slug(variant)
                slug_candidates.append(f"{model_slug}-{v_slug}")
            
            if model in VARIANT_CANDIDATES:
                for sub_v in VARIANT_CANDIDATES[model]:
                    slug_candidates.append(f"{model_slug}-{sub_v}")
            
            slug_candidates.append(model_slug)

            for slug in slug_candidates:
                price, url = await fetch_price_for_slug(page, slug)
                if price:
                    found_price = price
                    found_url = url
                    print(f"   => Found on Cashify: {price} ({slug})")
                    break

            if found_price:
                results[key] = {
                    'price': found_price,
                    'source': 'Cashify Live Variant Page',
                    'url': found_url
                }
            else:
                print(f"   => Not directly available on Cashify page.")
                results[key] = {
                    'price': 'NOT_FOUND_ON_CASHIFY',
                    'source': 'Pending Market Lookup'
                }

        await browser.close()

    with open(r'c:\Users\DELL\OneDrive\Desktop\CashALL\cashify_resolved_dict.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)

if __name__ == '__main__':
    asyncio.run(main())
