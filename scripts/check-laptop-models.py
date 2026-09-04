import re

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    text = f.read()

sell_now_matches = re.findall(r'\{[^{}]*Sell Now[^{}]*\}', text)
print(f"Found {len(sell_now_matches)} 'Sell Now' blocks in store.ts:")
for m in sell_now_matches[:10]:
    print(m)
