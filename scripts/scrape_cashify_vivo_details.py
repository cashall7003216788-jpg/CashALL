import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'}

slugs = [
    ('Vivo V50', 'vivo-v50', 'used-vivo-v50', 2025),
    ('Vivo V50e', 'vivo-v50e', 'used-vivo-v50e', 2025),
    ('Vivo V60', 'vivo-v60', 'used-vivo-v60', 2025),
    ('Vivo V60e', 'vivo-v60e', 'used-vivo-v60e', 2025),
    ('Vivo V70', 'vivo-v70', 'used-vivo-v70', 2026),
    ('Vivo V70 Elite', 'vivo-v70-elite', 'used-vivo-v70-elite-5g', 2026),
    ('Vivo V70 FE', 'vivo-v70-fe', 'used-vivo-v70-fe', 2026),
]

results = []

for name, our_slug, cashify_slug, year in slugs:
    url = f'https://www.cashify.in/sell-old-mobile-phone/{cashify_slug}'
    print(f"\n--- Fetching {name} from {url} ---")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=12) as r:
            html = r.read().decode('utf-8')
            
            # Find image
            img_m = re.search(r'https://s3n[g]?\.cashify\.in/cashify/product/img/xhdpi/[a-zA-Z0-9_-]+\.(?:jpg|png|webp)', html)
            img_url = img_m.group(0) if img_m else None
            if img_url and '?w=' not in img_url:
                img_url += '?w=800'
            print(f"Image: {img_url}")
            
            # Find variants and prices in HTML / scripts
            # Search for JSON-LD schema or variant cards
            prices = re.findall(r'₹\s*([0-9,]+)', html)
            print(f"Prices in page: {prices[:10]}")
            
            # Search for storage variants: e.g. "8 GB/128 GB", "8 GB / 256 GB", etc.
            var_matches = re.findall(r'(\d+\s*GB)\s*/\s*(\d+\s*GB|\d+\s*TB)', html)
            print(f"Variant storage matches: {set(var_matches)}")
            
            # Also search for scripts with variant objects
            var_objs = []
            for s in re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL):
                if 'basePrice' in s or 'maxPrice' in s or 'variant' in s.lower():
                    # check for price patterns
                    found_prices = re.findall(r'"storage":"([^"]+)"(?:,"ram":"([^"]+)")?[^{}]*?"price":([0-9]+)', s)
                    if found_prices:
                        var_objs.extend(found_prices)
                    found_prices2 = re.findall(r'"name":"([^"]+)"[^{}]*?"price":([0-9]+)', s)
                    if found_prices2:
                        var_objs.extend(found_prices2)
            
            print(f"Found structured variant objs: {var_objs[:10]}")
            
            results.append({
                'name': name,
                'slug': our_slug,
                'cashify_slug': cashify_slug,
                'releaseYear': year,
                'imageUrl': img_url,
                'prices': prices[:10],
                'var_matches': list(set(var_matches)),
                'var_objs': var_objs[:10],
                'html_snippet': html[:5000]
            })
    except Exception as e:
        print(f"Error fetching {name}: {e}")

with open('cashify_scraped_vivo.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)
print("\nSaved to cashify_scraped_vivo.json")
