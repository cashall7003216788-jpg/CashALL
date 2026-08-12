import re
import json

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Match models array items: {"id": "...", "brandId": "...", "brandSlug": "...", "name": "...", ...}
model_pattern = re.compile(r'(\{\s*"id"\s*:\s*"([^"]+)"\s*,\s*"brandId"\s*:\s*"([^"]+)"\s*,\s*"brandSlug"\s*:\s*"([^"]+)"\s*,\s*"name"\s*:\s*"([^"]+)"[^\}]+\})')

matches = list(model_pattern.finditer(content))
print(f"Found {len(matches)} model declarations in store.ts.")

# Group matches by brandSlug
brand_items = {}
for m in matches:
    raw_str = m.group(1)
    b_slug = m.group(4)
    name = m.group(5)
    
    if b_slug not in brand_items:
        brand_items[b_slug] = []
    brand_items[b_slug].append((name, raw_str))

# Explicit Cashify model placement ranker
def get_exact_cashify_rank(b_slug, name):
    name_u = name.upper().strip()
    
    # Extract numbers for model ranking
    nums = re.findall(r'\d+', name_u)
    num = int(nums[0]) if nums else 0
    
    tier_rank = 0
    if 'PRO MAX' in name_u: tier_rank = 100
    elif 'ULTRA' in name_u: tier_rank = 95
    elif 'PRO' in name_u: tier_rank = 90
    elif 'PLUS' in name_u or '+' in name_u: tier_rank = 80
    elif 'FE' in name_u: tier_rank = 70
    elif 'MINI' in name_u: tier_rank = 60
    elif 'AIR' in name_u: tier_rank = 55
    elif 'LITE' in name_u: tier_rank = 50

    if b_slug == 'apple':
        # Apple exact generation sequence
        if 'IPHONE 17' in name_u: gen = 170
        elif 'IPHONE AIR' in name_u: gen = 165
        elif 'IPHONE 16' in name_u: gen = 160
        elif 'IPHONE 15' in name_u: gen = 150
        elif 'IPHONE 14' in name_u: gen = 140
        elif 'IPHONE 13' in name_u: gen = 130
        elif 'IPHONE 12' in name_u: gen = 120
        elif 'IPHONE 11' in name_u: gen = 110
        elif 'IPHONE XS' in name_u: gen = 105
        elif 'IPHONE XR' in name_u: gen = 102
        elif 'IPHONE X' in name_u: gen = 100
        elif 'IPHONE 8' in name_u: gen = 80
        elif 'IPHONE 7' in name_u: gen = 70
        elif 'IPHONE 6S' in name_u: gen = 65
        elif 'IPHONE 6' in name_u: gen = 60
        elif 'IPHONE SE' in name_u: gen = 50
        else: gen = 0
        
        # Lower score comes first in Python sort
        return (1, -gen, -tier_rank, name)

    elif b_slug == 'samsung':
        # Samsung Series sequence: S Series (1), Z Series (2), Note Series (3), A Series (4), M Series (5), F Series (6)
        if 'GALAXY S' in name_u or ' S2' in name_u or ' S1' in name_u or ' S9' in name_u or ' S8' in name_u:
            series = 1
        elif 'FOLD' in name_u or 'FLIP' in name_u or 'Z ' in name_u:
            series = 2
        elif 'NOTE' in name_u:
            series = 3
        elif 'GALAXY A' in name_u or ' A' in name_u:
            series = 4
        elif 'GALAXY M' in name_u or ' M' in name_u:
            series = 5
        elif 'GALAXY F' in name_u or ' F' in name_u:
            series = 6
        else:
            series = 7
        return (series, -num, -tier_rank, name)

    elif b_slug == 'google':
        if 'PIXEL 9' in name_u: gen = 9
        elif 'PIXEL 8' in name_u: gen = 8
        elif 'PIXEL 7' in name_u: gen = 7
        elif 'PIXEL 6' in name_u: gen = 6
        elif 'PIXEL 5' in name_u: gen = 5
        elif 'PIXEL 4' in name_u: gen = 4
        elif 'PIXEL 3' in name_u: gen = 3
        else: gen = 0
        return (1, -gen, -tier_rank, name)

    elif b_slug == 'oneplus':
        if 'OPEN' in name_u: series = 1
        elif 'NORD' in name_u: series = 3
        else: series = 2
        return (series, -num, -tier_rank, name)

    elif b_slug == 'xiaomi':
        if 'XIAOMI' in name_u or 'MI ' in name_u: series = 1
        elif 'NOTE' in name_u: series = 2
        elif 'REDMI' in name_u: series = 3
        else: series = 4
        return (series, -num, -tier_rank, name)

    # General rule for all other brands: Sort by number descending, tier descending
    return (1, -num, -tier_rank, name)

# Sort each brand
for b_slug in brand_items:
    brand_items[b_slug].sort(key=lambda item: get_exact_cashify_rank(b_slug, item[0]))

print("\n--- Apple Models Placement (First 25) ---")
for idx, (name, _) in enumerate(brand_items['apple'][:25]):
    print(f" {idx+1}. {name}")

print("\n--- Samsung Models Placement (First 25) ---")
for idx, (name, _) in enumerate(brand_items['samsung'][:25]):
    print(f" {idx+1}. {name}")

# Rebuild store.ts content
first_match_start = matches[0].start()
last_match_end = matches[-1].end()

sorted_model_blocks = []
for b_slug, items in brand_items.items():
    for name, raw_str in items:
        sorted_model_blocks.append(raw_str)

new_models_joined = ",\n  ".join(sorted_model_blocks)

new_content = content[:first_match_start] + new_models_joined + content[last_match_end:]

with open('lib/store.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("\nSuccessfully updated all brand model placement sequences in lib/store.ts!")
