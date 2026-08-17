import json
import re
import os

DATASET_TXT = r'c:\Users\DELL\OneDrive\Desktop\CashALL\dataset used\Cashify_Mobile_Phones_Dataset.txt'
REAL_IMAGES_JSON = r'c:\Users\DELL\OneDrive\Desktop\CashALL\dataset used\real_cashify_images.json'
STORE_TS = r'c:\Users\DELL\OneDrive\Desktop\CashALL\lib\store.ts'
DATASET_JSON = r'c:\Users\DELL\OneDrive\Desktop\CashALL\dataset used\dataset.json'
DATASET_JS = r'c:\Users\DELL\OneDrive\Desktop\CashALL\dataset used\dataset.js'

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

def clean_model_title(name):
    name = re.sub(r'\s*\(\d+\s*GB[^\)]*\)', '', name, flags=re.I)
    name = re.sub(r'\s*\b(201[5-9]|202[0-9])\b', '', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def natural_sort_key(item):
    name = item['model']
    brand = item['brand']
    order_map = {
        'x': 9.5, 'xr': 9.6, 'xs': 9.7,
        'air': 16.5,
    }
    tokens = []
    for token in re.split(r'(\d+|\b[A-Za-z]+\b)', name):
        t_low = token.lower().strip()
        if not t_low:
            continue
        if token.isdigit():
            tokens.append((0, float(int(token))))
        elif t_low in order_map:
            tokens.append((0, float(order_map[t_low])))
        else:
            tokens.append((1, t_low))
    return (brand, tokens)

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

    # Deduplicate model titles & sort in ascending order (prioritizing real scraped variants over 'Standard')
    merged_models = {}
    for item in models_raw:
        b = item['brand']
        c_m = clean_model_title(item['model'])
        key = (b, c_m)
        if key not in merged_models:
            merged_models[key] = {
                'brand': b,
                'model': c_m,
                'variants': []
            }
        for v in item['variants']:
            v_title = (v.get('variant') or v.get('name') or '').strip()
            if v_title == 'Standard' and len(merged_models[key]['variants']) > 0:
                continue
            existing_titles = [(x.get('variant') or x.get('name') or '').strip() for x in merged_models[key]['variants']]
            if v_title not in existing_titles:
                if v_title != 'Standard':
                    merged_models[key]['variants'] = [x for x in merged_models[key]['variants'] if (x.get('variant') or x.get('name') or '').strip() != 'Standard']
                merged_models[key]['variants'].append(v)

    models_raw = list(merged_models.values())
    models_raw.sort(key=natural_sort_key)

    print(f"Parsed & ascending sorted {len(models_raw)} unique mobile models from dataset.txt!")

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

        # Image resolution matching real Cashify S3 CDN images
        img_url = None
        candidates = [
            m_slug,
            m_name.lower(),
            f"{b_slug}-{m_slug}",
            f"{b_name.lower()} {m_name.lower()}",
            clean_slug(f"{b_name} {m_name}"),
            clean_slug(m_name),
            f"used-{m_slug}",
            f"sell-old-{m_slug}",
        ]
        base_name = re.sub(r'\s*(5g|4g|3g|edition|prime|pro|lite)\b', '', m_name, flags=re.I).strip()
        candidates.append(base_name.lower())
        candidates.append(clean_slug(base_name))
        candidates.append(f"{b_slug}-{clean_slug(base_name)}")

        for cand in candidates:
            if cand in real_images and real_images[cand] and 'builder' not in real_images[cand]:
                img_url = real_images[cand]
                break

        if not img_url:
            clean_tokens = [t for t in re.split(r'[^a-z0-9]', m_name.lower()) if t and t not in [b_slug.lower(), 'samsung', 'apple', 'xiaomi', 'realme', 'oppo', 'vivo', 'oneplus', 'poco', 'motorola', '5g', '4g', 'phone', 'mobile']]
            if clean_tokens:
                core_key = clean_tokens[0]
                for rk, rval in real_images.items():
                    if rval and 'builder' not in rval and b_slug.lower() in rk and core_key in rk:
                        img_url = rval
                        break

        if not img_url:
            img_url = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"

        # Filter out 'Standard' and duplicate brand names from variants
        raw_variants = []
        for v in item['variants']:
            v_title = (v.get('variant') or v.get('name') or '').strip()
            if v_title != 'Standard' and not v_title.startswith(raw_b):
                raw_variants.append(v)

        if len(raw_variants) == 0:
            base_price_num = 0
            for v in item['variants']:
                p_str = str(v.get('price') or v.get('priceNum') or '')
                nums = re.findall(r'\d+', p_str.replace(',', ''))
                if nums:
                    base_price_num = max(base_price_num, int(''.join(nums)))
            if base_price_num == 0:
                base_price_num = 12500

            name_low = m_name.lower()
            base_p = max(base_price_num, 1500)

            # Category 1: Ultra / Pro Max / Fold / 1TB flagships
            if any(k in name_low for k in ['ultra', 'pro max', 'fold', '1tb']):
                p256 = base_p
                p512 = base_p + 480
                p1tb = base_p + 580
                raw_variants = [
                    {'variant': '256 GB', 'price': f"₹{p256:,}"},
                    {'variant': '512 GB', 'price': f"₹{p512:,}"},
                    {'variant': '1 TB', 'price': f"₹{p1tb:,}"}
                ]
            # Category 2: Modern Pro / Plus / High-end flagships
            elif any(k in name_low for k in ['pro', 'plus', 'flip', 'magic', 'find x', 's24', 's23', 's22', 's21', 'pixel 9', 'pixel 8', 'pixel 7', 'iphone 16', 'iphone 15', 'iphone 14', 'iphone 13', 'iphone 12']):
                p128 = base_p
                p256 = base_p + 480
                p512 = base_p + 960
                raw_variants = [
                    {'variant': '128 GB', 'price': f"₹{p128:,}"},
                    {'variant': '256 GB', 'price': f"₹{p256:,}"},
                    {'variant': '512 GB', 'price': f"₹{p512:,}"}
                ]
            # Category 3: Mid-range RAM/Storage phones (5G, A-series, M-series, Redmi Note, Nord, Vivo V/Y, OPPO Reno/A, Realme GT)
            elif any(k in name_low for k in ['5g', 'note', 'nord', 'reno', 'gt', 'neo', 'pova', 'spark', 'camon', 'zero', 'hot', 'narzo', 'a5', 'a7', 'm3', 'm5', 'f2', 'x5', 'x6']):
                p1 = base_p
                p2 = base_p + 350
                p3 = base_p + 700
                p4 = base_p + 1100
                raw_variants = [
                    {'variant': '6 GB/128 GB', 'price': f"₹{p1:,}"},
                    {'variant': '8 GB/128 GB', 'price': f"₹{p2:,}"},
                    {'variant': '8 GB/256 GB', 'price': f"₹{p3:,}"},
                    {'variant': '12 GB/256 GB', 'price': f"₹{p4:,}"}
                ]
            # Category 4: Standard Storage phones
            elif any(k in name_low for k in ['iphone', 'pixel', 'galaxy', 'xiaomi']):
                p64 = base_p
                p128 = base_p + 450
                p256 = base_p + 900
                raw_variants = [
                    {'variant': '64 GB', 'price': f"₹{p64:,}"},
                    {'variant': '128 GB', 'price': f"₹{p128:,}"},
                    {'variant': '256 GB', 'price': f"₹{p256:,}"}
                ]
            # Category 5: Budget / Entry level phones
            else:
                p1 = base_p
                p2 = base_p + 300
                p3 = base_p + 600
                raw_variants = [
                    {'variant': '4 GB/64 GB', 'price': f"₹{p1:,}"},
                    {'variant': '4 GB/128 GB', 'price': f"₹{p2:,}"},
                    {'variant': '6 GB/128 GB', 'price': f"₹{p3:,}"}
                ]

        # Variants
        processed_vars = []
        for v in raw_variants:
            v_title = (v.get('variant') or v.get('name') or '').strip()
            p_str = str(v.get('price') or v.get('priceNum') or '')
            p_num = parse_price_num(p_str)
            if p_num == 0:
                p_num = 12500
                p_str = "₹12,500"
            
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

    # Read pristine store.ts from git HEAD or disk
    import subprocess
    try:
        store_code = subprocess.check_output(['git', 'show', 'HEAD:lib/store.ts'], text=True, encoding='utf-8')
    except Exception:
        with open(STORE_TS, 'r', encoding='utf-8') as f:
            store_code = f.read()

    models_start = store_code.find("export const INITIAL_MODELS")
    variants_start = store_code.find("export const INITIAL_VARIANTS")
    questions_start = store_code.find("export const INITIAL_QUESTIONS")

    laptop_m_lines = [l.strip() for l in store_code.splitlines() if (l.strip().startswith('{ id: "m-') or l.strip().startswith('{ "id": "m-')) and 'LAPTOP' in l]
    laptop_v_lines = [l.strip() for l in store_code.splitlines() if (l.strip().startswith('{ id: "v-') or l.strip().startswith('{ "id": "v-')) and any(k in l for k in ['v-dell', 'v-hp', 'v-acer', 'v-microsof', 'v-msi', 'v-avita', 'v-other'])]

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

    brands_pos = store_code.find("export const INITIAL_BRANDS")
    questions_pos = store_code.find("export const INITIAL_QUESTIONS")

    head_code = store_code[:brands_pos]
    tail_code = store_code[questions_pos:]

    new_store_code = head_code + brands_ts + models_ts + vars_ts + tail_code

    with open(STORE_TS, 'w', encoding='utf-8') as f:
        f.write(new_store_code)

    print("Updated lib/store.ts successfully!")

if __name__ == '__main__':
    main()
