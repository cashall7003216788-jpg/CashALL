import re

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any blank or invalid array entries in MOBILE_MODELS_PART_1
content = re.sub(r',\s*,', ',', content)
content = re.sub(r'\[\s*,', '[', content)
content = re.sub(r',\s*\]', ']', content)

with open('lib/store.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleaned commas in store.ts!")
