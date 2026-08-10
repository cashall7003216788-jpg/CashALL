"""
Cashify Mobile Full Interactive Flow Scraper
============================================
Visits Cashify website with a real browser, selects each variant,
clicks "Get Exact Value", answers condition questions with the best
available option, and extracts the actual Cashify resale valuation.

OUTPUT: Plain text file with Brand / Model / Variant / Cashify Price
NO release dates, NO estimated prices, NO retail prices.
"""

import asyncio
import re
import sys
import time
from datetime import datetime
from playwright.async_api import async_playwright, TimeoutError as PWTimeout

# ── Config ──────────────────────────────────────────────────────────────────────
BRANDS_URL   = "https://www.cashify.in/sell-old-mobile-phone/brands"
OUTPUT_FILE  = r"c:\Users\DELL\OneDrive\Desktop\CashALL\Cashify_Mobile_Phones_Dataset.txt"
TEST_ONLY    = False           # Set True to test iPhone 6 only; False = all brands
TEST_URL     = "https://www.cashify.in/sell-old-mobile-phone/used-iphone-6"
HEADLESS     = False           # Visible browser so user can verify
PAGE_TIMEOUT = 30000           # ms
NAV_TIMEOUT  = 40000

# How many seconds to wait after clicking before checking for price
WAIT_AFTER_CLICK = 2.5

# ── Logging ──────────────────────────────────────────────────────────────────────
_log_lines = []

def log(msg: str, end="\n"):
    ts = datetime.now().strftime("%H:%M:%S")
    full = f"[{ts}] {msg}"
    print(full, end=end, flush=True)
    _log_lines.append(full)


# ── Price extraction ──────────────────────────────────────────────────────────────
def extract_price(text: str):
    """
    Extract a Cashify resale valuation from page text.
    Looks for patterns like 'Get Upto Rs 12,500' or similar in valuation context.
    Returns a formatted string like 'Rs.12,500' or None.
    """
    # Primary: "Get Upto Rs. X,XXX"
    m = re.search(r"get\s+upto\s*[^\d]*\s*([\d,]+)", text, re.IGNORECASE)
    if m:
        val = int(m.group(1).replace(",", ""))
        if 100 <= val <= 1_000_000:
            return "Rs." + m.group(1)

    # "You can get up to Rs. X,XXX"
    m = re.search(r"you\s+can\s+get\s+(?:up\s+to\s+)?[^\d]*\s*([\d,]+)", text, re.IGNORECASE)
    if m:
        val = int(m.group(1).replace(",", ""))
        if 100 <= val <= 1_000_000:
            return "Rs." + m.group(1)

    # Look for rupee symbol followed by number
    for m in re.finditer(r"[Rr][Ss]\.?\s*([\d,]+)", text):
        val = int(m.group(1).replace(",", ""))
        if 200 <= val <= 200_000:
            ctx = text[max(0, m.start()-60):m.end()+60].lower()
            if any(w in ctx for w in ["sell", "upto", "value", "resale", "estimated", "earn", "get", "cashify"]):
                return "Rs." + m.group(1)

    return None


# ── Condition question answerer ────────────────────────────────────────────────────
POSITIVE_KEYWORDS = [
    "yes", "working", "good", "perfect", "no damage", "no issue",
    "original", "functional", "excellent", "like new", "all ok",
    "no crack", "no scratch", "flawless", "fully functional",
]
NEGATIVE_KEYWORDS = [
    "no", "not working", "damaged", "broken", "cracked", "repaired",
    "dead", "missing", "faulty",
]


async def choose_best_option(page):
    """
    On a question page, attempt to click the most positive available option.
    Returns True if an option was clicked, False otherwise.
    """
    option_selectors = [
        "label", "button[class*='option']", "div[class*='option']",
        "li[class*='option']", "span[class*='option']",
        "[role='radio']", "[role='checkbox']",
        "div[class*='answer']", "div[class*='Answer']",
        "div[class*='condition']", "div[class*='Condition']",
        "div[class*='choice']",
    ]

    all_options = []
    for sel in option_selectors:
        try:
            els = await page.query_selector_all(sel)
            for el in els:
                txt = (await el.inner_text()).strip().lower()
                if txt and 1 < len(txt) < 60:
                    all_options.append((el, txt))
        except Exception:
            pass

    if not all_options:
        return False

    def score(txt):
        for kw in POSITIVE_KEYWORDS:
            if kw in txt:
                return 1
        for kw in NEGATIVE_KEYWORDS:
            if kw in txt:
                return -1
        return 0

    scored = [(el, txt, score(txt)) for el, txt in all_options]
    scored.sort(key=lambda x: -x[2])
    best_el, best_txt, best_score = scored[0]

    try:
        await best_el.scroll_into_view_if_needed()
        await best_el.click(timeout=5000)
        log(f"    Answered: '{best_txt}' (score={best_score})")
        await asyncio.sleep(0.8)
        return True
    except Exception as e:
        log(f"    Could not click option '{best_txt}': {e}")
        return False


async def click_next_or_continue(page):
    """Click Next/Continue/Submit/Proceed buttons to advance the flow."""
    text_tries = ["next", "continue", "submit", "proceed", "get price", "check price", "get value"]

    try:
        btns = await page.query_selector_all("button, a[role='button'], [role='button']")
        for btn in btns:
            try:
                txt = (await btn.inner_text()).strip().lower()
                if any(t in txt for t in text_tries) and await btn.is_visible():
                    await btn.scroll_into_view_if_needed()
                    await btn.click(timeout=5000)
                    await asyncio.sleep(1.5)
                    return True
            except Exception:
                pass
    except Exception:
        pass

    return False


# ── Core: get price for one variant on one model page ─────────────────────────────
async def get_variant_price(page, model_url: str, variant_btn_text: str, max_question_rounds: int = 8):
    """
    1. Navigate to model_url
    2. Find and click the variant button matching variant_btn_text
    3. Click "Get Exact Value" (or equivalent)
    4. Walk through condition questions answering positively
    5. Extract and return the price string
    Returns price string like 'Rs.12,500' or 'NOT AVAILABLE'
    """
    for attempt in range(3):
        try:
            await page.goto(model_url, wait_until="domcontentloaded", timeout=NAV_TIMEOUT)
            await asyncio.sleep(2)
            break
        except Exception as e:
            if attempt == 2:
                log(f"      FAILED to load {model_url}: {e}")
                return "NOT AVAILABLE"
            await asyncio.sleep(3)

    # ── Step 1: Click the variant ─────────────────────────────────────────────
    variant_clicked = False
    variant_selectors = [
        "button", "label",
        "div[class*='variant']", "div[class*='Variant']",
        "div[class*='storage']", "div[class*='Storage']",
        "div[class*='memory']", "div[class*='Memory']",
        "div[class*='option']", "div[class*='Option']",
        "div[class*='chip']", "div[class*='pill']",
        "div[class*='card']",
        "span[class*='variant']", "span[class*='option']",
        "li",
    ]

    norm_target = re.sub(r"\s+", " ", variant_btn_text.strip().lower())

    for sel in variant_selectors:
        if variant_clicked:
            break
        try:
            els = await page.query_selector_all(sel)
            for el in els:
                try:
                    txt = (await el.inner_text()).strip()
                    norm_txt = re.sub(r"\s+", " ", txt.lower())
                    if norm_txt == norm_target or norm_txt == norm_target.replace(" ", ""):
                        if await el.is_visible():
                            await el.scroll_into_view_if_needed()
                            await el.click(timeout=6000)
                            log(f"      Clicked variant: '{txt}'")
                            await asyncio.sleep(1.2)
                            variant_clicked = True
                            break
                except Exception:
                    pass
        except Exception:
            pass

    if not variant_clicked:
        for sel in variant_selectors:
            if variant_clicked:
                break
            try:
                els = await page.query_selector_all(sel)
                for el in els:
                    try:
                        txt = (await el.inner_text()).strip()
                        norm_txt = re.sub(r"\s+", " ", txt.lower())
                        if norm_target in norm_txt and len(norm_txt) < 30:
                            if await el.is_visible():
                                await el.scroll_into_view_if_needed()
                                await el.click(timeout=6000)
                                log(f"      Clicked variant (partial): '{txt}'")
                                await asyncio.sleep(1.2)
                                variant_clicked = True
                                break
                    except Exception:
                        pass
            except Exception:
                pass

    if not variant_clicked:
        log(f"      WARNING: Could not find variant button for '{variant_btn_text}'")

    # ── Step 2: Click "Get Exact Value" ──────────────────────────────────────
    gev_clicked = False
    gev_selectors_text = [
        "get exact value", "get price", "sell now", "check value",
        "get value", "get quote", "get offer", "start selling",
        "know the value", "know value", "check price", "estimate price",
    ]

    try:
        btns = await page.query_selector_all("button, a[role='button'], [role='button'], a.btn, input[type='button'], input[type='submit']")
        for btn in btns:
            try:
                txt = (await btn.inner_text()).strip().lower()
                if any(t in txt for t in gev_selectors_text) and await btn.is_visible():
                    await btn.scroll_into_view_if_needed()
                    await btn.click(timeout=8000)
                    log(f"      Clicked CTA: '{txt}'")
                    gev_clicked = True
                    await asyncio.sleep(WAIT_AFTER_CLICK)
                    break
            except Exception:
                pass
    except Exception:
        pass

    if not gev_clicked:
        try:
            links = await page.query_selector_all("a")
            for link in links:
                try:
                    txt = (await link.inner_text()).strip().lower()
                    if any(t in txt for t in gev_selectors_text) and await link.is_visible():
                        await link.scroll_into_view_if_needed()
                        await link.click(timeout=8000)
                        log(f"      Clicked CTA link: '{txt}'")
                        gev_clicked = True
                        await asyncio.sleep(WAIT_AFTER_CLICK)
                        break
                except Exception:
                    pass
        except Exception:
            pass

    if not gev_clicked:
        log(f"      WARNING: Could not find 'Get Exact Value' button")

    # ── Step 3: Walk through condition question pages ─────────────────────────
    for round_num in range(max_question_rounds):
        await asyncio.sleep(1.5)
        body_text = ""
        try:
            body_text = await page.inner_text("body")
        except Exception:
            pass

        price = extract_price(body_text)
        if price:
            log(f"      PRICE FOUND: {price} (round {round_num})")
            return price

        if any(x in body_text.lower() for x in ["page not found", "404", "something went wrong"]):
            log(f"      ERROR page encountered")
            return "NOT AVAILABLE"

        answered = await choose_best_option(page)
        if answered:
            await asyncio.sleep(1.2)
            await click_next_or_continue(page)
            continue

        advanced = await click_next_or_continue(page)
        if not advanced:
            await asyncio.sleep(2)
            try:
                body_text = await page.inner_text("body")
            except Exception:
                pass
            price = extract_price(body_text)
            if price:
                log(f"      PRICE FOUND (final): {price}")
                return price
            log(f"      Could not advance further after {round_num} rounds")
            break

    await asyncio.sleep(2)
    try:
        body_text = await page.inner_text("body")
        price = extract_price(body_text)
        if price:
            return price
    except Exception:
        pass

    return "NOT AVAILABLE"


# ── Discover variants on a model page ─────────────────────────────────────────────
async def get_model_variants(page, model_url: str, model_name: str):
    """
    Open the model page and discover what variants Cashify shows.
    Returns list of variant label strings as shown by Cashify.
    """
    for attempt in range(3):
        try:
            await page.goto(model_url, wait_until="domcontentloaded", timeout=NAV_TIMEOUT)
            await asyncio.sleep(2)
            for _ in range(3):
                await page.evaluate("window.scrollBy(0, 600)")
                await asyncio.sleep(0.4)
            break
        except Exception as e:
            if attempt == 2:
                log(f"    FAILED to load model page: {e}")
                return []
            await asyncio.sleep(3)

    variant_text_pattern = re.compile(
        r"(\d+\s*(?:GB|TB)(?:\s*/\s*\d+\s*(?:GB|TB))?)",
        re.IGNORECASE
    )

    candidate_selectors = [
        "button", "label",
        "div[class*='variant']", "div[class*='Variant']",
        "div[class*='storage']", "div[class*='Storage']",
        "div[class*='memory']", "div[class*='Memory']",
        "div[class*='option']", "div[class*='Option']",
        "div[class*='chip']",
        "div[class*='pill']",
        "div[class*='card']",
        "span[class*='variant']", "span[class*='option']",
        "li",
    ]

    seen_variants = set()
    ordered_variants = []

    for sel in candidate_selectors:
        try:
            els = await page.query_selector_all(sel)
            for el in els:
                try:
                    if not await el.is_visible():
                        continue
                    txt = (await el.inner_text()).strip()
                    if not txt or len(txt) > 40:
                        continue
                    if variant_text_pattern.search(txt):
                        norm = re.sub(r"\s+", " ", txt.strip())
                        if norm not in seen_variants:
                            seen_variants.add(norm)
                            ordered_variants.append(norm)
                except Exception:
                    pass
        except Exception:
            pass

    try:
        base_slug = model_url.split("/used-")[-1]
        all_links = await page.query_selector_all("a[href*='/sell-old-mobile-phone/used-']")
        for link in all_links:
            try:
                href = await link.get_attribute("href") or ""
                txt = (await link.inner_text()).strip()
                if variant_text_pattern.search(txt) and base_slug in href:
                    norm = re.sub(r"\s+", " ", txt.strip())
                    if norm not in seen_variants:
                        seen_variants.add(norm)
                        ordered_variants.append(norm)
            except Exception:
                pass
    except Exception:
        pass

    return ordered_variants


# ── Discover all models for a brand ───────────────────────────────────────────────
async def get_brand_models(page, brand_url: str, brand_name: str):
    """
    Open brand page and collect all model URLs/names.
    Returns list of (model_name, model_url) tuples.
    """
    for attempt in range(3):
        try:
            await page.goto(brand_url, wait_until="domcontentloaded", timeout=NAV_TIMEOUT)
            await asyncio.sleep(2)
            for _ in range(6):
                await page.evaluate("window.scrollBy(0, 1500)")
                await asyncio.sleep(0.5)
            break
        except Exception as e:
            if attempt == 2:
                log(f"  FAILED to load brand page: {e}")
                return []
            await asyncio.sleep(3)

    raw = await page.evaluate("""
        () => {
            const results = [];
            const anchors = Array.from(document.querySelectorAll('a[href*="/sell-old-mobile-phone/used-"]'));
            for (const a of anchors) {
                const href = a.href.split('?')[0].split('#')[0].replace(/\\/+$/, '');
                const after = href.split('/sell-old-mobile-phone/used-')[1] || '';
                if (!after || after.includes('/')) continue;
                const text = (a.innerText || a.textContent || '').trim().replace(/\\n/g, ' ');
                results.push({ href, text });
            }
            return results;
        }
    """)

    seen = set()
    models = []
    for item in raw:
        href = item.get("href", "").strip()
        text = item.get("text", "").strip()
        if not href or href in seen:
            continue
        seen.add(href)
        name = re.sub(r"get\s*upto\s*[^\d]*([\d,]+)", "", text, flags=re.IGNORECASE)
        name = re.sub(r"sell\s*used\s*", "", name, flags=re.IGNORECASE)
        name = re.sub(r"\s+", " ", name).strip()
        if not name:
            slug = href.split("/used-")[-1]
            name = slug.replace("-", " ").title()
        models.append((name, href))

    return models


# ── Discover all brands ────────────────────────────────────────────────────────────
async def get_all_brands(page):
    """Return list of (brand_name, brand_url)."""
    await page.goto(BRANDS_URL, wait_until="domcontentloaded", timeout=NAV_TIMEOUT)
    await asyncio.sleep(2)
    for _ in range(4):
        await page.evaluate("window.scrollBy(0, 1200)")
        await asyncio.sleep(0.3)

    raw = await page.evaluate("""
        () => {
            const results = [];
            const anchors = Array.from(document.querySelectorAll('a[href*="/sell-old-mobile-phone/sell-"]'));
            for (const a of anchors) {
                const href = a.href.split('?')[0];
                const name = (a.innerText || a.textContent || '').trim().split('\\n')[0].trim();
                if (name && href) results.push({ name, href });
            }
            return results;
        }
    """)

    seen = set()
    brands = []
    for item in raw:
        href = item.get("href", "").strip()
        name = item.get("name", "").strip()
        if href and href not in seen:
            seen.add(href)
            brands.append((name or href.split("/sell-")[-1].replace("-", " ").title(), href))
    return brands


# ── Main flow ─────────────────────────────────────────────────────────────────────
async def main():
    log("=" * 60)
    log("CASHIFY MOBILE FULL INTERACTIVE FLOW SCRAPER")
    log("=" * 60)

    output_data = {}

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=HEADLESS,
            args=[
                "--no-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--start-maximized",
            ]
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
        price_page = await context.new_page()

        if TEST_ONLY:
            log(f"\n=== TEST MODE: {TEST_URL} ===")
            brands_to_process = [("APPLE (TEST)", None)]
            test_models = [("iPhone 6", TEST_URL)]
        else:
            log("\n=== DISCOVERING BRANDS ===")
            all_brands = await get_all_brands(nav_page)
            log(f"Found {len(all_brands)} brands")
            brands_to_process = [(b[0].upper(), b[1]) for b in all_brands]

        for brand_name, brand_url in brands_to_process:
            log(f"\n{'='*50}")
            log(f"BRAND: {brand_name}")
            log(f"{'='*50}")

            if TEST_ONLY:
                models = test_models
            else:
                models = await get_brand_models(nav_page, brand_url, brand_name)
                log(f"  Found {len(models)} models")

            brand_results = []

            for m_idx, (model_name, model_url) in enumerate(models, 1):
                log(f"\n  [{m_idx}/{len(models)}] MODEL: {model_name}")
                log(f"    URL: {model_url}")

                variants = await get_model_variants(nav_page, model_url, model_name)

                if not variants:
                    log(f"    No variants found on page -- treating as single variant")
                    variants = ["Standard"]

                log(f"    Variants found: {variants}")
                model_variant_prices = []

                for var_label in variants:
                    log(f"\n    VARIANT: {var_label}")
                    if var_label == "Standard":
                        try:
                            await price_page.goto(model_url, wait_until="domcontentloaded", timeout=NAV_TIMEOUT)
                            await asyncio.sleep(2)
                            body = await price_page.inner_text("body")
                            price = extract_price(body)
                        except Exception:
                            price = None
                        if not price:
                            price = await get_variant_price(price_page, model_url, var_label)
                    else:
                        price = await get_variant_price(price_page, model_url, var_label)

                    log(f"    -> Price: {price}")
                    model_variant_prices.append((var_label, price or "NOT AVAILABLE"))

                brand_results.append((model_name, model_variant_prices))

            output_data[brand_name] = brand_results

        await browser.close()

    log("\n=== WRITING OUTPUT ===")
    write_output(output_data)
    log("DONE.")


def write_output(data: dict):
    lines = []
    lines.append("=" * 50)
    lines.append("CASHIFY MOBILE PHONES - COMPLETE PRICE LIST")
    lines.append("=" * 50)
    lines.append("")

    total_brands = 0
    total_models = 0
    total_variants = 0
    priced = 0
    unpriced = 0

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

    lines.append("")
    lines.append("=" * 50)
    lines.append("FINAL SUMMARY")
    lines.append("=" * 50)
    lines.append(f"Total Brands: {total_brands}")
    lines.append(f"Total Models: {total_models}")
    lines.append(f"Total Variants: {total_variants}")
    lines.append(f"Variants with Cashify Prices: {priced}")
    lines.append(f"Variants without Cashify Prices: {unpriced}")

    text = "\n".join(lines)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(text)

    print(f"\nSaved to: {OUTPUT_FILE}")
    print(f"Brands: {total_brands} | Models: {total_models} | Variants: {total_variants} | Priced: {priced}")


if __name__ == "__main__":
    asyncio.run(main())
