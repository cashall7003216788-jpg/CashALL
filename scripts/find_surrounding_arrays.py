with open('lib/store.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines[:14000]):
    if 'const MOBILE_MODELS_PART' in l:
        print(f"Model array at line {i+1}: {l.strip()}")

for i, l in enumerate(lines[40000:46000], 40000):
    if 'const MOBILE_VARIANTS_PART' in l:
        print(f"Variant array at line {i+1}: {l.strip()}")
