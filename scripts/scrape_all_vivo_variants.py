import urllib.request
import re
import json
import time

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'}

target_models = [
    {
        "name": "Vivo V50",
        "slug": "vivo-v50",
        "id": "m-vivo-vivo-v50",
        "cashify_slug": "used-vivo-v50",
        "releaseYear": 2025,
    },
    {
        "name": "Vivo V50e",
        "slug": "vivo-v50e",
        "id": "m-vivo-vivo-v50e",
        "cashify_slug": "used-vivo-v50e",
        "releaseYear": 2025,
    },
    {
        "name": "Vivo V60",
        "slug": "vivo-v60",
        "id": "m-vivo-vivo-v60",
        "cashify_slug": "used-vivo-v60",
        "releaseYear": 2025,
    },
    {
        "name": "Vivo V60e",
        "slug": "vivo-v60e",
        "id": "m-vivo-vivo-v60e",
        "cashify_slug": "used-vivo-v60e",
        "releaseYear": 2025,
    },
    {
        "name": "Vivo V70",
        "slug": "vivo-v70",
        "id": "m-vivo-vivo-v70",
        "cashify_slug": "used-vivo-v70",
        "releaseYear": 2026,
    },
    {
        "name": "Vivo V70 Elite",
        "slug": "vivo-v70-elite",
        "id": "m-vivo-vivo-v70-elite",
        "cashify_slug": "used-vivo-v70-elite-5g",
        "releaseYear": 2026,
    },
    {
        "name": "Vivo V70 FE",
        "slug": "vivo-v70-fe",
        "id": "m-vivo-vivo-v70-fe",
        "cashify_slug": "used-vivo-v70-fe",
        "releaseYear": 2026,
    },
]

collected = []

for m in target_models:
    main_url = f"https://www.cashify.in/sell-old-mobile-phone/{m['cashify_slug']}"
    print(f"\n=======================================================")
    print(f"Scraping {m['name']} from {main_url}")
    print(f"=======================================================")
    
    try:
        req = urllib.request.Request(main_url, headers=headers)
        with urllib.request.urlopen(req, timeout=12) as r:
            html = r.read().decode('utf-8')
            
        # 1. Image
        img_m = re.search(r'https://s3n[g]?\.cashify\.in/cashify/product/img/xhdpi/[a-zA-Z0-9_-]+\.(?:jpg|png|webp)', html)
        image_url = img_m.group(0) if img_m else None
        if image_url and '?w=' not in image_url:
            image_url += '?w=800'
        print(f"Image: {image_url}")
        
        # 2. Variant Links
        # Match any variant links in the page
        prefix = m['cashify_slug']
        v_links = re.findall(r'href="(/sell-old-mobile-phone/' + re.escape(prefix) + r'[^"]*-\d+-gb[^"]*)"', html, re.I)
        if not v_links:
            # try broader match
            v_links = re.findall(r'href="(/sell-old-mobile-phone/used-[^"]*(?:' + re.escape(m['slug']) + r'|' + re.escape(prefix) + r')[^"]*)"', html, re.I)
        v_links = list(dict.fromkeys(v_links)) # deduplicate
        print(f"Found {len(v_links)} variant links: {v_links}")
        
        variants = []
        for vl in v_links:
            v_url = f"https://www.cashify.in{vl}"
            time.sleep(0.5)
            try:
                v_req = urllib.request.Request(v_url, headers=headers)
                with urllib.request.urlopen(v_req, timeout=10) as vr:
                    v_html = vr.read().decode('utf-8')
                
                # Extract price
                # Look for ₹ xx,xxx
                prices = re.findall(r'₹\s*([0-9,]+)', v_html)
                # Clean price
                price_val = 0
                if prices:
                    price_val = int(prices[0].replace(',', ''))
                
                # Extract RAM and Storage from slug or HTML
                # slug e.g. used-vivo-v50-8-gb-128-gb
                # or used-vivo-v70-elite-5g-12-gb-512-gb
                slug_suffix = vl.replace(f"/sell-old-mobile-phone/{m['cashify_slug']}-", "")
                parts = slug_suffix.split('-')
                
                # Parse e.g. "8-gb-128-gb" or "12-gb-256-gb"
                ram_match = re.search(r'(\d+)\s*-?\s*gb\s*-?(\d+)\s*-?\s*(gb|tb)', slug_suffix, re.I)
                if ram_match:
                    ram = f"{ram_match.group(1)} GB"
                    storage = f"{ram_match.group(2)} {ram_match.group(3).upper()}"
                else:
                    # try alternative
                    ram = None
                    storage_m = re.search(r'(\d+)\s*-?\s*(gb|tb)', slug_suffix, re.I)
                    storage = f"{storage_m.group(1)} {storage_m.group(2).upper()}" if storage_m else "128 GB"
                
                print(f"  Variant {vl} -> RAM: {ram}, Storage: {storage}, Price: Rs.{price_val}")
                
                # Variant ID format used in store.ts:
                # v-m-vivo-vivo-v50-128-gb-8-gb
                storage_slug = storage.lower().replace(' ', '-')
                ram_slug = ram.lower().replace(' ', '-') if ram else ""
                var_id = f"v-{m['id']}-{storage_slug}"
                if ram_slug:
                    var_id += f"-{ram_slug}"
                
                variants.append({
                    "id": var_id,
                    "modelId": m['id'],
                    "storage": storage,
                    "ram": ram,
                    "basePrice": price_val,
                    "active": True
                })
            except Exception as ve:
                print(f"  Error fetching variant {vl}: {ve}")
        
        # If no variant links found via href, fallback to regex in main page
        if not variants:
            print("  Fallback parsing from main page...")
            # Matches like ('8 GB', '128 GB')
            vm = re.findall(r'(\d+\s*GB)\s*/\s*(\d+\s*GB|\d+\s*TB)', html)
            for r_val, s_val in set(vm):
                storage_slug = s_val.lower().replace(' ', '-')
                ram_slug = r_val.lower().replace(' ', '-')
                var_id = f"v-{m['id']}-{storage_slug}-{ram_slug}"
                variants.append({
                    "id": var_id,
                    "modelId": m['id'],
                    "storage": s_val,
                    "ram": r_val,
                    "basePrice": 20000,
                    "active": True
                })
                
        collected.append({
            "model": {
                "id": m['id'],
                "brandId": "b-vivo",
                "brandSlug": "vivo",
                "name": m['name'],
                "slug": m['slug'],
                "imageUrl": image_url,
                "releaseYear": m['releaseYear'],
                "popular": True,
                "active": True,
                "contactForPrice": False,
                "category": "MOBILE"
            },
            "variants": variants
        })
    except Exception as me:
        print(f"Error for {m['name']}: {me}")

with open('scraped_vivo_all.json', 'w', encoding='utf-8') as f:
    json.dump(collected, f, indent=2)

print("\n\nAll scraped data saved to scraped_vivo_all.json!")
