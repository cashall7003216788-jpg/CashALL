import json
import re
import os

BASE_DIR = r'c:\Users\DELL\OneDrive\Desktop\CashALL'
MOBILES_TXT = os.path.join(BASE_DIR, 'dataset used', 'final_mobiles.txt')
LAPTOPS_TXT = os.path.join(BASE_DIR, 'dataset used', 'final_laptops.txt')
TABLETS_TXT = os.path.join(BASE_DIR, 'dataset used', 'final_tablets.txt')
REAL_MOBILE_IMAGES_JSON = os.path.join(BASE_DIR, 'dataset used', 'real_cashify_images.json')
REAL_TABLET_IMAGES_JSON = os.path.join(BASE_DIR, 'dataset used', 'cashify_tablet_images.json')
REAL_LAPTOP_IMAGES_JSON = os.path.join(BASE_DIR, 'dataset used', 'cashify_laptop_images.json')
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
    "Huawei": "/brands/huawei.svg",
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

# Dedicated brand-specific high-resolution tablet images
BRAND_TABLET_FALLBACKS = {
    "apple": "https://s3ng.cashify.in/cashify/product/img/xhdpi/57301cf3a2212.jpg?w=800",
    "samsung": "https://s3ng.cashify.in/cashify/product/img/xhdpi/57304044b7d3a.jpg?w=800",
    "oneplus": "https://s3ng.cashify.in/cashify/product/img/xhdpi/f0e60602-d7f5.jpg?w=800",
    "lenovo": "https://s3ng.cashify.in/cashify/product/img/xhdpi/57303c6218f3a.jpg?w=800",
    "motorola": "https://s3ng.cashify.in/cashify/product/img/xhdpi/57302d6be6bb8.jpg?w=800",
    "xiaomi": "https://s3ng.cashify.in/cashify/product/img/xhdpi/88b855d7-6df0.jpg?w=800",
    "realme": "https://s3ng.cashify.in/cashify/product/img/xhdpi/57303940f1918.jpg?w=800",
    "huawei": "https://s3ng.cashify.in/cashify/product/img/xhdpi/57302d6be6bb8.jpg?w=800",
    "honor": "https://s3ng.cashify.in/cashify/product/img/xhdpi/f0e60602-d7f5.jpg?w=800",
    "nokia": "https://s3ng.cashify.in/cashify/product/img/xhdpi/57303c6218f3a.jpg?w=800",
    "oppo": "https://s3ng.cashify.in/cashify/product/img/xhdpi/57301cf3a2212.jpg?w=800",
    "poco": "https://s3ng.cashify.in/cashify/product/img/xhdpi/88b855d7-6df0.jpg?w=800",
}

# Dedicated brand-specific high-resolution laptop images
BRAND_LAPTOP_FALLBACKS = {
    "apple": "https://s3ng.cashify.in/cashify/product/img/xhdpi/585091ff79a1a.jpg?w=800",
    "dell": "https://s3ng.cashify.in/cashify/product/img/xhdpi/584f938d8170c.jpg?w=800",
    "hp": "https://s3ng.cashify.in/cashify/product/img/xhdpi/5850e051c2262.jpg?w=800",
    "lenovo": "https://s3ng.cashify.in/cashify/product/img/xhdpi/5850ebd0aa6b2.jpg?w=800",
    "asus": "https://s3ng.cashify.in/cashify/product/img/xhdpi/5850937a505b2.jpg?w=800",
    "acer": "https://s3ng.cashify.in/cashify/product/img/xhdpi/585091ff79a1a.jpg?w=800",
    "microsoft": "https://s3ng.cashify.in/cashify/product/img/xhdpi/584f938d8170c.jpg?w=800",
    "msi": "https://s3ng.cashify.in/cashify/product/img/xhdpi/5850937a505b2.jpg?w=800",
    "avita": "https://s3ng.cashify.in/cashify/product/img/xhdpi/5850e051c2262.jpg?w=800",
    "other-laptop": "https://s3ng.cashify.in/cashify/product/img/xhdpi/da0de74d-0f4d.jpg?w=200",
}

def clean_slug(s):
    s = s.lower()
    s = re.sub(r'[^\w\s-]', '', s)
    s = re.sub(r'[\s_]+', '-', s)
    return s.strip('-')

def clean_model_name(name):
    name = re.sub(r'\s+', ' ', name).strip()
    return name

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
    print("Loading image caches for Mobile, Tablet, and Laptop...")
    mobile_images = {}
    if os.path.exists(REAL_MOBILE_IMAGES_JSON):
        with open(REAL_MOBILE_IMAGES_JSON, 'r', encoding='utf-8') as f:
            mobile_images = json.load(f)
    print(f"Loaded {len(mobile_images)} mobile image entries.")

    tablet_images = {}
    if os.path.exists(REAL_TABLET_IMAGES_JSON):
        with open(REAL_TABLET_IMAGES_JSON, 'r', encoding='utf-8') as f:
            tablet_images = json.load(f)
    print(f"Loaded {len(tablet_images)} tablet image entries.")

    laptop_images = {}
    if os.path.exists(REAL_LAPTOP_IMAGES_JSON):
        with open(REAL_LAPTOP_IMAGES_JSON, 'r', encoding='utf-8') as f:
            laptop_images = json.load(f)
    print(f"Loaded {len(laptop_images)} laptop image entries.")

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

        # Resolve image strictly within the category dictionary
        img_url = None
        candidates = [
            m_name.lower(),
            m_slug,
            f"{b_slug}-{m_slug}",
            f"{b_name.lower()} {m_name.lower()}",
            clean_slug(f"{b_name} {m_name}"),
            clean_slug(m_name),
            f"used-{m_slug}",
            f"sell-old-{m_slug}",
        ]
        if m.get('url'):
            url_part = m['url'].split('/')[-1].lower()
            candidates.append(url_part)
            candidates.append(url_part.replace('used-', ''))

        target_cache = mobile_images if cat == "MOBILE" else (tablet_images if cat == "TABLET" else laptop_images)

        for cand in candidates:
            if cand in target_cache and target_cache[cand] and 'builder' not in target_cache[cand]:
                img_url = target_cache[cand]
                break

        if not img_url:
            # Fuzzy match only inside target cache
            clean_tokens = [t for t in re.split(r'[^a-z0-9]', m_name.lower()) if t and t not in [b_slug.lower(), 'samsung', 'apple', 'xiaomi', 'realme', 'oppo', 'vivo', 'oneplus', 'poco', 'motorola', '5g', '4g', 'phone', 'mobile', 'tablet', 'ipad', 'laptop', 'gen', 'wifi', 'cellular', 'lte', 'inch']]
            if clean_tokens:
                core_key = clean_tokens[0]
                for rk, rval in target_cache.items():
                    if rval and 'builder' not in rval and b_slug.lower() in rk and core_key in rk:
                        img_url = rval
                        break

        # Fallback to category & brand accurate image
        if not img_url:
            if cat == "TABLET":
                img_url = BRAND_TABLET_FALLBACKS.get(b_slug, BRAND_TABLET_FALLBACKS["apple"])
            elif cat == "LAPTOP":
                img_url = BRAND_LAPTOP_FALLBACKS.get(b_slug, BRAND_LAPTOP_FALLBACKS["dell"])
            else:
                img_url = "https://s3ng.cashify.in/cashify/product/img/xhdpi/csh-qp4ba4sq-aeny.png?w=800"

        # Release year
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
        for v_idx, v in enumerate(m['variants'], 1):
            storage_slug = clean_slug(v['storage'])
            ram_part = f"-{clean_slug(v['ram'])}" if v.get('ram') else ""
            var_base_id = f"v-{prefix_id}-{b_slug}-{m_slug}-{storage_slug}{ram_part}"
            var_id = var_base_id
            v_dedup = 2
            while var_id in seen_variant_ids:
                var_id = f"{var_base_id}-{v_dedup}"
                v_dedup += 1
            seen_variant_ids.add(var_id)

            variant_entry = {
                "id": var_id,
                "modelId": m_id,
                "storage": v['storage'],
                "basePrice": v['price'],
                "active": True
            }
            if v.get('ram'):
                variant_entry["ram"] = v['ram']

            store_variants.append(variant_entry)

        dataset_json_items.append({
            "brand": b_name,
            "brand_slug": b_slug,
            "category": cat,
            "model_name": m_name,
            "model_slug": m_slug,
            "image_url": img_url,
            "cashify_url": m.get('url', ''),
            "variants": m['variants']
        })

    print(f"\nFinal Totals:")
    print(f"Total Brands: {len(final_brands)}")
    print(f"Total Models: {len(store_models)}")
    print(f"Total Variants: {len(store_variants)}")

    # Save dataset.json & dataset.js
    with open(DATASET_JSON, 'w', encoding='utf-8') as f:
        json.dump(dataset_json_items, f, indent=2, ensure_ascii=False)

    with open(DATASET_JS, 'w', encoding='utf-8') as f:
        f.write("module.exports = " + json.dumps(dataset_json_items, indent=2, ensure_ascii=False) + ";\n")
    print("Saved dataset.json and dataset.js.")

    # Read existing lib/store.ts to preserve INITIAL_QUESTIONS and INITIAL_PRICING_RULES
    with open(STORE_TS, 'r', encoding='utf-8') as f:
        existing_store = f.read()

    # Extract INITIAL_QUESTIONS and INITIAL_PRICING_RULES
    questions_match = re.search(r'export const INITIAL_QUESTIONS: QuestionData\[\] = (\[[\s\S]*?\]);\s*export const INITIAL_PRICING_RULES', existing_store)
    pricing_rules_match = re.search(r'export const INITIAL_PRICING_RULES: PricingRuleData\[\] = (\[[\s\S]*?\]);\s*export const INITIAL_QUOTES', existing_store)

    if not questions_match or not pricing_rules_match:
        print("Warning: Could not extract questions or pricing rules via regex, falling back to position search...")
        q_start = existing_store.find('export const INITIAL_QUESTIONS:')
        preserved_tail = existing_store[q_start:]
    else:
        preserved_tail = existing_store[existing_store.find('export const INITIAL_QUESTIONS:'):]

    # Split Models and Variants into chunks of 300 to avoid TS2590 union complexity limit
    CHUNK_SIZE = 300
    mobile_models = [m for m in store_models if m['category'] == 'MOBILE']
    laptop_models = [m for m in store_models if m['category'] == 'LAPTOP']
    tablet_models = [m for m in store_models if m['category'] == 'TABLET']

    mobile_variants = [v for v in store_variants if v['id'].startswith('v-m-')]
    laptop_variants = [v for v in store_variants if v['id'].startswith('v-m-laptop-')]
    tablet_variants = [v for v in store_variants if v['id'].startswith('v-m-tablet-')]

    print(f"Split Models: {len(mobile_models)} Mobile, {len(laptop_models)} Laptop, {len(tablet_models)} Tablet")
    print(f"Split Variants: {len(mobile_variants)} Mobile, {len(laptop_variants)} Laptop, {len(tablet_variants)} Tablet")

    # Generate TypeScript chunks
    ts_code_parts = []
    
    # Imports & Interfaces
    ts_header = """// CashALL Unified Catalog Store
// Mobiles, Laptops, and Tablets (+5% Increased Final Prices)

export interface BrandData {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  category: "MOBILE" | "LAPTOP" | "TABLET" | "BOTH" | "ALL" | "MOBILE_TABLET" | "LAPTOP_TABLET" | string;
  sortOrder: number;
  active: boolean;
}

export interface DeviceModelData {
  id: string;
  brandId: string;
  brandSlug?: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  releaseYear?: number;
  popular: boolean;
  active: boolean;
  contactForPrice?: boolean;
  category?: "MOBILE" | "LAPTOP" | "TABLET" | string;
}

export interface DeviceVariantData {
  id: string;
  modelId: string;
  ram?: string;
  storage: string;
  basePrice: number;
  active: boolean;
}

export interface QuestionOptionData {
  id: string;
  label: string;
  description?: string;
  iconName?: string;
  sortOrder: number;
}

export interface QuestionData {
  id: string;
  title: string;
  subtitle?: string;
  group: "BASIC" | "SCREEN" | "BODY" | "FUNCTIONAL" | "REPAIR" | "ACCESSORIES";
  type: "SINGLE" | "MULTIPLE";
  sortOrder: number;
  options: QuestionOptionData[];
}

export interface PricingRuleData {
  id: string;
  questionId: string;
  optionId: string;
  adjustmentType: "FIXED_DEDUCTION" | "PERCENTAGE_DEDUCTION" | "FIXED_BONUS" | "PERCENTAGE_BONUS";
  adjustmentValue: number;
}

export interface QuoteData {
  id: string;
  quoteNumber: string;
  variantId: string;
  selectedAnswersJson: string;
  basePrice: number;
  totalDeductions: number;
  estimatedPrice: number;
  breakdownJson: string;
  expiresAt: string;
  status: "ACTIVE" | "ORDERED" | "EXPIRED";
  createdAt: string;
}

export interface OrderData {
  id: string;
  orderNumber: string;
  quoteId: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deviceName?: string;
  addressId?: string;
  addressSummary?: string;
  pincode: string;
  pickupDate: string;
  pickupTimeSlot: string;
  status: string;
  assignedPartnerId?: string;
  assignedPartnerName?: string;
  assignedPartnerPhone?: string;
  assignedPartnerBusiness?: string;
  estimatedPrice?: number;
  revisedPrice?: number;
  priceDifferenceReason?: string;
  declaredConditionSummary?: string;
  inspectedConditionSummary?: string;
  imeiNumber?: string;
  paymentStatus?: "PENDING" | "PROCESSING" | "PAID" | "FAILED";
  paymentTxRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceAreaData {
  id: string;
  pincode: string;
  city: string;
  state: string;
  active: boolean;
  pickupAvailable: boolean;
}

export interface PartnerData {
  id: string;
  name: string;
  phone: string;
  email: string;
  businessName: string;
  city: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  rating: number;
  completedPickups: number;
}

export interface FAQData {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// SEEDED INITIAL DATA

export const INITIAL_BRANDS: BrandData[] = """ + json.dumps(final_brands, indent=2) + ";\n\n"

    ts_code_parts.append(ts_header)

    # Chunk Model Arrays
    def chunk_array(arr, name_prefix):
        chunks = []
        for i in range(0, len(arr), CHUNK_SIZE):
            chunk = arr[i:i + CHUNK_SIZE]
            chunk_name = f"{name_prefix}_PART_{len(chunks) + 1}"
            chunks.append((chunk_name, chunk))
        return chunks

    mobile_m_chunks = chunk_array(mobile_models, "MOBILE_MODELS")
    laptop_m_chunks = chunk_array(laptop_models, "LAPTOP_MODELS")
    tablet_m_chunks = chunk_array(tablet_models, "TABLET_MODELS")

    for cname, cdata in mobile_m_chunks + laptop_m_chunks + tablet_m_chunks:
        ts_code_parts.append(f"const {cname}: DeviceModelData[] = {json.dumps(cdata, indent=2)};\n\n")

    # Combine models
    all_m_spreads = ", ".join([f"...{c[0]}" for c in mobile_m_chunks + laptop_m_chunks + tablet_m_chunks])
    ts_code_parts.append(f"export const INITIAL_MODELS: DeviceModelData[] = [{all_m_spreads}];\n\n")

    # Chunk Variant Arrays
    mobile_v_chunks = chunk_array(mobile_variants, "MOBILE_VARIANTS")
    laptop_v_chunks = chunk_array(laptop_variants, "LAPTOP_VARIANTS")
    tablet_v_chunks = chunk_array(tablet_variants, "TABLET_VARIANTS")

    for cname, cdata in mobile_v_chunks + laptop_v_chunks + tablet_v_chunks:
        ts_code_parts.append(f"const {cname}: DeviceVariantData[] = {json.dumps(cdata, indent=2)};\n\n")

    # Combine variants
    all_v_spreads = ", ".join([f"...{c[0]}" for c in mobile_v_chunks + laptop_v_chunks + tablet_v_chunks])
    ts_code_parts.append(f"export const INITIAL_VARIANTS: DeviceVariantData[] = [{all_v_spreads}];\n\n")

    # Append Tail
    ts_code_parts.append(preserved_tail)

    full_ts_code = "".join(ts_code_parts)
    with open(STORE_TS, 'w', encoding='utf-8') as f:
        f.write(full_ts_code)

    print("Updated lib/store.ts successfully with real, dedicated category images!")

if __name__ == '__main__':
    main()
