import json
import re
import os

DATASET_TXT = r'c:\Users\DELL\OneDrive\Desktop\CashALL\Cashify_Mobile_Phones_Dataset.txt'
REAL_IMAGES_JSON = r'c:\Users\DELL\OneDrive\Desktop\CashALL\real_cashify_images.json'
STORE_TS = r'c:\Users\DELL\OneDrive\Desktop\CashALL\lib\store.ts'
DATASET_JSON = r'c:\Users\DELL\OneDrive\Desktop\CashALL\dataset.json'
DATASET_JS = r'c:\Users\DELL\OneDrive\Desktop\CashALL\dataset.js'

BRAND_LOGOS = {
    "Apple": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/2e7cdc22-5a5f.jpg?w=200",
    "Xiaomi": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/cb96df6e-080f.jpg?w=200",
    "Samsung": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/406a512d-e8dd.jpg?w=200",
    "OnePlus": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/dfb6c340-010f.jpg?w=200",
    "Nokia": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/c94b79b6-4ff3.jpg?w=200",
    "POCO": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/8ef49258-00a8.jpg?w=200",
    "Vivo": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/20922c34-8afc.jpg?w=200",
    "OPPO": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/ac5c9a7b-76b5.jpg?w=200",
    "Realme": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/0124cc45-3a6c.jpg?w=200",
    "Motorola": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/1dcd7fda-0141.jpg?w=200",
    "Lenovo": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/a2f7c00e-6c61.jpg?w=200",
    "Honor": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/ee48df80-a6e5.jpg?w=200",
    "Asus": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/2b0475ae-1f48.jpg?w=200",
    "Google": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/e29a9970-137b.jpg?w=200",
    "LG": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/99464522-83b6.jpg?w=200",
    "Infinix": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/81729b28-c1e0.jpg?w=200",
    "Tecno": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/1f11e3b6-79ef.jpg?w=200",
    "iQOO": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/0c83a152-bf6d.jpg?w=200",
    "Nothing": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/8fa08e70-07bf.jpg?w=200"
}

def clean_slug(s):
    s = s.lower()
    s = re.sub(r'[^\w\s-]', '', s)
    s = re.sub(r'[\s_]+', '-', s)
    return s.strip('-')

def parse_price_num(price_str):
    num_str = re.sub(r'[^\d]', '', price_str)
    return int(num_str) if num_str else 0

def main():
    print("=== Step 1: Loading scraped real images map ===")
    real_images = {}
    if os.path.exists(REAL_IMAGES_JSON):
        with open(REAL_IMAGES_JSON, 'r', encoding='utf-8') as f:
            real_images = json.load(f)
    print(f"Loaded {len(real_images)} real image mappings.")

    print("\n=== Step 2: Parsing Cashify_Mobile_Phones_Dataset.txt ===")
    with open(DATASET_TXT, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    brand_names = [
        'APPLE', 'XIAOMI', 'SAMSUNG', 'ONEPLUS', 'NOKIA', 'POCO', 
        'VIVO', 'OPPO', 'REALME', 'MOTOROLA', 'LENOVO', 'HONOR', 
        'ASUS', 'GOOGLE', 'LG', 'INFINIX', 'TECNO', 'IQOO', 'NOTHING'
    ]

    models_raw = []
    c_brand = ""
    c_model = ""
    c_variants = []

    for line in lines:
        l = line.strip()
        if not l:
            continue
        
        if l in brand_names:
            c_brand = l
        elif l.startswith('MODEL:'):
            if c_model and c_variants:
                models_raw.append({
                    'brand': c_brand,
                    'model': c_model,
                    'variants': c_variants
                })
            c_model = l.replace('MODEL:', '').strip()
            c_variants = []
        elif l.startswith('Variant:'):
            v_name = l.replace('Variant:', '').strip()
            c_variants.append({'variant': v_name, 'price': ''})
        elif l.startswith('Cashify Price:'):
            p_val = l.replace('Cashify Price:', '').strip()
            if c_variants:
                c_variants[-1]['price'] = p_val

    if c_model and c_variants:
        models_raw.append({
            'brand': c_brand,
            'model': c_model,
            'variants': c_variants
        })

    print(f"Parsed {len(models_raw)} mobile models from dataset.txt!")

    brand_map = {
        'APPLE': ('Apple', 'apple'),
        'XIAOMI': ('Xiaomi', 'xiaomi'),
        'SAMSUNG': ('Samsung', 'samsung'),
        'ONEPLUS': ('OnePlus', 'oneplus'),
        'NOKIA': ('Nokia', 'nokia'),
        'POCO': ('POCO', 'poco'),
        'VIVO': ('Vivo', 'vivo'),
        'OPPO': ('OPPO', 'oppo'),
        'REALME': ('Realme', 'realme'),
        'MOTOROLA': ('Motorola', 'motorola'),
        'LENOVO': ('Lenovo', 'lenovo'),
        'HONOR': ('Honor', 'honor'),
        'ASUS': ('Asus', 'asus'),
        'GOOGLE': ('Google', 'google'),
        'LG': ('LG', 'lg'),
        'INFINIX': ('Infinix', 'infinix'),
        'TECNO': ('Tecno', 'tecno'),
        'IQOO': ('iQOO', 'iqoo'),
        'NOTHING': ('Nothing', 'nothing')
    }

    dataset_json_items = []
    store_models = []
    store_variants = []
    seen_model_ids = set()

    for idx, item in enumerate(models_raw, 1):
        raw_b = item['brand']
        b_name, b_slug = brand_map.get(raw_b, (raw_b.title(), clean_slug(raw_b)))
        
        m_name = item['model'].strip()
        m_slug = clean_slug(m_name)
        m_id = f"m-{b_slug}-{m_slug}"
        
        if m_id in seen_model_ids:
            m_id = f"{m_id}-{idx}"
        seen_model_ids.add(m_id)

        # Image resolution
        img_url = None
        if m_slug in real_images:
            img_url = real_images[m_slug]
        elif m_name.lower() in real_images:
            img_url = real_images[m_name.lower()]
        elif f"used-{m_slug}" in real_images:
            img_url = real_images[f"used-{m_slug}"]
        else:
            img_url = f"https://s3ng.cashify.in/cashify/product/img/xhdpi/{m_slug}.jpg?w=800"

        # Variants
        processed_vars = []
        for v in item['variants']:
            v_title = v['variant'].strip()
            p_str = v['price']
            p_num = parse_price_num(p_str)
            
            ram = None
            storage = v_title
            if '/' in v_title:
                parts = v_title.split('/')
                ram = parts[0].strip()
                storage = parts[1].strip()
            
            v_slug = clean_slug(v_title)
            v_id = f"v-{b_slug}-{m_slug}-{v_slug}"
            
            processed_vars.append({
                'id': v_id,
                'modelId': m_id,
                'name': v_title,
                'ram': ram,
                'storage': storage,
                'price': p_str,
                'priceNum': p_num,
                'basePrice': p_num,
                'active': True
            })

            store_variants.append({
                'id': v_id,
                'modelId': m_id,
                'ram': ram,
                'storage': storage,
                'basePrice': p_num,
                'active': True
            })

        prices = [v['priceNum'] for v in processed_vars if v['priceNum'] > 0]
        min_p = min(prices) if prices else 0
        max_p = max(prices) if prices else 0

        dataset_json_items.append({
            'id': idx,
            'brand': b_name,
            'brandSlug': b_slug,
            'model': m_name,
            'slug': m_slug,
            'minPrice': min_p,
            'maxPrice': max_p,
            'image': img_url,
            'brandLogo': BRAND_LOGOS.get(b_name, "https://s3ng.cashify.in/cashify/brand/img/xhdpi/2e7cdc22-5a5f.jpg?w=200"),
            'variants': processed_vars
        })

        is_popular = idx <= 15 or (b_slug in ['apple', 'samsung', 'oneplus'] and any(x in m_slug for x in ['iphone-15', 'iphone-14', 's24', 's23']))

        store_models.append({
            'id': m_id,
            'brandId': f"b-{b_slug}",
            'brandSlug': b_slug,
            'name': m_name,
            'slug': m_slug,
            'imageUrl': img_url,
            'releaseYear': 2024,
            'popular': is_popular,
            'active': True,
            'contactForPrice': False,
            'category': "MOBILE"
        })

    print(f"Total structured dataset models: {len(dataset_json_items)}")
    print(f"Total structured mobile store models: {len(store_models)}")
    print(f"Total structured mobile store variants: {len(store_variants)}")

    with open(DATASET_JSON, 'w', encoding='utf-8') as f:
        json.dump(dataset_json_items, f, indent=2)

    with open(DATASET_JS, 'w', encoding='utf-8') as f:
        f.write('const MOBILE_DATASET = ' + json.dumps(dataset_json_items, indent=2) + ';')

    print("Saved dataset.json and dataset.js successfully!")

    # Read original store.ts
    with open(STORE_TS, 'r', encoding='utf-8') as f:
        store_code = f.read()

    models_start = store_code.find("export const INITIAL_MODELS")
    variants_start = store_code.find("export const INITIAL_VARIANTS")
    questions_start = store_code.find("export const INITIAL_QUESTIONS")

    models_block = store_code[models_start:variants_start]
    variants_block = store_code[variants_start:questions_start]

    models_lines = models_block.splitlines()
    laptop_m_lines = [l.strip() for l in models_lines if any(k in l for k in ['"category": "LAPTOP"', "'category': 'LAPTOP'", 'm-dell-', 'm-hp-', 'm-acer-', 'm-microsof-', 'm-msi-', 'm-avita-', 'm-otherlap-'])]

    variants_lines = variants_block.splitlines()
    laptop_v_lines = [l.strip() for l in variants_lines if any(k in l for k in ['v-dell-', 'v-hp-', 'v-lenovo-yoga', 'v-lenovo-thinkpad', 'v-lenovo-ideapad', 'v-lenovo-legion', 'v-lenovo-loq', 'v-acer-', 'v-microsof-', 'v-msi-', 'v-avita-', 'v-otherlap-'])]

    print(f"Extracted {len(laptop_m_lines)} laptop models from store.ts.")
    print(f"Extracted {len(laptop_v_lines)} laptop variants from store.ts.")

    store_brands = [
        {"id": "b-apple", "name": "Apple", "slug": "apple", "logoUrl": BRAND_LOGOS["Apple"], "category": "BOTH", "sortOrder": 1, "active": True},
        {"id": "b-asus", "name": "Asus", "slug": "asus", "logoUrl": BRAND_LOGOS["Asus"], "category": "BOTH", "sortOrder": 2, "active": True},
        {"id": "b-google", "name": "Google", "slug": "google", "logoUrl": BRAND_LOGOS["Google"], "category": "MOBILE", "sortOrder": 3, "active": True},
        {"id": "b-honor", "name": "Honor", "slug": "honor", "logoUrl": BRAND_LOGOS["Honor"], "category": "MOBILE", "sortOrder": 4, "active": True},
        {"id": "b-infinix", "name": "Infinix", "slug": "infinix", "logoUrl": BRAND_LOGOS["Infinix"], "category": "MOBILE", "sortOrder": 5, "active": True},
        {"id": "b-iqoo", "name": "IQOO", "slug": "iqoo", "logoUrl": BRAND_LOGOS["iQOO"], "category": "MOBILE", "sortOrder": 6, "active": True},
        {"id": "b-lg", "name": "LG", "slug": "lg", "logoUrl": BRAND_LOGOS["LG"], "category": "BOTH", "sortOrder": 8, "active": True},
        {"id": "b-motorola", "name": "Motorola", "slug": "motorola", "logoUrl": BRAND_LOGOS["Motorola"], "category": "MOBILE", "sortOrder": 9, "active": True},
        {"id": "b-nokia", "name": "Nokia", "slug": "nokia", "logoUrl": BRAND_LOGOS["Nokia"], "category": "BOTH", "sortOrder": 10, "active": True},
        {"id": "b-nothing", "name": "Nothing", "slug": "nothing", "logoUrl": BRAND_LOGOS["Nothing"], "category": "MOBILE", "sortOrder": 11, "active": True},
        {"id": "b-oneplus", "name": "OnePlus", "slug": "oneplus", "logoUrl": BRAND_LOGOS["OnePlus"], "category": "MOBILE", "sortOrder": 12, "active": True},
        {"id": "b-oppo", "name": "OPPO", "slug": "oppo", "logoUrl": BRAND_LOGOS["OPPO"], "category": "MOBILE", "sortOrder": 13, "active": True},
        {"id": "b-poco", "name": "Poco", "slug": "poco", "logoUrl": BRAND_LOGOS["POCO"], "category": "MOBILE", "sortOrder": 14, "active": True},
        {"id": "b-realme", "name": "Realme", "slug": "realme", "logoUrl": BRAND_LOGOS["Realme"], "category": "BOTH", "sortOrder": 15, "active": True},
        {"id": "b-samsung", "name": "Samsung", "slug": "samsung", "logoUrl": BRAND_LOGOS["Samsung"], "category": "BOTH", "sortOrder": 16, "active": True},
        {"id": "b-tecno", "name": "Tecno", "slug": "tecno", "logoUrl": BRAND_LOGOS["Tecno"], "category": "MOBILE", "sortOrder": 17, "active": True},
        {"id": "b-vivo", "name": "Vivo", "slug": "vivo", "logoUrl": BRAND_LOGOS["Vivo"], "category": "MOBILE", "sortOrder": 18, "active": True},
        {"id": "b-xiaomi", "name": "Xiaomi", "slug": "xiaomi", "logoUrl": BRAND_LOGOS["Xiaomi"], "category": "BOTH", "sortOrder": 19, "active": True},
        {"id": "b-dell", "name": "Dell", "slug": "dell", "category": "LAPTOP", "sortOrder": 20, "active": True},
        {"id": "b-hp", "name": "HP", "slug": "hp", "category": "LAPTOP", "sortOrder": 21, "active": True},
        {"id": "b-lenovo", "name": "Lenovo", "slug": "lenovo", "logoUrl": BRAND_LOGOS["Lenovo"], "category": "BOTH", "sortOrder": 22, "active": True},
        {"id": "b-acer", "name": "Acer", "slug": "acer", "category": "LAPTOP", "sortOrder": 23, "active": True},
        {"id": "b-microsoft", "name": "Microsoft", "slug": "microsoft", "category": "LAPTOP", "sortOrder": 24, "active": True},
        {"id": "b-msi", "name": "MSI", "slug": "msi", "category": "LAPTOP", "sortOrder": 25, "active": True},
        {"id": "b-avita", "name": "AVITA", "slug": "avita", "category": "LAPTOP", "sortOrder": 26, "active": True},
        {"id": "b-other-laptop", "name": "Other Laptop", "slug": "other-laptop", "category": "LAPTOP", "sortOrder": 27, "active": True},
    ]

    prefix_code = store_code[:models_start]
    suffix_code = store_code[questions_start:]

    brands_ts = "export const INITIAL_BRANDS: BrandData[] = " + json.dumps(store_brands, indent=2) + ";\n\n"

    # Format Models into chunks of 400 to prevent TypeScript TS2590 union complexity limit
    chunk_size = 400
    models_chunks = [store_models[i:i + chunk_size] for i in range(0, len(store_models), chunk_size)]
    
    models_ts = ""
    chunk_names = []
    for idx, chunk in enumerate(models_chunks, 1):
        c_name = f"MOBILE_MODELS_PART_{idx}"
        chunk_names.append(c_name)
        models_ts += f"const {c_name}: DeviceModelData[] = [\n"
        for m in chunk:
            models_ts += "  " + json.dumps(m) + ",\n"
        models_ts += "];\n\n"

    models_ts += "const LAPTOP_MODELS: DeviceModelData[] = [\n"
    for lm_line in laptop_m_lines:
        models_ts += "  " + lm_line.rstrip(',') + ",\n"
    models_ts += "];\n\n"

    all_m_parts = ", ".join([f"...{cn}" for cn in chunk_names] + ["...LAPTOP_MODELS"])
    models_ts += f"export const INITIAL_MODELS: DeviceModelData[] = [{all_m_parts}];\n\n"

    # Format Variants into chunks of 400
    vars_chunks = [store_variants[i:i + chunk_size] for i in range(0, len(store_variants), chunk_size)]
    vars_ts = ""
    v_chunk_names = []
    for idx, chunk in enumerate(vars_chunks, 1):
        vc_name = f"MOBILE_VARIANTS_PART_{idx}"
        v_chunk_names.append(vc_name)
        vars_ts += f"const {vc_name}: DeviceVariantData[] = [\n"
        for v in chunk:
            clean_v = {k: val for k, val in v.items() if val is not None}
            vars_ts += "  " + json.dumps(clean_v) + ",\n"
        vars_ts += "];\n\n"

    vars_ts += "const LAPTOP_VARIANTS: DeviceVariantData[] = [\n"
    for lv_line in laptop_v_lines:
        vars_ts += "  " + lv_line.rstrip(',') + ",\n"
    vars_ts += "];\n\n"

    all_v_parts = ", ".join([f"...{vcn}" for vcn in v_chunk_names] + ["...LAPTOP_VARIANTS"])
    vars_ts += f"export const INITIAL_VARIANTS: DeviceVariantData[] = [{all_v_parts}];\n\n"

    prefix_clean = re.sub(r'export const INITIAL_BRANDS: BrandData\[\] = \[[\s\S]*?\];\s*', '', prefix_code)

    new_store_code = prefix_clean + brands_ts + models_ts + vars_ts + suffix_code

    with open(STORE_TS, 'w', encoding='utf-8') as f:
        f.write(new_store_code)

    print("Updated lib/store.ts successfully!")

if __name__ == '__main__':
    main()
