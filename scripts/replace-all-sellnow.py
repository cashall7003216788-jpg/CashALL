import json

with open('scratch/dell_hp_lenovo_scraped.json', 'r', encoding='utf-8') as f:
    scraped = json.load(f)

dell_scraped = [s for s in scraped if s['brand'] == 'dell']
lenovo_scraped = [s for s in scraped if s['brand'] == 'lenovo']

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Collect existing non-sell-now slugs
existing_slugs = set()
for line in lines:
    if '"slug":' in line:
        s = line.split('"slug":')[1].split('"')[1].strip().lower()
        if 'sell-now' not in s:
            existing_slugs.add(s)

def build_model_lines(cand, brand):
    b_slug = brand
    m_slug = cand['slug'].lower()
    m_name = cand['name']
    m_img = cand['image']
    m_id = f"m-laptop-{b_slug}-{m_slug}"
    return [
        '  {\n',
        f'    "id": "{m_id}",\n',
        f'    "brandId": "b-{b_slug}",\n',
        f'    "brandSlug": "{b_slug}",\n',
        f'    "name": "{m_name}",\n',
        f'    "slug": "{m_slug}",\n',
        f'    "imageUrl": "{m_img}",\n',
        '    "releaseYear": 2024,\n',
        '    "popular": true,\n',
        '    "active": true,\n',
        '    "contactForPrice": false,\n',
        '    "category": "LAPTOP"\n',
        '  },\n'
    ]

# We need 15 unique Dell candidates
chosen_dell = []
for c in dell_scraped:
    cs = c['slug'].lower()
    if cs not in existing_slugs and cs not in [x['slug'].lower() for x in chosen_dell]:
        chosen_dell.append(c)
        if len(chosen_dell) == 15:
            break

# We need 30 unique Lenovo candidates
chosen_lenovo = []
for c in lenovo_scraped:
    cs = c['slug'].lower()
    if cs not in existing_slugs and cs not in [x['slug'].lower() for x in chosen_lenovo]:
        chosen_lenovo.append(c)
        if len(chosen_lenovo) == 30:
            break

print(f"Chosen Dell: {len(chosen_dell)}, Chosen Lenovo: {len(chosen_lenovo)}")

# If lenovo needs more candidates, supplement with standard series
if len(chosen_lenovo) < 30:
    fallback_lenovo = [
        {"name": "ThinkPad X1 Carbon Gen 11", "slug": "thinkpad-x1-carbon-gen-11", "image": "https://s3n.cashify.in/cashify/product/img/xhdpi/4834825a-7f10.jpg?w=800"},
        {"name": "ThinkPad T14s Gen 4", "slug": "thinkpad-t14s-gen-4", "image": "https://s3n.cashify.in/cashify/product/img/xhdpi/4834825a-7f10.jpg?w=800"},
        {"name": "ThinkPad E16 Gen 1", "slug": "thinkpad-e16-gen-1", "image": "https://s3n.cashify.in/cashify/product/img/xhdpi/4834825a-7f10.jpg?w=800"},
        {"name": "IdeaPad Slim 3 15IAH8", "slug": "ideapad-slim-3-15iah8", "image": "https://s3n.cashify.in/cashify/product/img/xhdpi/4aea27a3-37a0.jpg?w=800"},
        {"name": "IdeaPad Slim 5 14IRL8", "slug": "ideapad-slim-5-14irl8", "image": "https://s3n.cashify.in/cashify/product/img/xhdpi/4aea27a3-37a0.jpg?w=800"},
        {"name": "IdeaPad Gaming 3 15ACH6", "slug": "ideapad-gaming-3-15ach6", "image": "https://s3n.cashify.in/cashify/product/img/xhdpi/4aea27a3-37a0.jpg?w=800"},
        {"name": "Legion 7 16IRX9", "slug": "legion-7-16irx9", "image": "https://s3n.cashify.in/cashify/product/img/xhdpi/e6d9b0f6-b639.jpg?w=800"},
        {"name": "Yoga 9i 14IRH8", "slug": "yoga-9i-14irh8", "image": "https://s3n.cashify.in/cashify/product/img/xhdpi/2a0f95cb-6010.jpg?w=800"},
        {"name": "Yoga Book 9i Dual OLED", "slug": "yoga-book-9i-dual-oled", "image": "https://s3n.cashify.in/cashify/product/img/xhdpi/2a0f95cb-6010.jpg?w=800"},
        {"name": "ThinkBook 15 Gen 5", "slug": "thinkbook-15-gen-5", "image": "https://s3n.cashify.in/cashify/product/img/xhdpi/4834825a-7f10.jpg?w=800"}
    ]
    for fb in fallback_lenovo:
        if fb['slug'] not in existing_slugs and len(chosen_lenovo) < 30:
            chosen_lenovo.append(fb)

print(f"Final Chosen Dell: {len(chosen_dell)}, Chosen Lenovo: {len(chosen_lenovo)}")

# Now find each Sell Now block in lines and replace it
new_lines = []
i = 0
d_count = 0
l_count = 0

while i < len(lines):
    line = lines[i]
    if '"id": "m-laptop-dell-sell-now-' in line:
        # Find start of object '{'
        # In store.ts, line i-1 was '  {'
        if new_lines and new_lines[-1].strip() == '{':
            new_lines.pop()
        # skip to end of this object '  },' or '  }'
        while i < len(lines) and lines[i].strip() not in ['},', '}']:
            i += 1
        # i is at '},'
        i += 1 # skip '},'
        # append replacement
        if d_count < len(chosen_dell):
            new_lines.extend(build_model_lines(chosen_dell[d_count], 'dell'))
            d_count += 1
    elif '"id": "m-laptop-lenovo-sell-now-' in line:
        if new_lines and new_lines[-1].strip() == '{':
            new_lines.pop()
        while i < len(lines) and lines[i].strip() not in ['},', '}']:
            i += 1
        i += 1
        if l_count < len(chosen_lenovo):
            new_lines.extend(build_model_lines(chosen_lenovo[l_count], 'lenovo'))
            l_count += 1
    else:
        new_lines.append(line)
        i += 1

print(f"Replaced {d_count} Dell models and {l_count} Lenovo models!")

with open('lib/store.ts', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Saved clean store.ts!")
