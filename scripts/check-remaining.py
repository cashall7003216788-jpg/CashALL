with open('lib/store.ts', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'\{\s*"id":\s*"([^"]+)"[\s\S]*?"name":\s*"([^"]+)"[\s\S]*?"slug":\s*"([^"]+)"', text)
sell_nows = [m for m in matches if 'sell now' in m[1].lower() or 'sell-now' in m[2].lower()]
print(f"Remaining Sell Now entries: {len(sell_nows)}")
for m in sell_nows[:10]:
    print(" ", m)
