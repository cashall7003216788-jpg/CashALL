with open('lib/store.ts', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'm-vivo-vivo-v40' in line:
            print(f"v40 model at line {i+1}: {line.strip()}")
        if 'v-m-vivo-vivo-v40-128-gb' in line:
            print(f"v40 variant at line {i+1}: {line.strip()}")
