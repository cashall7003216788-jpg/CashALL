import re

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    text = f.read()

target_models = ['vivo-v50', 'vivo-v50e', 'vivo-v60', 'vivo-v60e', 'vivo-v70', 'vivo-v70-elite', 'vivo-v70-fe']

print("=========================================================================")
print("          VERIFYING VIVO V50, V50e, V60, V60e, V70, V70 ELITE, V70 FE")
print("=========================================================================")

for slug in target_models:
    # Match model block
    m_match = re.search(r'\{\s*"id":\s*"([^"]+)",\s*"brandId":\s*"b-vivo",\s*(?:"brandSlug":\s*"vivo",\s*)?"name":\s*"([^"]+)",\s*"slug":\s*"' + re.escape(slug) + r'",\s*"imageUrl":\s*"([^"]+)",\s*"releaseYear":\s*(\d+)', text)
    if not m_match:
        print(f"FAILED TO FIND MODEL: {slug}")
        continue
    
    mid, name, img, year = m_match.groups()
    
    # Match variants
    var_pattern = r'\{\s*"id":\s*"([^"]+)",\s*"modelId":\s*"' + re.escape(mid) + r'",\s*"storage":\s*"([^"]+)",\s*"basePrice":\s*(\d+),\s*"active":\s*true(?:,\s*"ram":\s*"([^"]+)")?\s*\}'
    variants = re.findall(var_pattern, text)
    
    print(f"\n[MODEL] {name} ({slug}) - ID: {mid}, Year: {year}")
    print(f"  Image CDN: {img}")
    print(f"  Total Variants: {len(variants)}")
    for vid, storage, bp, ram in variants:
        spec = f"{ram} / {storage}" if ram else storage
        print(f"    * {spec.ljust(18)} -> Base Buyback Price: Rs. {int(bp):,}")
