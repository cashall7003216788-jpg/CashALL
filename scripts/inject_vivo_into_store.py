import json
import re

with open('scraped_vivo_all.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_models = [item['model'] for item in data]
new_variants = [v for item in data for v in item['variants']]

print(f"Total new models to insert: {len(new_models)}")
print(f"Total new variants to insert: {len(new_variants)}")

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Check if already present
for m in new_models:
    if f'"{m["id"]}"' in content:
        print(f"Warning: Model {m['id']} already present in store.ts!")

# Format new models code
models_code = ""
for m in new_models:
    models_code += f"""  {{
    "id": "{m['id']}",
    "brandId": "{m['brandId']}",
    "brandSlug": "{m['brandSlug']}",
    "name": "{m['name']}",
    "slug": "{m['slug']}",
    "imageUrl": "{m['imageUrl']}",
    "releaseYear": {m['releaseYear']},
    "popular": true,
    "active": true,
    "contactForPrice": false,
    "category": "MOBILE"
  }},
"""

# Format new variants code
variants_code = ""
for v in new_variants:
    ram_str = f',\n    "ram": "{v["ram"]}"' if v.get("ram") else ""
    variants_code += f"""  {{
    "id": "{v['id']}",
    "modelId": "{v['modelId']}",
    "storage": "{v['storage']}",
    "basePrice": {v['basePrice']},
    "active": true{ram_str}
  }},
"""

# 1. Insert models after m-vivo-vivo-t3-ultra block
target_model_str = '"id": "m-vivo-vivo-t3-ultra",'
target_pos = content.find(target_model_str)
if target_pos == -1:
    raise Exception("Could not find m-vivo-vivo-t3-ultra in store.ts")

# Find the closing bracket of m-vivo-vivo-t3-ultra
close_bracket_pos = content.find('  },', target_pos)
if close_bracket_pos == -1:
    raise Exception("Could not find closing bracket of m-vivo-vivo-t3-ultra")

insert_model_pos = close_bracket_pos + len('  },\n')
content = content[:insert_model_pos] + models_code + content[insert_model_pos:]
print("Successfully inserted models into store.ts!")

# 2. Insert variants after v-m-vivo-vivo-t3-ultra-256-gb-12-gb block
target_var_str = '"id": "v-m-vivo-vivo-t3-ultra-256-gb-12-gb",'
target_var_pos = content.find(target_var_str)
if target_var_pos == -1:
    raise Exception("Could not find v-m-vivo-vivo-t3-ultra-256-gb-12-gb in store.ts")

close_var_bracket_pos = content.find('  },', target_var_pos)
if close_var_bracket_pos == -1:
    raise Exception("Could not find closing bracket of t3-ultra variant")

insert_var_pos = close_var_bracket_pos + len('  },\n')
content = content[:insert_var_pos] + variants_code + content[insert_var_pos:]
print("Successfully inserted variants into store.ts!")

with open('lib/store.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("store.ts updated and saved successfully!")
