import json
import re

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    store_text = f.read()

with open('scratch/dell_hp_lenovo_scraped.json', 'r', encoding='utf-8') as f:
    scraped = json.load(f)

print(f"Scraped available: {len(scraped)}")
dell_scraped = [s for s in scraped if s['brand'] == 'dell']
lenovo_scraped = [s for s in scraped if s['brand'] == 'lenovo']
print(f"Dell scraped: {len(dell_scraped)}, Lenovo scraped: {len(lenovo_scraped)}")

# Find all "Sell Now" in store.ts
sell_now_matches = re.findall(r'\{\s*"id":\s*"([^"]+)"[\s\S]*?"name":\s*"Sell Now"[\s\S]*?"slug":\s*"([^"]+)"', store_text)
print(f"Found {len(sell_now_matches)} 'Sell Now' entries in store.ts")
for m in sell_now_matches[:5]:
    print(" ", m)
