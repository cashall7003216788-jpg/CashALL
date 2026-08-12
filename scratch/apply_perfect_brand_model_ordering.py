import re
import json

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Match models array items: {"id": "...", "brandId": "...", "brandSlug": "...", "name": "...", ...}
model_pattern = re.compile(r'(\{\s*"id"\s*:\s*"([^"]+)"\s*,\s*"brandId"\s*:\s*"([^"]+)"\s*,\s*"brandSlug"\s*:\s*"([^"]+)"\s*,\s*"name"\s*:\s*"([^"]+)"[^\}]+\})')

matches = list(model_pattern.finditer(content))

print(f"Found {len(matches)} model declarations in store.ts.")

def get_model_sort_score(b_slug, name):
    name_u = name.upper()
    
    # Extract number if any in model name
    nums = re.findall(r'\d+', name_u)
    num = int(nums[0]) if nums else 0
    
    tier_score = 0
    if 'ULTRA' in name_u: tier_score = 50
    elif 'PRO MAX' in name_u: tier_score = 45
    elif 'PRO' in name_u: tier_score = 40
    elif 'PLUS' in name_u or '+' in name_u: tier_score = 30
    elif 'FE' in name_u: tier_score = 20
    elif 'MINI' in name_u or 'LITE' in name_u: tier_score = 10
    
    if b_slug == 'samsung':
        # Series ranking: S Series (1), Z Series (2), Note Series (3), A Series (4), M Series (5), F Series (6)
        if 'GALAXY S' in name_u or ' S2' in name_u or ' S1' in name_u or ' S9' in name_u or ' S8' in name_u:
            series_rank = 1
        elif 'FOLD' in name_u or 'FLIP' in name_u or 'Z ' in name_u:
            series_rank = 2
        elif 'NOTE' in name_u:
            series_rank = 3
        elif 'GALAXY A' in name_u or ' A' in name_u:
            series_rank = 4
        elif 'GALAXY M' in name_u or ' M' in name_u:
            series_rank = 5
        elif 'GALAXY F' in name_u or ' F' in name_u:
            series_rank = 6
        else:
            series_rank = 7
        return (series_rank, -num, -tier_score, name)
        
    elif b_slug == 'apple':
        if '17' in name_u: gen = 17
        elif 'AIR' in name_u: gen = 16.5
        elif '16' in name_u: gen = 16
        elif '15' in name_u: gen = 15
        elif '14' in name_u: gen = 14
        elif '13' in name_u: gen = 13
        elif '12' in name_u: gen = 12
        elif '11' in name_u: gen = 11
        elif 'XS' in name_u: gen = 10.5
        elif 'XR' in name_u: gen = 10.2
        elif 'X' in name_u: gen = 10
        elif '8' in name_u: gen = 8
        elif '7' in name_u: gen = 7
        elif '6S' in name_u: gen = 6.5
        elif '6' in name_u: gen = 6
        elif 'SE' in name_u: gen = 5
        else: gen = 0
        return (1, -gen, -tier_score, name)
        
    elif b_slug == 'google':
        if 'PIXEL 9' in name_u: gen = 9
        elif 'PIXEL 8' in name_u: gen = 8
        elif 'PIXEL 7' in name_u: gen = 7
        elif 'PIXEL 6' in name_u: gen = 6
        elif 'PIXEL 5' in name_u: gen = 5
        elif 'PIXEL 4' in name_u: gen = 4
        elif 'PIXEL 3' in name_u: gen = 3
        else: gen = 0
        return (1, -gen, -tier_score, name)
        
    elif b_slug == 'oneplus':
        if 'OPEN' in name_u: series_rank = 1
        elif 'NORD' in name_u: series_rank = 3
        else: series_rank = 2
        return (series_rank, -num, -tier_score, name)
        
    elif b_slug == 'xiaomi':
        if 'XIAOMI' in name_u or 'MI ' in name_u: series_rank = 1
        elif 'NOTE' in name_u: series_rank = 2
        elif 'REDMI' in name_u: series_rank = 3
        else: series_rank = 4
        return (series_rank, -num, -tier_score, name)

    return (1, -num, -tier_score, name)

# Group matches by brandSlug
brand_items = {}
for m in matches:
    raw_str = m.group(1)
    b_slug = m.group(4)
    name = m.group(5)
    if b_slug not in brand_items:
        brand_items[b_slug] = []
    brand_items[b_slug].append((name, raw_str))

# Sort brand items
for b_slug in brand_items:
    brand_items[b_slug].sort(key=lambda item: get_model_sort_score(b_slug, item[0]))

print("Inspecting Samsung top 15 models after sorting:")
for idx, (name, _) in enumerate(brand_items['samsung'][:15]):
    print(f" {idx+1}. {name}")

# Now replace the model declarations in content brand block by brand block
# Rebuild store content
first_match_start = matches[0].start()
last_match_end = matches[-1].end()

# Assemble sorted model strings
sorted_model_blocks = []
for b_slug, items in brand_items.items():
    for name, raw_str in items:
        sorted_model_blocks.append(raw_str)

new_models_joined = ",\n  ".join(sorted_model_blocks)

# Replace in content
new_content = content[:first_match_start] + new_models_joined + content[last_match_end:]

with open('lib/store.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("\nSuccessfully re-ordered all brand models in lib/store.ts!")
