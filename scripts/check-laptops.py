import re
import json

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    text = f.read()

for brand in ['dell', 'hp', 'lenovo']:
    matches = re.findall(r'\{\s*"id":\s*"(m-laptop-' + brand + r'-[^"]+)"[\s\S]*?"name":\s*"([^"]+)"[\s\S]*?"imageUrl":\s*([^\n,]+)', text)
    print(f"=== {brand.upper()} ({len(matches)} entries) ===")
    for m in matches[:10]:
        print(" ", m)
