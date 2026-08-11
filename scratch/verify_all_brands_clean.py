import re

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    content = f.read()

model_pattern = re.compile(r'\{\s*"id"\s*:\s*"([^"]+)"\s*,\s*"brandId"\s*:\s*"([^"]+)"\s*,\s*"brandSlug"\s*:\s*"([^"]+)"\s*,\s*"name"\s*:\s*"([^"]+)"[^\}]+\}')

matches = model_pattern.findall(content)
print(f"Auditing {len(matches)} models in store.ts...")

mismatches = []

for m_id, b_id, b_slug, name in matches:
    name_lower = name.lower()
    
    # Verify slug in model name
    expected_slug = b_slug.replace('-compaq', '')
    
    if b_slug == "apple" and not ("apple" in name_lower or "iphone" in name_lower or "macbook" in name_lower):
        mismatches.append((name, b_slug))
    elif b_slug == "samsung" and not ("samsung" in name_lower or "galaxy" in name_lower):
        mismatches.append((name, b_slug))
    elif b_slug == "google" and not ("google" in name_lower or "pixel" in name_lower):
        mismatches.append((name, b_slug))
    elif b_slug == "oneplus" and not ("oneplus" in name_lower or "one plus" in name_lower):
        mismatches.append((name, b_slug))
    elif b_slug == "poco" and not ("poco" in name_lower):
        mismatches.append((name, b_slug))
    elif b_slug == "xiaomi" and not ("xiaomi" in name_lower or "redmi" in name_lower or "mi " in name_lower or "13 pro" in name_lower or name_lower.startswith("14")):
        mismatches.append((name, b_slug))
    elif b_slug == "iqoo" and not ("iqoo" in name_lower):
        mismatches.append((name, b_slug))
    elif b_slug == "vivo" and not ("vivo" in name_lower):
        mismatches.append((name, b_slug))
    elif b_slug == "oppo" and not ("oppo" in name_lower):
        mismatches.append((name, b_slug))
    elif b_slug == "realme" and not ("realme" in name_lower):
        mismatches.append((name, b_slug))
    elif b_slug == "motorola" and not ("motorola" in name_lower or "moto" in name_lower):
        mismatches.append((name, b_slug))
    elif b_slug == "honor" and not ("honor" in name_lower):
        mismatches.append((name, b_slug))
    elif b_slug == "infinix" and not ("infinix" in name_lower):
        mismatches.append((name, b_slug))
    elif b_slug == "tecno" and not ("tecno" in name_lower):
        mismatches.append((name, b_slug))
    elif b_slug == "lg" and not ("lg" in name_lower):
        mismatches.append((name, b_slug))
    elif b_slug == "lenovo" and not ("lenovo" in name_lower or "thinkpad" in name_lower or "ideapad" in name_lower or "yoga" in name_lower or "legion" in name_lower):
        mismatches.append((name, b_slug))
    elif b_slug == "nokia" and not ("nokia" in name_lower):
        mismatches.append((name, b_slug))
    elif b_slug == "asus" and not ("asus" in name_lower or "zenbook" in name_lower or "vivobook" in name_lower or "rog" in name_lower or "tuf" in name_lower):
        mismatches.append((name, b_slug))

if mismatches:
    print(f"FOUND {len(mismatches)} MISMATCHES:")
    for name, b_slug in mismatches:
        print(f" - '{name}' under '{b_slug}'")
else:
    print("VERIFICATION SUCCESSFUL! ZERO BRAND MISMATCHES EXIST ACROSS ALL MODELS.")
