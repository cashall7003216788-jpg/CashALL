import json
import re
import asyncio
from playwright.async_api import async_playwright

dataset_txt = r'c:\Users\DELL\OneDrive\Desktop\CashALL\Cashify_Mobile_Phones_Dataset.txt'

with open(dataset_txt, 'r', encoding='utf-8') as f:
    text = f.read()

brands_data = []
current_brand = None
current_model = None
current_variants = []

lines = text.splitlines()
i = 0

brand_names = [
    'APPLE', 'XIAOMI', 'SAMSUNG', 'ONEPLUS', 'NOKIA', 'POCO', 
    'VIVO', 'OPPO', 'REALME', 'MOTOROLA', 'LENOVO', 'HONOR', 
    'ASUS', 'GOOGLE', 'LG', 'INFINIX', 'TECNO', 'IQOO', 'NOTHING'
]

# We need to parse:
# BRAND header
# MODEL: <name>
# Variant: <v>
# Cashify Price: <p>

models_list = []
c_brand = ""
c_model = ""
c_variants = []

for line in lines:
    line_str = line.strip()
    if not line_str:
        continue
    
    if line_str in brand_names:
        c_brand = line_str
    elif line_str.startswith('MODEL:'):
        if c_model and c_variants:
            models_list.append({
                'brand': c_brand,
                'model': c_model,
                'variants': c_variants
            })
        c_model = line_str.replace('MODEL:', '').strip()
        c_variants = []
    elif line_str.startswith('Variant:'):
        variant_name = line_str.replace('Variant:', '').strip()
        c_variants.append({'variant': variant_name, 'price': ''})
    elif line_str.startswith('Cashify Price:'):
        price_val = line_str.replace('Cashify Price:', '').strip()
        if c_variants:
            c_variants[-1]['price'] = price_val

if c_model and c_variants:
    models_list.append({
        'brand': c_brand,
        'model': c_model,
        'variants': c_variants
    })

print(f"Parsed {len(models_list)} total models from dataset!")

# Clean model names to ensure NO launch year is present in any model title
def remove_launch_year(model_name):
    # Remove patterns like 2020, 2021, 2022, 2023, 2024, 2025, 2026 if attached as standalone year
    # But preserve model numbers like Note 11, S20, Note 20, Moto G71, etc.
    # We remove explicit 4-digit years like 2017..2026 at end of string or in parentheses
    model_clean = re.sub(r'\b(201[5-9]|202[0-9])\b', '', model_name)
    model_clean = re.sub(r'\s+', ' ', model_clean).strip()
    return model_clean

def parse_price_num(price_str):
    num_str = re.sub(r'[^\d]', '', price_str)
    return int(num_str) if num_str else 0

def clean_slug(s):
    s = s.lower()
    s = re.sub(r'[^\w\s-]', '', s)
    s = re.sub(r'[\s_]+', '-', s)
    return s.strip('-')

final_dataset = []
id_counter = 1

for item in models_list:
    brand = item['brand'].title()
    if brand == 'Iqoo':
        brand = 'iQOO'
    elif brand == 'Poco':
        brand = 'POCO'
    elif brand == 'Oppo':
        brand = 'OPPO'

    clean_model_title = remove_launch_year(item['model'])
    slug = 'used-' + clean_slug(item['model'])
    
    # Process variants
    processed_variants = []
    for v in item['variants']:
        p_str = v['price']
        p_num = parse_price_num(p_str)
        processed_variants.append({
            'name': v['variant'],
            'price': p_str,
            'priceNum': p_num
        })

    # Find min and max price for sorting
    prices = [v['priceNum'] for v in processed_variants if v['priceNum'] > 0]
    min_price = min(prices) if prices else 0
    max_price = max(prices) if prices else 0

    final_dataset.append({
        'id': id_counter,
        'brand': brand,
        'model': clean_model_title,
        'originalModelName': item['model'],
        'slug': slug,
        'minPrice': min_price,
        'maxPrice': max_price,
        'variants': processed_variants,
        'image': f"https://s3ng.cashify.in/cashify/product/img/xhdpi/{clean_slug(item['model'])}.jpg"
    })
    id_counter += 1

print(f"Total structured dataset items: {len(final_dataset)}")

with open(r'c:\Users\DELL\OneDrive\Desktop\CashALL\dataset.json', 'w', encoding='utf-8') as f:
    json.dump(final_dataset, f, indent=2)

with open(r'c:\Users\DELL\OneDrive\Desktop\CashALL\dataset.js', 'w', encoding='utf-8') as f:
    f.write('const MOBILE_DATASET = ' + json.dumps(final_dataset, indent=2) + ';')

print("Saved dataset.json and dataset.js successfully!")
