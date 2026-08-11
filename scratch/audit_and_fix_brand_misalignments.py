import re
import json

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Load INITIAL_BRANDS to get brand ID and slug map
brands = [
  {"id": "b-apple", "name": "Apple", "slug": "apple"},
  {"id": "b-samsung", "name": "Samsung", "slug": "samsung"},
  {"id": "b-oneplus", "name": "OnePlus", "slug": "oneplus"},
  {"id": "b-vivo", "name": "Vivo", "slug": "vivo"},
  {"id": "b-oppo", "name": "Oppo", "slug": "oppo"},
  {"id": "b-realme", "name": "Realme", "slug": "realme"},
  {"id": "b-xiaomi", "name": "Xiaomi", "slug": "xiaomi"},
  {"id": "b-google", "name": "Google", "slug": "google"},
  {"id": "b-poco", "name": "Poco", "slug": "poco"},
  {"id": "b-motorola", "name": "Motorola", "slug": "motorola"},
  {"id": "b-honor", "name": "Honor", "slug": "honor"},
  {"id": "b-infinix", "name": "Infinix", "slug": "infinix"},
  {"id": "b-iqoo", "name": "IQOO", "slug": "iqoo"},
  {"id": "b-tecno", "name": "Tecno", "slug": "tecno"},
  {"id": "b-lg", "name": "LG", "slug": "lg"},
  {"id": "b-lenovo", "name": "Lenovo", "slug": "lenovo"},
  {"id": "b-nokia", "name": "Nokia", "slug": "nokia"},
  {"id": "b-asus", "name": "Asus", "slug": "asus"},
  {"id": "b-nothing", "name": "Nothing", "slug": "nothing"},
  # Laptops
  {"id": "b-dell", "name": "Dell", "slug": "dell"},
  {"id": "b-hp-compaq", "name": "HP", "slug": "hp-compaq"},
  {"id": "b-acer", "name": "Acer", "slug": "acer"},
  {"id": "b-msi", "name": "MSI", "slug": "msi"},
  {"id": "b-microsoft", "name": "Microsoft", "slug": "microsoft"},
  {"id": "b-avita", "name": "AVITA", "slug": "avita"},
  {"id": "b-other-laptop", "name": "Other Laptop", "slug": "other-laptop"}
]

brand_by_slug = {b['slug']: b for b in brands}

def determine_correct_brand(name, category):
    name_lower = name.lower()
    
    if "apple" in name_lower or "iphone" in name_lower or "macbook" in name_lower:
        return brand_by_slug['apple']
    if "samsung" in name_lower or "galaxy" in name_lower:
        return brand_by_slug['samsung']
    if "google" in name_lower or "pixel" in name_lower:
        return brand_by_slug['google']
    if "oneplus" in name_lower:
        return brand_by_slug['oneplus']
    if "poco" in name_lower:
        return brand_by_slug['poco']
    if "xiaomi" in name_lower or "redmi" in name_lower or "mi " in name_lower:
        return brand_by_slug['xiaomi']
    if "iqoo" in name_lower:
        return brand_by_slug['iqoo']
    if "vivo" in name_lower:
        return brand_by_slug['vivo']
    if "oppo" in name_lower:
        return brand_by_slug['oppo']
    if "realme" in name_lower:
        return brand_by_slug['realme']
    if "motorola" in name_lower or "moto " in name_lower:
        return brand_by_slug['motorola']
    if "honor" in name_lower:
        return brand_by_slug['honor']
    if "infinix" in name_lower:
        return brand_by_slug['infinix']
    if "tecno" in name_lower:
        return brand_by_slug['tecno']
    if "lg " in name_lower or name_lower.startswith("lg"):
        return brand_by_slug['lg']
    if "lenovo" in name_lower or "thinkpad" in name_lower or "ideapad" in name_lower or "yoga" in name_lower or "legion" in name_lower:
        return brand_by_slug['lenovo']
    if "nokia" in name_lower:
        return brand_by_slug['nokia']
    if "asus" in name_lower or "zenbook" in name_lower or "vivobook" in name_lower or "rog" in name_lower or "tuf" in name_lower:
        return brand_by_slug['asus']
    if "nothing" in name_lower:
        return brand_by_slug['nothing']
    if "dell" in name_lower or "alienware" in name_lower or "inspiron" in name_lower or "latitude" in name_lower or "vostro" in name_lower or "xps" in name_lower:
        return brand_by_slug['dell']
    if "hp" in name_lower or "pavilion" in name_lower or "envy" in name_lower or "spectre" in name_lower or "omen" in name_lower:
        return brand_by_slug['hp-compaq']
    if "acer" in name_lower or "predator" in name_lower or "nitro" in name_lower or "swift" in name_lower or "aspire" in name_lower:
        return brand_by_slug['acer']
    if "msi" in name_lower:
        return brand_by_slug['msi']
    if "surface" in name_lower or "microsoft" in name_lower:
        return brand_by_slug['microsoft']
    if "avita" in name_lower:
        return brand_by_slug['avita']
        
    return None

# Find all model entries in store.ts
# Match JSON objects like {"id": "m-...", "brandId": "...", ...}
model_pattern = re.compile(r'(\{\s*"id"\s*:\s*"m-[^"]+"\s*,\s*"brandId"\s*:\s*"[^"]+"\s*,\s*"brandSlug"\s*:\s*"[^"]+"\s*,\s*"name"\s*:\s*"([^"]+)"[^\}]+\})')

corrections_made = 0

def replace_model(match):
    global corrections_made
    full_obj_str = match.group(1)
    name = match.group(2)
    
    cat = "LAPTOP" if "laptop" in full_obj_str.lower() else "MOBILE"
    correct_brand = determine_correct_brand(name, cat)
    
    if correct_brand:
        # Check current brandId/brandSlug in this string
        curr_brand_id_match = re.search(r'"brandId"\s*:\s*"([^"]+)"', full_obj_str)
        curr_brand_slug_match = re.search(r'"brandSlug"\s*:\s*"([^"]+)"', full_obj_str)
        
        curr_b_id = curr_brand_id_match.group(1) if curr_brand_id_match else ""
        curr_b_slug = curr_brand_slug_match.group(1) if curr_brand_slug_match else ""
        
        if curr_b_id != correct_brand['id'] or curr_b_slug != correct_brand['slug']:
            print(f"Misalignment found: '{name}' was under brand '{curr_b_slug}'. Correcting to '{correct_brand['slug']}'")
            corrections_made += 1
            new_obj_str = re.sub(r'"brandId"\s*:\s*"[^"]+"', f'"brandId": "{correct_brand["id"]}"', full_obj_str)
            new_obj_str = re.sub(r'"brandSlug"\s*:\s*"[^"]+"', f'"brandSlug": "{correct_brand["slug"]}"', new_obj_str)
            # Also update ID prefix if it starts with m-[oldbrand]-
            new_obj_str = re.sub(r'"id"\s*:\s*"m-[a-z0-9\-]+-', f'"id": "m-{correct_brand["slug"]}-', new_obj_str)
            return new_obj_str
            
    return full_obj_str

new_content = model_pattern.sub(replace_model, content)

print(f"\nTotal corrections made: {corrections_made}")

with open('lib/store.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated lib/store.ts successfully!")
