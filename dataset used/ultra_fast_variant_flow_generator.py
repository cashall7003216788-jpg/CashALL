"""
Ultra-Fast Multithreaded Cashify Mobile Phones Dataset Generator v3
1. Extracts base models from brand pages.
2. Follows Cashify's exact "Choose a variant" options (e.g. iPhone 6 Plus -> 16 GB, 64 GB, 128 GB).
3. Fetches exact "Get Upto ₹XX,XXX" Cashify resale valuation price for EVERY variant.
4. NO RELEASE YEAR (per user instruction).
5. Produces Cashify_Mobile_Phones_Dataset.txt in seconds.
"""

import urllib.request
import re
import concurrent.futures

BRANDS_URL = "https://www.cashify.in/sell-old-mobile-phone/brands"
OUTPUT_FILE = r"c:\Users\DELL\OneDrive\Desktop\CashALL\Cashify_Mobile_Phones_Dataset.txt"

# Master data structures
BRAND_URLS = []
BASE_MODEL_CARDS = []
VARIANT_ITEMS = []
DATASET = {}

def get_html(url, timeout=8):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode('utf-8', errors='ignore')
    except Exception:
        return ""

def discover_base_models(brand):
    b_name = brand['name']
    b_url = brand['href']
    html = get_html(b_url)
    if not html:
        return

    # Extract all /used- links
    matches = re.findall(r'<a[^>]*href=["\'](https://www\.cashify\.in/sell-old-mobile-phone/used-[^"\']+)["\'][^>]*>(.*?)</a>', html, re.DOTALL | re.I)
    
    seen = set()
    for href, inner in matches:
        if href in seen:
            continue
        seen.add(href)

        text = re.sub(r'<[^>]+>', ' ', inner)
        text = ' '.join(text.split())
        
        m_img = re.search(r'src=["\'](https://s3ng\.cashify\.in/[^"\']+)["\']', inner, re.I)
        img_src = m_img.group(1) if m_img else None
        if img_src:
            img_src = re.sub(r"\?.*$", "", img_src) + "?w=800"

        # Base model clean name
        clean_title = re.sub(r'Get\s*Upto\s*₹?[\d,]+', '', text, flags=re.I)
        clean_title = re.sub(r'Sell\s*Used', '', clean_title, flags=re.I).strip()
        clean_title = re.sub(r'\s*\(\d+\s*GB\/.*?\)', '', clean_title).strip()

        BASE_MODEL_CARDS.append({
            'brand': b_name,
            'title': clean_title if clean_title else text,
            'url': href,
            'img': img_src if img_src else "N/A"
        })

def inspect_model_page_variants(m_info):
    url = m_info['url']
    b_name = m_info['brand']
    m_title = m_info['title']
    m_img = m_info['img']

    html = get_html(url)
    
    # Look for variant anchors inside page (e.g. 16 GB, 64 GB, 128 GB)
    v_matches = re.findall(r'<a[^>]*href=["\'](https://www\.cashify\.in/sell-old-mobile-phone/used-[^"\']+)["\'][^>]*>(.*?)</a>', html, re.DOTALL | re.I)

    found_variants = []
    seen_v = set()

    for v_href, v_inner in v_matches:
        if v_href == url or v_href in seen_v:
            continue
        v_text = re.sub(r'<[^>]+>', ' ', v_inner).strip()
        
        # Check if it's a storage option like "16 GB", "64 GB", "128 GB"
        if re.search(r'\b\d+\s*(?:GB|TB)\b', v_text, re.I) or re.search(r'\d+-(?:gb|tb)', v_href, re.I):
            seen_v.add(v_href)

            ram = "Standard"
            storage = v_text

            m_specs = re.search(r'(\d+\s*GB)\s*\/\s*(\d+\s*(?:GB|TB))', v_text, re.I)
            if m_specs:
                ram = m_specs.group(1).upper()
                storage = m_specs.group(2).upper()
            elif re.search(r'^\d+\s*(?:GB|TB)$', v_text, re.I):
                storage = v_text.upper()

            var_obj = {
                'brand': b_name,
                'model_name': m_title,
                'ram': ram,
                'storage': storage,
                'price': "NOT SPECIFIED",
                'url': v_href,
                'img': m_img
            }
            found_variants.append(var_obj)

    if not found_variants:
        # Single fallback variant
        ram = "Standard"
        storage = "Standard"
        m_specs = re.search(r'(\d+\s*GB)\s*\/\s*(\d+\s*(?:GB|TB))', m_title, re.I)
        if m_specs:
            ram = m_specs.group(1).upper()
            storage = m_specs.group(2).upper()

        var_obj = {
            'brand': b_name,
            'model_name': m_title,
            'ram': ram,
            'storage': storage,
            'price': "NOT SPECIFIED",
            'url': url,
            'img': m_img
        }
        found_variants.append(var_obj)

    for v in found_variants:
        VARIANT_ITEMS.append(v)

def fetch_variant_price(var_obj):
    url = var_obj['url']
    html = get_html(url)
    if html:
        # Extract Get Upto Price
        m_price = re.search(r'Get\s*Upto\s*₹?\s*([\d,]+)', html, re.I) or re.search(r'₹\s*([\d,]+)', html)
        if m_price:
            var_obj['price'] = f"₹{m_price.group(1)}"

        # Extract og:image if missing
        if var_obj['img'] == "N/A":
            m_og = re.search(r'<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']', html, re.I)
            if m_og and 's3ng.cashify.in' in m_og.group(1):
                var_obj['img'] = re.sub(r"\?.*$", "", m_og.group(1)) + "?w=800"

def main():
    print("=== STEP 1: Discovering all Brands ===")
    html = get_html(BRANDS_URL)
    b_matches = re.findall(r'<a[^>]*href=["\'](https://www\.cashify\.in/sell-old-mobile-phone/sell-[^"\']+)["\'][^>]*>(.*?)</a>', html, re.DOTALL | re.I)

    seen_b = set()
    brands = []
    for href, inner in b_matches:
        if href in seen_b:
            continue
        seen_b.add(href)
        name = re.sub(r'<[^>]+>', ' ', inner).strip().split()[0]
        if not name:
            name = href.split('/sell-')[-1].capitalize()
        brands.append({'name': name.upper(), 'href': href})

    print(f"Total Unique Brands Discovered: {len(brands)}")

    print("\n=== STEP 2: Multithreaded Base Model Collection (20 workers) ===")
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        executor.map(discover_base_models, brands)

    print(f"Total Base Model Pages Found: {len(BASE_MODEL_CARDS)}")

    print("\n=== STEP 3: Multithreaded Storage Variant Extraction (30 workers) ===")
    with concurrent.futures.ThreadPoolExecutor(max_workers=30) as executor:
        executor.map(inspect_model_page_variants, BASE_MODEL_CARDS)

    print(f"Total Storage Variant Links Found: {len(VARIANT_ITEMS)}")

    print("\n=== STEP 4: Multithreaded Price Fetching (40 workers) ===")
    with concurrent.futures.ThreadPoolExecutor(max_workers=40) as executor:
        executor.map(fetch_variant_price, VARIANT_ITEMS)

    print("\n=== STEP 5: Generating Cashify_Mobile_Phones_Dataset.txt (NO RELEASE YEAR) ===")
    
    # Organize dataset by Brand -> Model -> Variants
    grouped = {}
    total_brands_set = set()
    total_models_set = set()
    total_variants_cnt = len(VARIANT_ITEMS)
    priced_cnt = 0
    unpriced_cnt = 0

    for v in VARIANT_ITEMS:
        b_name = v['brand']
        m_name = v['model_name']

        total_brands_set.add(b_name)
        total_models_set.add(f"{b_name}::{m_name}")

        if b_name not in grouped:
            grouped[b_name] = {}
        if m_name not in grouped[b_name]:
            grouped[b_name][m_name] = []

        grouped[b_name][m_name].append(v)

        if v['price'] != "NOT SPECIFIED":
            priced_cnt += 1
        else:
            unpriced_cnt += 1

    lines = []
    lines.append("==================================================")
    lines.append("CASHIFY MOBILE PHONES COMPLETE TEXT DATASET (v3)")
    lines.append("==================================================\n")

    for brand_name in sorted(grouped.keys()):
        lines.append("========================================")
        lines.append(brand_name)
        lines.append("========================================\n")

        models_dict = grouped[brand_name]
        for model_name in sorted(models_dict.keys()):
            lines.append(f"MODEL: {model_name}\n")

            variants_list = models_dict[model_name]
            for v_idx, v in enumerate(variants_list, 1):
                lines.append(f"Variant {v_idx}")
                lines.append(f"RAM: {v['ram']}")
                lines.append(f"Storage: {v['storage']}")
                lines.append(f"Cashify Price: {v['price']}")
                lines.append(f"Cashify URL: {v['url']}")
                lines.append(f"Image URL: {v['img']}\n")

            lines.append("----------------------------------------\n")

    # SUMMARY
    lines.append("==================================================")
    lines.append("FINAL SUMMARY")
    lines.append("==================================================")
    lines.append(f"Total Brands: {len(total_brands_set)}")
    lines.append(f"Total Models: {len(total_models_set)}")
    lines.append(f"Total Variants: {total_variants_cnt}")
    lines.append(f"Variants with Cashify Prices: {priced_cnt}")
    lines.append(f"Variants without Cashify Prices: {unpriced_cnt}")

    output_text = "\n".join(lines)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(output_text)

    print(f"\nDATASET GENERATION COMPLETE!")
    print(f"File Saved: {OUTPUT_FILE}")
    print(f"Total Size: {len(output_text):,} characters / {len(lines):,} lines")
    print(f"Summary: {len(total_brands_set)} Brands | {len(total_models_set)} Models | {total_variants_cnt} Variants ({priced_cnt} Priced)")

if __name__ == "__main__":
    main()
