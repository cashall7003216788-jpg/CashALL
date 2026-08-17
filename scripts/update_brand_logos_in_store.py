import json
import re

with open('scratch/scraped_brand_logos.json', 'r', encoding='utf-8') as f:
    scraped_logos = json.load(f)

logo_map = {
    "apple": "https://s3n.cashify.in/cashify/brand/img/xhdpi/2e7cdc22-5a5f.jpg?w=200",
    "asus": "https://s3n.cashify.in/cashify/brand/img/xhdpi/bf25222a-a2a7.jpg?w=200",
    "google": "https://s3n.cashify.in/cashify/brand/img/xhdpi/dacc50a2-77a9.jpg?w=200",
    "honor": "https://s3n.cashify.in/cashify/brand/img/xhdpi/cfeaabff-69bf.jpg?w=200",
    "infinix": "https://s3n.cashify.in/cashify/brand/img/xhdpi/738cb1f1-7ddf.jpg?w=200",
    "iqoo": "https://s3n.cashify.in/cashify/brand/img/xhdpi/e1b13cbc-ef06.jpg?w=200",
    "lg": "https://s3n.cashify.in/cashify/brand/img/xhdpi/bdbdc48e-dd24.jpg?w=200",
    "motorola": "https://s3n.cashify.in/cashify/brand/img/xhdpi/1dcd7fda-0141.jpg?w=200",
    "nokia": "https://s3n.cashify.in/cashify/brand/img/xhdpi/fef4e5ae-6507.jpg?w=200",
    "nothing": "https://s3n.cashify.in/cashify/brand/img/xhdpi/06bc74db-4d38.jpg?w=200",
    "oneplus": "https://s3n.cashify.in/cashify/brand/img/xhdpi/dfb6c340-010f.jpg?w=200",
    "oppo": "https://s3n.cashify.in/cashify/brand/img/xhdpi/ac5c9a7b-76b5.jpg?w=200",
    "poco": "https://s3n.cashify.in/cashify/brand/img/xhdpi/3e072dc2-6d7b.jpg?w=200",
    "realme": "https://s3n.cashify.in/cashify/brand/img/xhdpi/0124cc45-3a6c.jpg?w=200",
    "samsung": "https://s3n.cashify.in/cashify/brand/img/xhdpi/406a512d-e8dd.jpg?w=200",
    "tecno": "https://s3n.cashify.in/cashify/brand/img/xhdpi/55424ad4-0400.jpg?w=200",
    "vivo": "https://s3n.cashify.in/cashify/brand/img/xhdpi/20922c34-8afc.jpg?w=200",
    "xiaomi": "https://s3n.cashify.in/cashify/brand/img/xhdpi/cb96df6e-080f.jpg?w=200",
    "lenovo": "https://s3n.cashify.in/cashify/brand/img/xhdpi/4834825a-7f10.jpg?w=200",
    "dell": "https://s3n.cashify.in/cashify/brand/img/xhdpi/d3b4fdda-2d57.jpg?w=200",
    "hp": "https://s3n.cashify.in/cashify/brand/img/xhdpi/f78db5fb-857c.jpg?w=200",
    "acer": "https://s3n.cashify.in/cashify/brand/img/xhdpi/2c350ab6-da4f.jpg?w=200",
    "microsoft": "https://s3n.cashify.in/cashify/brand/img/xhdpi/b00e17d8-fdd0.jpg?w=200",
    "msi": "https://s3n.cashify.in/cashify/brand/img/xhdpi/3e0e18bd-7fa2.jpg?w=200",
    "avita": "https://s3n.cashify.in/cashify/brand/img/xhdpi/8ae5b678-550c.jpg?w=200",
    "other-laptop": "https://s3n.cashify.in/cashify/brand/img/xhdpi/da0de74d-0f4d.jpg?w=200"
}

STORE_TS = r'c:\Users\DELL\OneDrive\Desktop\CashALL\lib\store.ts'
with open(STORE_TS, 'r', encoding='utf-8') as f:
    code = f.read()

# Extract INITIAL_BRANDS array using regex
brands_match = re.search(r'export const INITIAL_BRANDS: BrandData\[\] = (\[[\s\S]*?\]);', code)
if brands_match:
    raw_json = brands_match.group(1)
    brands = json.loads(raw_json)
    for b in brands:
        slug = b.get('slug', '').lower()
        if slug in logo_map:
            b['logoUrl'] = logo_map[slug]
    
    new_json_str = "export const INITIAL_BRANDS: BrandData[] = " + json.dumps(brands, indent=2) + ";"
    code = re.sub(r'export const INITIAL_BRANDS: BrandData\[\] = \[[\s\S]*?\];', new_json_str, code)

    with open(STORE_TS, 'w', encoding='utf-8') as f:
        f.write(code)

    print(f"Successfully injected official Cashify logo URLs into all {len(brands)} brands in lib/store.ts!")
else:
    print("Could not match INITIAL_BRANDS in store.ts")
