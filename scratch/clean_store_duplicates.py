import re

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    content = f.read()

model_pattern = re.compile(r'(\{\s*"id"\s*:\s*"([^"]+)"\s*,\s*"brandId"\s*:\s*"([^"]+)"\s*,\s*"brandSlug"\s*:\s*"([^"]+)"\s*,\s*"name"\s*:\s*"([^"]+)"\s*,\s*"slug"\s*:\s*"([^"]+)"[^\}]+\})')

seen_slugs = set()
duplicates = 0

def remove_duplicate(m):
    global duplicates
    full_str = m.group(1)
    slug = m.group(6)
    name = m.group(5)
    
    # Remove fictional S26 models if any
    if "S26" in name.upper():
        print(f"Purging fictional model: {name}")
        duplicates += 1
        return ""
        
    if slug in seen_slugs:
        print(f"Purging duplicate model slug: {slug} ({name})")
        duplicates += 1
        return ""
    seen_slugs.add(slug)
    return full_str

new_content = model_pattern.sub(remove_duplicate, content)
# Clean up any extra empty lines or double commas
new_content = re.sub(r',\s*,', ',', new_content)

with open('lib/store.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"\nRemoved {duplicates} duplicate/fictional models from store.ts.")
