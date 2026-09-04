import re

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# find models and variants for V40, V30, V29
models = re.findall(r'(\{\s*"id":\s*"(m-vivo-[^"]+)",[\s\S]*?"name":\s*"([^"]+)",[\s\S]*?"slug":\s*"([^"]+)"[\s\S]*?\})', text)
print(f"Total models matched: {len(models)}")
for full, mid, name, slug in models:
    if 'v40' in slug or 'v30' in slug:
        print(f"MODEL: {mid} | {name} | {slug}")
        # print full block
        print(full)
        # find variants
        v_matches = re.findall(rf'(\{{\s*"id":\s*"[^"]*",\s*"modelId":\s*"{mid}"[\s\S]*?\}})', text)
        print(f"Variants count for {mid}: {len(v_matches)}")
        for vm in v_matches:
            print("  ", vm.replace('\n', ' '))
