import json
import re

with open('scratch/cashify_exact_sequences.json', 'r', encoding='utf-8') as f:
    brand_sequences = json.load(f)

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Parse INITIAL_MODELS from store.ts
models_match = re.search(r'export const INITIAL_MODELS: ModelData\[\] = (\[.*?\]);', content, re.DOTALL)
if not models_match:
    print("Could not find INITIAL_MODELS array in store.ts!")
    exit(1)

models_json_text = models_match.group(1)
try:
    models_data = json.loads(models_json_text)
except Exception as e:
    print(f"Error parsing JSON: {e}")
    exit(1)

print(f"Parsed {len(models_data)} models from store.ts")

# For each model, assign sortOrder based on its index in Cashify's sequence
for m in models_data:
    brand_slug = m.get('brandSlug', '')
    category = m.get('category', 'MOBILE')
    
    key = f"laptop_{brand_slug}" if category == 'LAPTOP' else brand_slug
    seq = brand_sequences.get(key, [])
    
    m_name = m.get('name', '').lower().replace('apple ', '').replace('samsung ', '').replace('google ', '').strip()
    m_slug = m.get('slug', '').lower()
    
    sort_idx = 9999
    for idx, item in enumerate(seq):
        item_clean = item.replace('-', ' ')
        if m_slug in item or item in m_slug or m_name in item_clean or item_clean in m_name:
            sort_idx = idx + 1
            break
            
    m['sortOrder'] = sort_idx

# Sort models_data by sortOrder ascending, then releaseYear descending
models_data.sort(key=lambda x: (x.get('sortOrder', 9999), -x.get('releaseYear', 2024)))

# Serialize back to TypeScript format
new_models_text = json.dumps(models_data, indent=2)

# Replace INITIAL_MODELS in store.ts
new_content = content[:models_match.start(1)] + new_models_text + content[models_match.end(1):]

with open('lib/store.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully assigned sortOrder and saved lib/store.ts!")
