"""
Cashify Mobile - Direct Variant URL Price Scraper
==================================================
For each brand -> model -> variant:
  1. Navigate directly to the variant-specific URL
  2. Read "Get Upto Rs. X" price from page
  3. Record Brand / Model / Variant / Price

No question answering. No GEV clicking. Just direct URL navigation + price read.
"""

import asyncio
import re
import sys
from datetime import datetime

# Force UTF-8 output so Rs symbol prints correctly on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from playwright.async_api import async_playwright

# ── Config ───────────────────────────────────────────────────────────────
BRANDS_URL  = "https://www.cashify.in/sell-old-mobile-phone/brands"
OUTPUT_FILE = r"c:\Users\DELL\OneDrive\Desktop\CashALL\Cashify_Mobile_Phones_Dataset.txt"
HEADLESS    = True          # True = fast background; False = visible browser
NAV_TIMEOUT = 35000
CONCURRENCY = 4             # parallel pages for price reading

# ── Logging ───────────────────────────────────────────────────────────────
def log(msg):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)

# ── Price extraction ──────────────────────────────────────────────────────
def extract_price(text: str):
    """
    Find 'Get Upto Rs. X,XXX' or 'Get Upto Rs.X,XXX' in page text.
    Handles cases where price is on a separate line from 'Get Upto'.
    Returns string like 'Rs.12,500' or None.
    """
    # Collapse newlines/tabs so multi-line 'Get Upto\n₹1,670' becomes one string
    flat = re.sub(r'[\r\n\t]+', ' ', text)

    # Primary: 'Get Upto Rs. 12,500' or 'Get Upto ₹12,500'
    m = re.search(
        r"get\s+upto\s*(?:rs\.?|₹)?\s*([\d,]+)",
        flat, re.IGNORECASE
    )
    if m:
        val = int(m.group(1).replace(",", ""))
        if 50 <= val <= 2_000_000:
            return f"Rs.{m.group(1)}"

    # Secondary: Rs./₹ symbol near sell/value context words
    for m in re.finditer(r"(?:₹|Rs\.?)\s*([\d,]+)", flat):
        val = int(m.group(1).replace(",", ""))
        if 200 <= val <= 500_000:
            ctx = flat[max(0, m.start()-80):m.end()+80].lower()
            if any(w in ctx for w in ["upto", "up to", "sell", "resale", "value", "earn", "cashify"]):
                return f"Rs.{m.group(1)}"

    return None

# ── Get all brands from brands page ───────────────────────────────────────
async def get_all_brands(page):
    log("Loading brands page...")
    await page.goto(BRANDS_URL, wait_until="domcontentloaded", timeout=NAV_TIMEOUT)
    await asyncio.sleep(3)
    for _ in range(5):
        await page.evaluate("window.scrollBy(0, 1200)")
        await asyncio.sleep(0.4)

    raw = await page.evaluate("""
        () => {
            const seen = new Set();
            const results = [];
            document.querySelectorAll('a[href*="/sell-old-mobile-phone/sell-"]').forEach(a => {
                const href = a.href.split('?')[0].split('#')[0];
                if (!seen.has(href)) {
                    seen.add(href);
                    const name = (a.innerText || a.textContent || '').trim().split('\\n')[0].trim();
                    results.push({ name: name || href.split('/sell-').pop().replace(/-/g,' '), href });
                }
            });
            return results;
        }
    """)
    log(f"  Found {len(raw)} brands")
    return raw

BRAND_KEYWORDS = {
    "APPLE": ["iphone", "apple", "ipad"],
    "XIAOMI": ["xiaomi", "redmi", "mi-", "black-shark"],
    "SAMSUNG": ["samsung", "galaxy"],
    "VIVO": ["vivo"],
    "ONEPLUS": ["oneplus", "one-plus"],
    "OPPO": ["oppo"],
    "REALME": ["realme"],
    "MOTOROLA": ["motorola", "moto"],
    "LENOVO": ["lenovo"],
    "NOKIA": ["nokia"],
    "HONOR": ["honor", "huawei"],
    "ASUS": ["asus", "rog", "zenfone"],
    "GOOGLE": ["google", "pixel"],
    "POCO": ["poco"],
    "LG": ["lg-"],
    "INFINIX": ["infinix"],
    "TECNO": ["tecno"],
    "IQOO": ["iqoo"],
    "NOTHING": ["nothing"],
}

def detect_brand_from_slug(slug: str) -> str:
    s = slug.lower()
    for brand, kws in BRAND_KEYWORDS.items():
        for kw in kws:
            if kw in s:
                return brand
    return ""

# ── Get all model links from brand page ───────────────────────────────────
async def get_brand_models(page, brand_url, brand_name, global_seen):
    for attempt in range(3):
        try:
            await page.goto(brand_url, wait_until="domcontentloaded", timeout=NAV_TIMEOUT)
            await asyncio.sleep(2)
            for _ in range(8):
                await page.evaluate("window.scrollBy(0, 1500)")
                await asyncio.sleep(0.4)
            break
        except Exception as e:
            if attempt == 2:
                log(f"  FAILED loading brand page {brand_name}: {e}")
                return []
            await asyncio.sleep(3)

    raw = await page.evaluate("""
        () => {
            const seen = new Set();
            const results = [];
            document.querySelectorAll('a[href*="/sell-old-mobile-phone/used-"]').forEach(a => {
                const href = a.href.split('?')[0].split('#')[0].replace(/\\/+$/, '');
                const after = href.split('/sell-old-mobile-phone/used-')[1] || '';
                if (!after || after.includes('/')) return;
                if (seen.has(href)) return;
                seen.add(href);
                const text = (a.innerText || a.textContent || '').trim().replace(/\\n/g, ' ');
                results.push({ href, text });
            });
            return results;
        }
    """)

    models = []
    b_name_upper = brand_name.upper().strip()

    for item in raw:
        href = item.get("href", "").strip()
        text = item.get("text", "").strip()
        after_used = href.split("/sell-old-mobile-phone/used-")[-1]

        # 1. Skip if already claimed by another brand
        if href in global_seen:
            continue

        # 2. Check brand affinity: if slug clearly belongs to another brand, skip
        detected = detect_brand_from_slug(after_used)
        if detected and detected != b_name_upper:
            continue

        global_seen.add(href)

        # Clean model name
        name = re.sub(r"get\s*upto\s*[^\d]*[\d,]+", "", text, flags=re.IGNORECASE)
        name = re.sub(r"sell\s*used\s*", "", name, flags=re.IGNORECASE)
        name = re.sub(r"\s+", " ", name).strip()
        if not name:
            name = after_used.replace("-", " ").title()
        models.append((name, href))

    return models

# ── Get variant URLs from model page ─────────────────────────────────────
async def get_model_variant_urls(page, model_url):
    """
    Navigate to model page and find all variant <a> hrefs.
    Each variant chip is a div.bg-surface.cursor-pointer inside an <a>.
    Returns list of (variant_label, variant_url).
    """
    for attempt in range(3):
        try:
            await page.goto(model_url, wait_until="domcontentloaded", timeout=NAV_TIMEOUT)
            await asyncio.sleep(2)
            for _ in range(3):
                await page.evaluate("window.scrollBy(0, 600)")
                await asyncio.sleep(0.3)
            break
        except Exception as e:
            if attempt == 2:
                return []
            await asyncio.sleep(3)

    # Derive base slug from model URL to filter out recommendation cards
    base_slug = model_url.rstrip("/").split("/used-")[-1]  # e.g. "apple-iphone-12"

    # Primary: div.bg-surface.cursor-pointer inside <a> whose href CONTAINS the model slug
    # Use includes() not startsWith() because model slug 'iphone-6' appears inside
    # variant URLs like 'apple-iphone-6-1-gb-16-gb'
    variants = await page.evaluate(f"""
        () => {{
            const seen = new Set();
            const results = [];
            const baseSlug = '{base_slug}';
            document.querySelectorAll('div.bg-surface.cursor-pointer').forEach(div => {{
                const txt = div.innerText.trim();
                const a = div.closest('a');
                if (!a) return;
                const href = a.href.split('?')[0].split('#')[0];
                if (!href.includes('/sell-old-mobile-phone/used-')) return;
                const after = href.split('/sell-old-mobile-phone/used-')[1] || '';
                // Variant slug must CONTAIN the model base slug
                if (!after.includes(baseSlug)) return;
                // Must be LONGER than the base slug (has a variant suffix)
                if (after === baseSlug) return;
                if (seen.has(href)) return;
                // Must have a storage pattern in label OR in the href
                if (!/\\d+\\s*(GB|TB)/i.test(txt) && !/\\d+-gb/i.test(after)) return;
                seen.add(href);
                results.push({{ label: txt, href }});
            }});
            return results;
        }}
    """)

    if variants:
        return [(v["label"], v["href"]) for v in variants]

    # Fallback: any <a> whose href CONTAINS base_slug + storage suffix
    fallback = await page.evaluate(f"""
        () => {{
            const seen = new Set();
            const results = [];
            const base = '{base_slug}';
            document.querySelectorAll('a[href*="/sell-old-mobile-phone/used-"]').forEach(a => {{
                const href = a.href.split('?')[0].split('#')[0];
                const after = href.split('/sell-old-mobile-phone/used-')[1] || '';
                if (!after.includes(base) || after === base) return;
                if (!(/\\d+-gb/i.test(after))) return;
                if (seen.has(href)) return;
                seen.add(href);
                const txt = (a.innerText || a.textContent || '').trim();
                results.push({{ label: txt || after.replace(base + '-', '').replace(/-/g,' '), href }});
            }});
            return results;
        }}
    """)
    if fallback:
        return [(v["label"], v["href"]) for v in fallback]

    # No variants found — the model page IS the variant page
    return [("Standard", model_url)]

# ── Read price from a variant URL ─────────────────────────────────────────
async def read_variant_price(page, variant_url):
    """Navigate to variant URL and extract price from page text."""
    for attempt in range(3):
        try:
            await page.goto(variant_url, wait_until="domcontentloaded", timeout=NAV_TIMEOUT)
            await asyncio.sleep(2)
            # Scroll to trigger lazy-loaded price elements
            await page.evaluate("window.scrollBy(0, 500)")
            await asyncio.sleep(0.5)

            body = await page.inner_text("body")
            price = extract_price(body)
            if price:
                return price

            # Give page more time and try again (some prices load late)
            await asyncio.sleep(1.5)
            body = await page.inner_text("body")
            price = extract_price(body)
            if price:
                return price

            return "NOT AVAILABLE"

        except Exception as e:
            if attempt == 2:
                log(f"      ERROR on {variant_url}: {e}")
                return "NOT AVAILABLE"
            await asyncio.sleep(3)

    return "NOT AVAILABLE"

# ── Main ──────────────────────────────────────────────────────────────────
async def main():
    log("=" * 55)
    log("CASHIFY MOBILE PRICE SCRAPER - DIRECT VARIANT URLs")
    log("=" * 55)

    # output_data: { brand_name: [(model_name, [(var_label, price), ...]), ...] }
    output_data = {}
    global_seen_models = set()

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=HEADLESS,
            args=["--no-sandbox", "--disable-blink-features=AutomationControlled"]
        )
        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1366, "height": 768},
            locale="en-IN",
        )

        nav_page   = await context.new_page()
        # Worker pages for parallel price reading
        workers = [await context.new_page() for _ in range(CONCURRENCY)]

        # ── 1. Discover all brands ─────────────────────────────────────
        brands = await get_all_brands(nav_page)

        # ── 2. For each brand → models → variants → prices ────────────
        for b_idx, brand_info in enumerate(brands, 1):
            brand_name = brand_info["name"].upper()
            brand_url  = brand_info["href"]

            log(f"\n[{b_idx}/{len(brands)}] BRAND: {brand_name}")

            models = await get_brand_models(nav_page, brand_url, brand_name, global_seen_models)
            log(f"  {len(models)} models found")

            brand_results = []

            for m_idx, (model_name, model_url) in enumerate(models, 1):
                log(f"  [{m_idx}/{len(models)}] {model_name}")

                # Get all variant URLs for this model
                variant_list = await get_model_variant_urls(nav_page, model_url)
                log(f"    {len(variant_list)} variant(s): {[v[0] for v in variant_list]}")

                # Read price for each variant (in batches using worker pages)
                variant_prices = []
                for i in range(0, len(variant_list), CONCURRENCY):
                    batch = variant_list[i : i + CONCURRENCY]
                    tasks = [
                        read_variant_price(workers[j], batch[j][1])
                        for j in range(len(batch))
                    ]
                    prices = await asyncio.gather(*tasks)
                    for (var_label, var_url), price in zip(batch, prices):
                        log(f"      {var_label:20s} => {price}")
                        variant_prices.append((var_label, price))

                brand_results.append((model_name, variant_prices))

            output_data[brand_name] = brand_results

            # Write after every brand so progress is saved
            write_output(output_data)

        await browser.close()

    log("\n=== ALL DONE ===")
    write_output(output_data)


# ── Output writer ─────────────────────────────────────────────────────────
def write_output(data: dict):
    lines = []
    lines.append("=" * 50)
    lines.append("CASHIFY MOBILE PHONES - COMPLETE PRICE LIST")
    lines.append("=" * 50)
    lines.append("")

    total_brands   = 0
    total_models   = 0
    total_variants = 0
    priced         = 0
    unpriced       = 0

    for brand_name, models in data.items():
        total_brands += 1
        lines.append("=" * 40)
        lines.append(brand_name)
        lines.append("=" * 40)
        lines.append("")

        for model_name, variant_prices in models:
            total_models += 1
            lines.append(f"MODEL: {model_name}")
            lines.append("")
            for var_label, price in variant_prices:
                total_variants += 1
                if price and price != "NOT AVAILABLE":
                    priced += 1
                else:
                    unpriced += 1
                lines.append(f"Variant: {var_label}")
                lines.append(f"Cashify Price: {price}")
                lines.append("")
            lines.append("")

    lines.append("=" * 50)
    lines.append("FINAL SUMMARY")
    lines.append("=" * 50)
    lines.append(f"Total Brands: {total_brands}")
    lines.append(f"Total Models: {total_models}")
    lines.append(f"Total Variants: {total_variants}")
    lines.append(f"Variants with Cashify Prices: {priced}")
    lines.append(f"Variants without Cashify Prices: {unpriced}")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    log(f"  Saved -> {OUTPUT_FILE}  [{total_brands}B / {total_models}M / {total_variants}V / {priced} priced]")


if __name__ == "__main__":
    asyncio.run(main())
