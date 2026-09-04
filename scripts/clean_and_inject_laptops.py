import json
import re

print("Loading scraped Dell, HP, Lenovo models...")
with open('scratch/dell_hp_lenovo_scraped.json', 'r', encoding='utf-8') as f:
    scraped = json.load(f)

dell_scraped = [s for s in scraped if s['brand'] == 'dell']
lenovo_scraped = [s for s in scraped if s['brand'] == 'lenovo']
print(f"Scraped pool: {len(dell_scraped)} Dell models, {len(lenovo_scraped)} Lenovo models.")

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    store_code = f.read()

# Let's inspect where "Sell Now" appears
lines = store_code.splitlines()
print(f"Total lines in store.ts: {len(lines)}")

# We will parse store.ts to find models that have "name": "Sell Now"
# In store.ts, models are in arrays like LAPTOP_MODELS_PART_1, LAPTOP_MODELS_PART_2
# Each model is an object spanning several lines:
# {
#   "id": "...",
#   "brandId": "...",
#   "brandSlug": "...",
#   "name": "Sell Now",
#   "slug": "sell-now-...",
#   "imageUrl": ...
# }

# Let's collect existing slugs to avoid collisions
existing_slugs = set(re.findall(r'"slug":\s*"([^"]+)"', store_code))

dell_idx = 0
lenovo_idx = 0
replaced_count = 0

new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    if '"name": "Sell Now"' in line:
        # We are inside a Sell Now model block!
        # Find start of object ({) and end (})
        start_obj = i
        while start_obj > 0 and '{' not in lines[start_obj]:
            start_obj -= 1
        
        end_obj = i
        while end_obj < len(lines) and '}' not in lines[end_obj]:
            end_obj += 1
            
        block_text = "\n".join(lines[start_obj:end_obj+1])
        is_dell = '"brandSlug": "dell"' in block_text or '"brandId": "b-dell"' in block_text
        is_lenovo = '"brandSlug": "lenovo"' in block_text or '"brandId": "b-lenovo"' in block_text
        
        candidate = None
        if is_dell:
            while dell_idx < len(dell_scraped):
                cand = dell_scraped[dell_idx]
                dell_idx += 1
                cand_slug = cand['slug'].lower()
                if cand_slug not in existing_slugs and 'sell-now' not in cand_slug:
                    candidate = cand
                    existing_slugs.add(cand_slug)
                    break
        elif is_lenovo:
            while lenovo_idx < len(lenovo_scraped):
                cand = lenovo_scraped[lenovo_idx]
                lenovo_idx += 1
                cand_slug = cand['slug'].lower()
                if cand_slug not in existing_slugs and 'sell-now' not in cand_slug:
                    candidate = cand
                    existing_slugs.add(cand_slug)
                    break
                    
        if candidate:
            b_slug = candidate['brand']
            m_slug = candidate['slug'].lower()
            m_name = candidate['name']
            m_img = candidate['image']
            m_id = f"m-laptop-{b_slug}-{m_slug}"
            
            # Reconstruct model block
            # Pop lines back to start_obj
            num_to_pop = len(new_lines) - start_obj
            for _ in range(num_to_pop):
                new_lines.pop()
                
            replacement_block = [
                '  {',
                f'    "id": "{m_id}",',
                f'    "brandId": "b-{b_slug}",',
                f'    "brandSlug": "{b_slug}",',
                f'    "name": "{m_name}",',
                f'    "slug": "{m_slug}",',
                f'    "imageUrl": "{m_img}",',
                '    "releaseYear": 2024,',
                '    "popular": true,',
                '    "active": true,',
                '    "contactForPrice": false,',
                '    "category": "LAPTOP"',
                '  }' + (',' if lines[end_obj].strip().endswith(',') else '')
            ]
            new_lines.extend(replacement_block)
            replaced_count += 1
            i = end_obj + 1
            continue
        else:
            # If no candidate, keep as is
            new_lines.append(line)
            i += 1
    else:
        new_lines.append(line)
        i += 1

print(f"Replaced {replaced_count} 'Sell Now' dummy models in store.ts!")

updated_code = "\n".join(new_lines)
with open('lib/store.ts', 'w', encoding='utf-8') as f:
    f.write(updated_code)

print("Saved updated store.ts successfully!")
