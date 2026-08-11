import json
import re

# Load scraped cashify model order
with open('scratch/cashify_ordered_models.json', 'r', encoding='utf-8') as f:
    cashify_catalog = json.load(f)

# Non-existent/fictional models to remove
FICTIONAL_MODEL_IDS = [
    "m-samsung-samsung-galaxy-s26-ultra",
    "m-samsung-samsung-galaxy-z-fold-7",
    "m-samsung-samsung-galaxy-z-fold-8-ultra",
    "m-google-google-pixel-10",
    "m-google-google-pixel-10-pro",
    "m-google-google-pixel-10-pro-fold",
    "m-google-google-pixel-10-pro-xl",
]

# Invalid variant IDs to remove
INVALID_VARIANT_IDS = [
    "v-pixel-9a-512", # Pixel 9a does not have 512GB
]

print("Reading lib/store.ts...")
with open('lib/store.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove fictional model lines from INITIAL_MODELS
for f_id in FICTIONAL_MODEL_IDS:
    pattern = rf'\s*\{{[^}}]*"id":\s*"{f_id}"[^}}]*\}},?\n?'
    content = re.sub(pattern, '', content)

# Remove invalid variant lines from INITIAL_VARIANTS
for v_id in INVALID_VARIANT_IDS:
    pattern = rf'\s*\{{[^}}]*"id":\s*"{v_id}"[^}}]*\}},?\n?'
    content = re.sub(pattern, '', content)

with open('lib/store.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully cleaned fictional models and invalid variants in lib/store.ts!")
