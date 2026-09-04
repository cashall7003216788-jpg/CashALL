with open('lib/store.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

sell_now_lines = []
for idx, line in enumerate(lines):
    if '"name": "Sell Now"' in line or '"slug": "sell-now' in line:
        sell_now_lines.append((idx + 1, line.strip()))

print(f"Total matching lines: {len(sell_now_lines)}")
for l in sell_now_lines[:15]:
    print(l)
