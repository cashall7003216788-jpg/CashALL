import re
import json

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Match models array items in MOBILE_MODELS_PART_1
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

# Cashify placing order helper: Sort naturally by name (Natural Alphabetical Order)
# For Apple: iPhone 6, 6 Plus, 6s, 6s Plus, 7, 7 Plus, 8, 8 Plus, X, XR, XS, XS Max, 11, 11 Pro, 12, 13, 14, 15, 16, 17...
def cashify_sort_key(name):
    # Extract numbers and text for natural alphanumeric sorting matching Cashify
    name_clean = name.replace('Apple ', '').replace('Samsung ', '').replace('Xiaomi ', '').replace('OnePlus ', '')
    tokens = re.split(r'(\d+)', name_clean)
    key = []
    for t in tokens:
        if t.isdigit():
            key.append(int(t))
        else:
            key.append(t.lower())
    return key

# Re-sort brand items using exact Cashify placing order
for b_slug in brand_items:
    brand_items[b_slug].sort(key=lambda item: cashify_sort_key(item[0]))

print("\nInspecting Samsung top 20 models after Cashify placing order sync:")
for idx, (name, _) in enumerate(brand_items['samsung'][:20]):
    print(f" {idx+1}. {name}")

print("\nInspecting Apple top 20 models after Cashify placing order sync:")
for idx, (name, _) in enumerate(brand_items['apple'][:20]):
    print(f" {idx+1}. {name}")

# Rebuild store content
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

print("\nSuccessfully updated all brand model placing orders in lib/store.ts matching Cashify!")
