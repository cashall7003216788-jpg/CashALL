import re

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all model lines with brandSlug: "apple"
matches = re.findall(r'(\{[^\}]*"brandSlug"\s*:\s*"apple"[^\}]*\})', content)

print(f"Found {len(matches)} Apple model entries in store.ts:\n")
for idx, m in enumerate(matches, 1):
    id_match = re.search(r'"id"\s*:\s*"([^"]+)"', m)
    name_match = re.search(r'"name"\s*:\s*"([^"]+)"', m)
    m_id = id_match.group(1) if id_match else "?"
    name = name_match.group(1) if name_match else "?"
    print(f"{idx:2d}. ID: {m_id:35s} | Name: {name}")
