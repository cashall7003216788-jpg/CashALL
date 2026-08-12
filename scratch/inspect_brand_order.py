import re
import json

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    content = f.read()

models = re.findall(r'\{\s*"id"\s*:\s*"([^"]+)"\s*,\s*"brandId"\s*:\s*"([^"]+)"\s*,\s*"brandSlug"\s*:\s*"samsung"\s*,\s*"name"\s*:\s*"([^"]+)"', content)

print("Samsung models in store.ts (first 20):")
for idx, (m_id, b_id, name) in enumerate(models[:25]):
    print(f"{idx+1}. {name}")
