with open('lib/store.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

sell_now_indices = []
for idx, line in enumerate(lines):
    if '"name": "Sell Now"' in line:
        sell_now_indices.append(idx)

print(f"Total 'Sell Now' entries: {len(sell_now_indices)}")
for idx in sell_now_indices:
    id_line = lines[idx - 3].strip()
    brand_line = lines[idx - 1].strip()
    slug_line = lines[idx + 1].strip()
    print(f"Line {idx+1}: {id_line} | {brand_line} | {slug_line}")
