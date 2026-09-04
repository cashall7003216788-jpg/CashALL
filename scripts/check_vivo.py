import re

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# find where MOBILE_MODELS_PART starts
for p in range(1, 5):
    pos = text.find(f"MOBILE_MODELS_PART_{p}")
    print(f"MOBILE_MODELS_PART_{p} at {pos}")

matches = re.findall(r'\{\s*"id":\s*"(m-[^"]+)",\s*"brandId":\s*"b-vivo",\s*(?:"brandSlug":\s*"vivo",\s*)?"name":\s*"([^"]+)",\s*"slug":\s*"([^"]+)"', text)
print(f"Total Vivo models: {len(matches)}")
for mid, name, slug in matches:
    if 'v' in name.lower() and any(c.isdigit() for c in name):
        print(f"{mid} | {name} | {slug}")
