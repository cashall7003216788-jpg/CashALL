import json
import re

with open('scratch/cashify_exact_sequences.json', 'r', encoding='utf-8') as f:
    sequences = json.load(f)

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    content = f.read()

existing_names = [n.lower() for n in re.findall(r'"name"\s*:\s*"([^"]+)"', content)]
existing_slugs = [s.lower() for s in re.findall(r'"slug"\s*:\s*"([^"]+)"', content)]

print("Auditing all Cashify scraped model sequences against CashALL store...")

missing_count = 0
for brand_key, seq in sequences.items():
    for item in seq:
        if "brands" in item or len(item) < 3:
            continue
        item_clean = item.replace('-', ' ').lower()
        found = any(item in s or s in item or item_clean in n for s, n in zip(existing_slugs, existing_names))
        if not found:
            missing_count += 1
            print(f"Missing from [{brand_key}]: {item}")

print(f"\nTotal Missing Models: {missing_count}")
