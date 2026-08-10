"""
Playwright discovery for mobile brands & base models, followed by variant option extraction and price fetching.
NO RELEASE YEAR per user instructions!
"""

import asyncio
import re
import urllib.request
import concurrent.futures
from playwright.async_api import async_playwright

BRANDS_URL = "https://www.cashify.in/sell-old-mobile-phone/brands"
OUTPUT_FILE = r"c:\Users\DELL\OneDrive\Desktop\CashALL\Cashify_Mobile_Phones_Dataset.txt"

BASE_MODEL_CARDS = []
ALL_VARIANT_TASKS = []
DATASET_MAP = {}


def fetch_variant_details(var_item):
    url = var_item['url']
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    
    price = "NOT SPECIFIED"
    img_url = var_item.get('img', 'N/A')

    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            
            # Get Upto Price
            m_price = re.search(r'Get\s*Upto\s*₹?\s*([\d,]+)', html, re.I) or re.search(r'₹\s*([\d,]+)', html)
            if m_price:
                price = f"₹{m_price.group(1)}"

            # og:image
            m_og = re.search(r'<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']', html, re.I)
            if m_og and 's3ng.cashify.in' in m_og.group(1):
                img_url = re.sub(r"\?.*$", "", m_og.group(1)) + "?w=800"

    except Exception:
        pass

    var_item['price'] = price
    var_item['img'] = img_url


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
        page = await context.new_page()

        print("=== STEP 1: Discovering all Brands ===")
        await page.goto(BRANDS_URL, wait_until="domcontentloaded", timeout=30000)
        await asyncio.sleep(2)

        raw_brands = await page.evaluate('''() => {
            const results = [];
            const anchors = Array.from(document.querySelectorAll('a[href*="/sell-old-mobile-phone/sell-"]'));
            for (const a of anchors) {
                const href = a.href;
                const name = a.innerText.trim().split('\\n')[0] || href.split('/sell-').pop();
                if (name && href) {
                    results.push({ name: name.trim(), href: href.trim() });
                }
            }
            return results;
        }''')

        seen_b = set()
        unique_brands = []
        for b in raw_brands:
            if b['href'] not in seen_b:
                seen_b.add(b['href'])
                unique_brands.append(b)

        print(f"Total Brands Discovered: {len(unique_brands)}")

        print("\n=== STEP 2: Collecting Base Model Links per Brand ===")
        for b_idx, brand in enumerate(unique_brands, 1):
            b_name = brand['name'].upper()
            b_url = brand['href']
            print(f"[{b_idx}/{len(unique_brands)}] Harvesting Brand: {b_name}...")

            DATASET_MAP[b_name] = []

            try:
                await page.goto(b_url, wait_until="domcontentloaded", timeout=25000)
                await asyncio.sleep(1)

                for _ in range(4):
                    await page.evaluate("window.scrollBy(0, 1500);")
                    await asyncio.sleep(0.3)

                models_raw = await page.evaluate('''() => {
                    const results = [];
                    const anchors = Array.from(document.querySelectorAll('a[href*="/sell-old-mobile-phone/used-"]'));
                    for (const a of anchors) {
                        const href = a.href;
                        const text = a.innerText.trim().replace(/\\n/g, ' ');
                        const img = a.querySelector('img');
                        const imgSrc = img ? (img.src || img.getAttribute('data-src')) : null;
                        results.push({ href, text, imgSrc });
                    }
                    return results;
                }''')

                seen_m = set()
                for m in models_raw:
                    m_url = m['href']
                    clean_title = re.sub(r'Get\s*Upto\s*₹?[\d,]+', '', m['text'], flags=re.I)
                    clean_title = re.sub(r'Sell\s*Used', '', clean_title, flags=re.I).strip()
                    clean_title = re.sub(r'\s*\(\d+\s*GB\/.*?\)', '', clean_title).strip()

                    if m_url not in seen_m:
                        seen_m.add(m_url)
                        BASE_MODEL_CARDS.append({
                            'brand': b_name,
                            'title': clean_title if clean_title else m['text'],
                            'url': m_url,
                            'img': m['imgSrc']
                        })

                print(f"  -> Discovered {len(seen_m)} model links for {b_name}")

            except Exception as e:
                print(f"  -> Err {b_name}: {e}")

        print(f"\n=== STEP 3: Discovering Variants for {len(BASE_MODEL_CARDS)} Base Model Pages ===")
        sem = asyncio.Semaphore(12)

        async def inspect_model_variants(m_info):
            async with sem:
                b_name = m_info['brand']
                m_title = m_info['title']
                m_url = m_info['url']
                m_img = m_info['img']

                m_page = await context.new_page()
                try:
                    await m_page.goto(m_url, wait_until="domcontentloaded", timeout=20000)
                    await asyncio.sleep(0.8)

                    variant_options = await m_page.evaluate('''() => {
                        const results = [];
                        const anchors = Array.from(document.querySelectorAll('a[href*="/sell-old-mobile-phone/used-"]'));
                        for (const a of anchors) {
                            const text = a.innerText.trim();
                            const href = a.href;
                            if (text.match(/\\d+\\s*(GB|TB)/i) || href.match(/\\d+-gb/i) || href.match(/\\d+gb/i)) {
                                results.push({ text, href });
                            }
                        }
                        return results;
                    }''')

                    model_entry = {
                        "name": m_title,
                        "url": m_url,
                        "variants": []
                    }

                    if variant_options:
                        seen_v_urls = set()
                        for v in variant_options:
                            v_url = v['href']
                            if v_url in seen_v_urls:
                                continue
                            seen_v_urls.add(v_url)

                            v_text = v['text']
                            ram = "Standard"
                            storage = v_text

                            m_specs = re.search(r'(\d+\s*GB)\s*\/\s*(\d+\s*(?:GB|TB))', v_text, re.I)
                            if m_specs:
                                ram = m_specs.group(1).upper()
                                storage = m_specs.group(2).upper()
                            elif re.search(r'^\d+\s*(?:GB|TB)$', v_text, re.I):
                                storage = v_text.upper()

                            var_obj = {
                                "ram": ram,
                                "storage": storage,
                                "price": "NOT SPECIFIED",
                                "url": v_url,
                                "img": m_img if m_img else "N/A"
                            }
                            model_entry["variants"].append(var_obj)
                            ALL_VARIANT_TASKS.append(var_obj)
                    else:
                        ram = "Standard"
                        storage = "Standard"
                        m_specs = re.search(r'(\d+\s*GB)\s*\/\s*(\d+\s*(?:GB|TB))', m_title, re.I)
                        if m_specs:
                            ram = m_specs.group(1).upper()
                            storage = m_specs.group(2).upper()

                        var_obj = {
                            "ram": ram,
                            "storage": storage,
                            "price": "NOT SPECIFIED",
                            "url": m_url,
                            "img": m_img if m_img else "N/A"
                        }
                        model_entry["variants"].append(var_obj)
                        ALL_VARIANT_TASKS.append(var_obj)

                    DATASET_MAP[b_name].append(model_entry)

                except Exception as e:
                    pass
                finally:
                    await m_page.close()

        v_tasks = [inspect_model_variants(mi) for mi in BASE_MODEL_CARDS]
        await asyncio.gather(*v_tasks)
        await browser.close()

    print(f"\n=== STEP 4: Multithreaded Price Fetching ({len(ALL_VARIANT_TASKS)} Variants) ===")
    with concurrent.futures.ThreadPoolExecutor(max_workers=40) as executor:
        executor.map(fetch_variant_details, ALL_VARIANT_TASKS)

    print("\n=== STEP 5: Writing Cashify_Mobile_Phones_Dataset.txt (NO RELEASE YEAR) ===")
    lines = []
    lines.append("==================================================")
    lines.append("CASHIFY MOBILE PHONES COMPLETE TEXT DATASET (v3)")
    lines.append("==================================================\n")

    total_brands_cnt = len(DATASET_MAP)
    total_models_cnt = 0
    total_variants_cnt = 0
    priced_cnt = 0
    unpriced_cnt = 0

    for brand_name in sorted(DATASET_MAP.keys()):
        lines.append("========================================")
        lines.append(brand_name)
        lines.append("========================================\n")

        models_list = DATASET_MAP[brand_name]

        for m_obj in models_list:
            lines.append(f"MODEL: {m_obj['name']}\n")
            total_models_cnt += 1

            for v_idx, v in enumerate(m_obj["variants"], 1):
                total_variants_cnt += 1
                if v['price'] != "NOT SPECIFIED":
                    priced_cnt += 1
                else:
                    unpriced_cnt += 1

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
    lines.append(f"Total Brands: {total_brands_cnt}")
    lines.append(f"Total Models: {total_models_cnt}")
    lines.append(f"Total Variants: {total_variants_cnt}")
    lines.append(f"Variants with Cashify Prices: {priced_cnt}")
    lines.append(f"Variants without Cashify Prices: {unpriced_cnt}")

    output_text = "\n".join(lines)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(output_text)

    print(f"\nDATASET GENERATION COMPLETE!")
    print(f"File Saved: {OUTPUT_FILE}")
    print(f"Total Size: {len(output_text):,} characters / {len(lines):,} lines")
    print(f"Summary: {total_brands_cnt} Brands | {total_models_cnt} Models | {total_variants_cnt} Variants ({priced_cnt} Priced)")

if __name__ == "__main__":
    asyncio.run(main())
