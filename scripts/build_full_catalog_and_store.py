import json
import re
import os

BASE_DIR = r'c:\Users\DELL\OneDrive\Desktop\CashALL'
MOBILES_TXT = os.path.join(BASE_DIR, 'dataset used', 'final_mobiles.txt')
LAPTOPS_TXT = os.path.join(BASE_DIR, 'dataset used', 'final_laptops.txt')
TABLETS_TXT = os.path.join(BASE_DIR, 'dataset used', 'final_tablets.txt')
REAL_IMAGES_JSON = os.path.join(BASE_DIR, 'dataset used', 'real_cashify_images.json')
STORE_TS = os.path.join(BASE_DIR, 'lib', 'store.ts')
DATASET_JSON = os.path.join(BASE_DIR, 'dataset used', 'dataset.json')
DATASET_JS = os.path.join(BASE_DIR, 'dataset used', 'dataset.js')

BRAND_LOGOS = {
    "Apple": "https://s3n.cashify.in/cashify/brand/img/xhdpi/2e7cdc22-5a5f.jpg?w=200",
    "Xiaomi": "https://s3n.cashify.in/cashify/brand/img/xhdpi/cb96df6e-080f.jpg?w=200",
    "Samsung": "https://s3n.cashify.in/cashify/brand/img/xhdpi/406a512d-e8dd.jpg?w=200",
    "Vivo": "https://s3n.cashify.in/cashify/brand/img/xhdpi/20922c34-8afc.jpg?w=200",
    "OnePlus": "https://s3n.cashify.in/cashify/brand/img/xhdpi/dfb6c340-010f.jpg?w=200",
    "OPPO": "https://s3n.cashify.in/cashify/brand/img/xhdpi/ac5c9a7b-76b5.jpg?w=200",
    "Realme": "https://s3n.cashify.in/cashify/brand/img/xhdpi/0124cc45-3a6c.jpg?w=200",
    "Motorola": "https://s3n.cashify.in/cashify/brand/img/xhdpi/1dcd7fda-0141.jpg?w=200",
    "Lenovo": "https://s3n.cashify.in/cashify/brand/img/xhdpi/4834825a-7f10.jpg?w=200",
    "Nokia": "https://s3n.cashify.in/cashify/brand/img/xhdpi/fef4e5ae-6507.jpg?w=200",
    "Honor": "https://s3n.cashify.in/cashify/brand/img/xhdpi/cfeaabff-69bf.jpg?w=200",
    "Asus": "https://s3n.cashify.in/cashify/brand/img/xhdpi/bf25222a-a2a7.jpg?w=200",
    "Google": "https://s3n.cashify.in/cashify/brand/img/xhdpi/dacc50a2-77a9.jpg?w=200",
    "POCO": "https://s3n.cashify.in/cashify/brand/img/xhdpi/3e072dc2-6d7b.jpg?w=200",
    "LG": "https://s3n.cashify.in/cashify/brand/img/xhdpi/bdbdc48e-dd24.jpg?w=200",
    "Infinix": "https://s3n.cashify.in/cashify/brand/img/xhdpi/738cb1f1-7ddf.jpg?w=200",
    "Tecno": "https://s3n.cashify.in/cashify/brand/img/xhdpi/55424ad4-0400.jpg?w=200",
    "iQOO": "https://s3n.cashify.in/cashify/brand/img/xhdpi/e1b13cbc-ef06.jpg?w=200",
    "Nothing": "https://s3n.cashify.in/cashify/brand/img/xhdpi/06bc74db-4d38.jpg?w=200",
    "Huawei": "https://s3n.cashify.in/cashify/brand/img/xhdpi/71ceb6bc-6f4e.jpg?w=200",
    "Dell": "https://s3n.cashify.in/cashify/brand/img/xhdpi/d3b4fdda-2d57.jpg?w=200",
    "HP": "https://s3n.cashify.in/cashify/brand/img/xhdpi/f78db5fb-857c.jpg?w=200",
    "Acer": "https://s3n.cashify.in/cashify/brand/img/xhdpi/2c350ab6-da4f.jpg?w=200",
    "Microsoft": "https://s3n.cashify.in/cashify/brand/img/xhdpi/b00e17d8-fdd0.jpg?w=200",
    "MSI": "https://s3n.cashify.in/cashify/brand/img/xhdpi/3e0e18bd-7fa2.jpg?w=200",
    "AVITA": "https://s3n.cashify.in/cashify/brand/img/xhdpi/8ae5b678-550c.jpg?w=200",
    "Other Laptop": "https://s3n.cashify.in/cashify/brand/img/xhdpi/da0de74d-0f4d.jpg?w=200",
}

BRAND_DISPLAY_NAMES = {
    "APPLE": "Apple",
    "XIAOMI": "Xiaomi",
    "SAMSUNG": "Samsung",
    "VIVO": "Vivo",
    "ONEPLUS": "OnePlus",
    "OPPO": "OPPO",
    "REALME": "Realme",
    "MOTOROLA": "Motorola",
    "LENOVO": "Lenovo",
    "NOKIA": "Nokia",
    "HONOR": "Honor",
    "ASUS": "Asus",
    "GOOGLE": "Google",
    "POCO": "POCO",
    "LG": "LG",
    "INFINIX": "Infinix",
    "TECNO": "Tecno",
    "IQOO": "iQOO",
    "NOTHING": "Nothing",
    "HUAWEI": "Huawei",
    "DELL": "Dell",
    "HP": "HP",
    "HP/COMPAQ": "HP",
    "ACER": "Acer",
    "MICROSOFT": "Microsoft",
    "MSI": "MSI",
    "AVITA": "AVITA",
    "OTHER LAPTOP": "Other Laptop",
}

def clean_slug(s):
    s = s.lower()
    s = re.sub(r'[^\w\s-]', '', s)
    s = re.sub(r'[\s_]+', '-', s)
    return s.strip('-')

def clean_model_name(name):
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def natural_sort_key(item):
    name = item['name']
    brand = item.get('brandSlug', '')
    tokens = []
    for token in re.split(r'(\d+|\b[A-Za-z]+\b)', name):
        t_low = token.lower().strip()
        if not t_low:
            continue
        if token.isdigit():
            tokens.append((0, float(int(token))))
        else:
            tokens.append((1, t_low))
    return (brand, tokens)

def parse_dataset_file(filepath, category_name):
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    brand_blocks = re.split(r'={20,}\s*\nBRAND\s*:\s*', text)
    models_result = []

    for b_block in brand_blocks[1:]:
        lines = b_block.splitlines()
        b_name_raw = lines[0].strip()
        b_display = BRAND_DISPLAY_NAMES.get(b_name_raw.upper(), b_name_raw.title())
        b_slug = clean_slug(b_display)

        # Models inside brand
        m_blocks = re.split(r'-{20,}\s*\n\s*MODEL\s*:\s*', b_block)
        for m_block in m_blocks[1:]:
            m_lines = m_block.splitlines()
            m_name_raw = m_lines[0].strip()
            clean_m_name = clean_model_name(m_name_raw)

            # Cashify URL
            url_match = re.search(r'Cashify URL\s*:\s*(https?://[^\s]+)', m_block)
            cashify_url = url_match.group(1).strip() if url_match else ''

            # Variants
            v_blocks = re.split(r'\[VARIANT\]\s*:\s*', m_block)
            variants_list = []
            for v_block in v_blocks[1:]:
                v_lines = v_block.splitlines()
                v_title = v_lines[0].strip()

                storage_m = re.search(r'\*\s*Storage\s*:\s*([^\n]+)', v_block)
                ram_m = re.search(r'\*\s*RAM\s*:\s*([^\n]+)', v_block)
                storage_val = storage_m.group(1).strip() if storage_m else v_title
                ram_val = ram_m.group(1).strip() if ram_m else ''
                if ram_val == 'N/A':
                    ram_val = ''
                if storage_val == 'N/A':
                    storage_val = v_title

                # Final 5% increased price
                price_m = re.search(r'\*\s*FINAL PRICE\s*\(\+5%\)\s*:\s*₹?([\d,]+)', v_block)
                if not price_m:
                    price_m = re.search(r'\*\s*Base Best Price\s*:\s*₹?([\d,]+)', v_block)
                if not price_m:
                    price_m = re.search(r'\*\s*Cashify Price\s*:\s*₹?([\d,]+)', v_block)

                price_num = int(price_m.group(1).replace(',', '')) if price_m else 0

                variants_list.append({
                    'name': v_title,
                    'storage': storage_val,
                    'ram': ram_val if ram_val else None,
                    'price': price_num
                })

            if not variants_list:
                # Default standard variant if none parsed
                variants_list.append({
                    'name': 'Standard',
                    'storage': 'Standard',
                    'ram': None,
                    'price': 15000
                })

            models_result.append({
                'brandName': b_display,
                'brandSlug': b_slug,
                'name': clean_m_name,
                'url': cashify_url,
                'variants': variants_list,
                'category': category_name
            })

    return models_result

def main():
    print("Loading image cache...")
    real_images = {}
    if os.path.exists(REAL_IMAGES_JSON):
        with open(REAL_IMAGES_JSON, 'r', encoding='utf-8') as f:
            real_images = json.load(f)
    print(f"Loaded {len(real_images)} image entries.")

    print("\nParsing datasets...")
    mobile_models_raw = parse_dataset_file(MOBILES_TXT, 'MOBILE')
    laptop_models_raw = parse_dataset_file(LAPTOPS_TXT, 'LAPTOP')
    tablet_models_raw = parse_dataset_file(TABLETS_TXT, 'TABLET')

    print(f"Parsed {len(mobile_models_raw)} mobile models")
    print(f"Parsed {len(laptop_models_raw)} laptop models")
    print(f"Parsed {len(tablet_models_raw)} tablet models")

    # Combine all brands and discover their categories
    all_raw_models = mobile_models_raw + laptop_models_raw + tablet_models_raw
    brand_categories = {}
    brand_sort_order = {}
    brand_order_list = [
        "Apple", "Samsung", "OnePlus", "Xiaomi", "Vivo", "OPPO", "Realme",
        "POCO", "Motorola", "Google", "iQOO", "Nothing", "Honor", "Infinix",
        "Tecno", "Nokia", "Huawei", "LG", "Dell", "HP", "Lenovo", "Asus",
        "Acer", "Microsoft", "MSI", "AVITA", "Other Laptop"
    ]

    for idx, bname in enumerate(brand_order_list, 1):
        brand_sort_order[bname.lower()] = idx

    for m in all_raw_models:
        b_name = m['brandName']
        cat = m['category']
        if b_name not in brand_categories:
            brand_categories[b_name] = set()
        brand_categories[b_name].add(cat)

    final_brands = []
    for b_name, cats in sorted(brand_categories.items(), key=lambda x: brand_sort_order.get(x[0].lower(), 999)):
        b_slug = clean_slug(b_name)
        cat_str = "ALL"
        if cats == {"MOBILE"}:
            cat_str = "MOBILE"
        elif cats == {"LAPTOP"}:
            cat_str = "LAPTOP"
        elif cats == {"TABLET"}:
            cat_str = "TABLET"
        elif cats == {"MOBILE", "LAPTOP"}:
            cat_str = "BOTH"
        elif cats == {"MOBILE", "TABLET"}:
            cat_str = "MOBILE_TABLET"
        elif cats == {"LAPTOP", "TABLET"}:
            cat_str = "LAPTOP_TABLET"
        else:
            cat_str = "ALL"

        logo_url = BRAND_LOGOS.get(b_name, BRAND_LOGOS.get("Other Laptop"))

        final_brands.append({
            "id": f"b-{b_slug}",
            "name": b_name,
            "slug": b_slug,
            "logoUrl": logo_url,
            "category": cat_str,
            "sortOrder": brand_sort_order.get(b_name.lower(), 99),
            "active": True
        })

    print(f"\nCreated {len(final_brands)} Brands:")
    for b in final_brands:
        print(f"  - {b['name']} ({b['slug']}): {b['category']}")

    # Process all models and variants
    store_models = []
    store_variants = []
    dataset_json_items = []
    seen_model_slugs = set()
    seen_variant_ids = set()

    for idx, m in enumerate(all_raw_models, 1):
        b_name = m['brandName']
        b_slug = m['brandSlug']
        m_name = m['name']
        cat = m['category']
        
        base_slug = clean_slug(m_name)
        # Ensure unique model slug within category
        m_slug = base_slug
        slug_key = f"{cat.lower()}-{b_slug}-{m_slug}"
        dedup_counter = 2
        while slug_key in seen_model_slugs:
            m_slug = f"{base_slug}-{dedup_counter}"
            slug_key = f"{cat.lower()}-{b_slug}-{m_slug}"
            dedup_counter += 1
        seen_model_slugs.add(slug_key)

        prefix_id = "m" if cat == "MOBILE" else ("m-laptop" if cat == "LAPTOP" else "m-tablet")
        m_id = f"{prefix_id}-{b_slug}-{m_slug}"

        # Resolve image
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
        if m.get('url'):
            url_part = m['url'].split('/')[-1]
            candidates.append(url_part)
            candidates.append(url_part.replace('used-', ''))

        for cand in candidates:
            if cand in real_images and real_images[cand] and 'builder' not in real_images[cand]:
                img_url = real_images[cand]
                break

        if not img_url:
            clean_tokens = [t for t in re.split(r'[^a-z0-9]', m_name.lower()) if t and t not in [b_slug.lower(), 'samsung', 'apple', 'xiaomi', 'realme', 'oppo', 'vivo', 'oneplus', 'poco', 'motorola', '5g', '4g', 'phone', 'mobile', 'tablet', 'ipad', 'laptop']]
            if clean_tokens:
                core_key = clean_tokens[0]
                for rk, rval in real_images.items():
                    if rval and 'builder' not in rval and b_slug.lower() in rk and core_key in rk:
                        img_url = rval
                        break

        if not img_url:
            if cat == "LAPTOP":
                img_url = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop"
            elif cat == "TABLET":
                img_url = "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop"
            else:
                img_url = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"

        # Release year & popularity heuristics
        release_year = 2024
        year_match = re.search(r'\b(201[5-9]|202[0-9])\b', m_name)
        if year_match:
            release_year = int(year_match.group(1))

        is_popular = (
            (b_slug in ['apple', 'samsung', 'oneplus', 'xiaomi'] and any(x in m_slug for x in ['iphone-15', 'iphone-16', 'iphone-14', 's24', 's23', 'ipad-air', 'ipad-pro', 'macbook-air', 'galaxy-tab-s9']))
            or ('pro' in m_slug and '15' in m_slug)
        )

        model_entry = {
            "id": m_id,
            "brandId": f"b-{b_slug}",
            "brandSlug": b_slug,
            "name": m_name,
            "slug": m_slug,
            "imageUrl": img_url,
            "releaseYear": release_year,
            "popular": is_popular,
            "active": True,
            "contactForPrice": False,
            "category": cat
        }
        store_models.append(model_entry)

        # Process Variants
        processed_vars = []
        for v_idx, v in enumerate(m['variants'], 1):
            v_title = v['name']
            v_slug = clean_slug(v_title) or f"v{v_idx}"
            v_id = f"v-{prefix_id}-{b_slug}-{m_slug}-{v_slug}"
            v_count = 2
            while v_id in seen_variant_ids:
                v_id = f"v-{prefix_id}-{b_slug}-{m_slug}-{v_slug}-{v_count}"
                v_count += 1
            seen_variant_ids.add(v_id)

            price_val = v['price']
            if price_val <= 0:
                price_val = 15000

            variant_entry = {
                "id": v_id,
                "modelId": m_id,
                "ram": v['ram'],
                "storage": v['storage'],
                "basePrice": price_val,
                "active": True
            }
            store_variants.append(variant_entry)

            processed_vars.append({
                "id": v_id,
                "modelId": m_id,
                "name": v_title,
                "ram": v['ram'],
                "storage": v['storage'],
                "price": f"₹{price_val:,}",
                "priceNum": price_val,
                "basePrice": price_val,
                "active": True
            })

        prices = [pv['priceNum'] for pv in processed_vars]
        dataset_json_items.append({
            "id": idx,
            "brand": b_name,
            "brandSlug": b_slug,
            "category": cat,
            "model": m_name,
            "slug": m_slug,
            "minPrice": min(prices) if prices else 0,
            "maxPrice": max(prices) if prices else 0,
            "image": img_url,
            "brandLogo": BRAND_LOGOS.get(b_name, BRAND_LOGOS["Other Laptop"]),
            "variants": processed_vars
        })

    print(f"\nFinal Totals:")
    print(f"Total Brands: {len(final_brands)}")
    print(f"Total Models: {len(store_models)}")
    print(f"Total Variants: {len(store_variants)}")

    # Write dataset.json and dataset.js
    with open(DATASET_JSON, 'w', encoding='utf-8') as f:
        json.dump(dataset_json_items, f, indent=2)
    with open(DATASET_JS, 'w', encoding='utf-8') as f:
        f.write('const FULL_CATALOG_DATASET = ' + json.dumps(dataset_json_items, indent=2) + ';\n')
    print("Saved dataset.json and dataset.js.")

    # Generate updated lib/store.ts
    with open(STORE_TS, 'r', encoding='utf-8') as f:
        existing_store = f.read()

    # Split existing store at INITIAL_BRANDS and INITIAL_QUESTIONS
    brands_pos = existing_store.find("export const INITIAL_BRANDS")
    questions_pos = existing_store.find("export const INITIAL_QUESTIONS")

    head_code = existing_store[:brands_pos]
    tail_code = existing_store[questions_pos:]

    # Update interfaces if needed
    head_code = head_code.replace(
        'category: "MOBILE" | "LAPTOP" | "BOTH";',
        'category: "MOBILE" | "LAPTOP" | "TABLET" | "BOTH" | "ALL" | string;'
    ).replace(
        'category?: "MOBILE" | "LAPTOP";',
        'category?: "MOBILE" | "LAPTOP" | "TABLET" | string;'
    )

    # Chunk models and variants to keep TypeScript compiler happy
    CHUNK_SIZE = 300
    mobile_models = [m for m in store_models if m['category'] == 'MOBILE']
    laptop_models = [m for m in store_models if m['category'] == 'LAPTOP']
    tablet_models = [m for m in store_models if m['category'] == 'TABLET']

    mobile_variants = [v for v in store_variants if not v['id'].startswith('v-m-laptop-') and not v['id'].startswith('v-m-tablet-')]
    laptop_variants = [v for v in store_variants if v['id'].startswith('v-m-laptop-')]
    tablet_variants = [v for v in store_variants if v['id'].startswith('v-m-tablet-')]

    print(f"Split Models: {len(mobile_models)} Mobile, {len(laptop_models)} Laptop, {len(tablet_models)} Tablet")
    print(f"Split Variants: {len(mobile_variants)} Mobile, {len(laptop_variants)} Laptop, {len(tablet_variants)} Tablet")

    # Format Brands
    brands_ts = "export const INITIAL_BRANDS: BrandData[] = " + json.dumps(final_brands, indent=2) + ";\n\n"

    # Format Models Chunks
    models_ts = ""
    m_chunk_names = []
    for cat_name, m_list in [('MOBILE', mobile_models), ('LAPTOP', laptop_models), ('TABLET', tablet_models)]:
        chunks = [m_list[i:i + CHUNK_SIZE] for i in range(0, len(m_list), CHUNK_SIZE)]
        for c_idx, chunk in enumerate(chunks, 1):
            var_name = f"{cat_name}_MODELS_PART_{c_idx}"
            m_chunk_names.append(var_name)
            models_ts += f"const {var_name}: DeviceModelData[] = [\n"
            for m in chunk:
                models_ts += "  " + json.dumps(m) + ",\n"
            models_ts += "];\n\n"

    all_m_spread = ", ".join([f"...{name}" for name in m_chunk_names])
    models_ts += f"export const INITIAL_MODELS: DeviceModelData[] = [{all_m_spread}];\n\n"

    # Format Variants Chunks
    vars_ts = ""
    v_chunk_names = []
    for cat_name, v_list in [('MOBILE', mobile_variants), ('LAPTOP', laptop_variants), ('TABLET', tablet_variants)]:
        chunks = [v_list[i:i + CHUNK_SIZE] for i in range(0, len(v_list), CHUNK_SIZE)]
        for c_idx, chunk in enumerate(chunks, 1):
            var_name = f"{cat_name}_VARIANTS_PART_{c_idx}"
            v_chunk_names.append(var_name)
            vars_ts += f"const {var_name}: DeviceVariantData[] = [\n"
            for v in chunk:
                clean_v = {k: val for k, val in v.items() if val is not None}
                vars_ts += "  " + json.dumps(clean_v) + ",\n"
            vars_ts += "];\n\n"

    all_v_spread = ", ".join([f"...{name}" for name in v_chunk_names])
    vars_ts += f"export const INITIAL_VARIANTS: DeviceVariantData[] = [{all_v_spread}];\n\n"

    new_store_code = head_code + brands_ts + models_ts + vars_ts + tail_code

    with open(STORE_TS, 'w', encoding='utf-8') as f:
        f.write(new_store_code)

    print("Updated lib/store.ts successfully with full catalog!")

if __name__ == '__main__':
    main()
