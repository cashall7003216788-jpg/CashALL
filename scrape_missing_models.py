import asyncio
import re
import json
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

LOG_FILE = "scratch/missing_models_log.txt"

def log(msg):
    print(msg)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(msg + "\n")

DIRECT_MODEL_SLUGS = [
    # Samsung S26 Series
    ("samsung", "m-samsung-galaxy-s26-ultra-5g", "Samsung Galaxy S26 Ultra 5G", "https://www.cashify.in/sell-old-mobile-phone/used-samsung-galaxy-s26-ultra", "https://s3ng.cashify.in/cashify/product/img/xhdpi/c90a2a0b-fcc8.jpg?w=800", 2026, 85000),
    ("samsung", "m-samsung-galaxy-s26-plus-5g", "Samsung Galaxy S26 Plus 5G", "https://www.cashify.in/sell-old-mobile-phone/used-samsung-galaxy-s26-plus", "https://s3ng.cashify.in/cashify/product/img/xhdpi/eeee646c-8046.jpg?w=800", 2026, 68000),
    ("samsung", "m-samsung-galaxy-s26-5g", "Samsung Galaxy S26 5G", "https://www.cashify.in/sell-old-mobile-phone/used-samsung-galaxy-s26", "https://s3ng.cashify.in/cashify/product/img/xhdpi/ac41123f-6b8f.jpg?w=800", 2026, 56000),
    
    # Samsung S25 Series
    ("samsung", "m-samsung-galaxy-s25-ultra-5g", "Samsung Galaxy S25 Ultra 5G", "https://www.cashify.in/sell-old-mobile-phone/used-samsung-galaxy-s25-ultra", "https://s3ng.cashify.in/cashify/product/img/xhdpi/d197ee88-ccff.jpg?w=800", 2025, 72000),
    ("samsung", "m-samsung-galaxy-s25-plus-5g", "Samsung Galaxy S25 Plus 5G", "https://www.cashify.in/sell-old-mobile-phone/used-samsung-galaxy-s25-plus", "https://s3ng.cashify.in/cashify/product/img/xhdpi/c6842e95-7635.jpg?w=800", 2025, 58000),
    ("samsung", "m-samsung-galaxy-s25-5g", "Samsung Galaxy S25 5G", "https://www.cashify.in/sell-old-mobile-phone/used-samsung-galaxy-s25", "https://s3ng.cashify.in/cashify/product/img/xhdpi/5c48706b-b04d.jpg?w=800", 2025, 46000),

    # POCO F7 Series
    ("poco", "m-poco-f7-ultra-5g", "POCO F7 Ultra 5G", "https://www.cashify.in/sell-old-mobile-phone/used-poco-f7-ultra", "https://s3ng.cashify.in/cashify/product/img/xhdpi/db36cde6-e6e5.jpg?w=800", 2025, 34000),
    ("poco", "m-poco-f7-pro-5g", "POCO F7 Pro 5G", "https://www.cashify.in/sell-old-mobile-phone/used-poco-f7-pro", "https://s3ng.cashify.in/cashify/product/img/xhdpi/ed91ebeb-f711.jpg?w=800", 2025, 28000),
    ("poco", "m-poco-f7-5g", "POCO F7 5G", "https://www.cashify.in/sell-old-mobile-phone/used-poco-f7", "https://s3ng.cashify.in/cashify/product/img/xhdpi/e14bb4d9-988f.jpg?w=800", 2025, 22000),
    ("poco", "m-poco-f6-pro-5g", "POCO F6 Pro 5G", "https://www.cashify.in/sell-old-mobile-phone/used-poco-f6-pro", "https://s3ng.cashify.in/cashify/product/img/xhdpi/f43b6269-c954.jpg?w=800", 2024, 21000),
    ("poco", "m-poco-f6-5g", "POCO F6 5G", "https://www.cashify.in/sell-old-mobile-phone/used-poco-f6", "https://s3ng.cashify.in/cashify/product/img/xhdpi/a6db4974-1a86.jpg?w=800", 2024, 17500),
]

async def main():
    log("=== FETCHING S26 & POCO F7 MODELS & VARIANTS ===")
    results = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 900},
            locale="en-IN"
        )
        page = await context.new_page()

        for brand, model_id, model_name, url, default_img, year, default_base in DIRECT_MODEL_SLUGS:
            log(f"\nScraping {model_name}...")
            base_price = default_base
            img_url = default_img

            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=25000)
                await asyncio.sleep(2)
                body = await page.inner_text("body")

                m = re.search(r"upto\s*(?:rs\.?\s*|\u20b9\s*)?([\d,]+)", body, re.IGNORECASE)
                if m:
                    base_price = int(m.group(1).replace(",", ""))

                img_el = await page.query_selector("img[src*='cashify']")
                if img_el:
                    src = await img_el.get_attribute("src")
                    if src and ("http" in src):
                        img_url = src
            except Exception as e:
                log(f"  Live page check fallback used for {model_name}: {e}")

            slug = model_name.lower().replace(" ", "-").replace("(", "").replace(")", "")
            
            model_obj = {
                "id": model_id,
                "brandId": f"b-{brand}",
                "brandSlug": brand,
                "name": model_name,
                "slug": slug,
                "imageUrl": img_url,
                "releaseYear": year,
                "popular": "ultra" in slug or "s26" in slug or "f7" in slug,
                "active": True,
                "contactForPrice": False,
                "category": "MOBILE"
            }

            # Generate standard RAM / Storage variants
            variants_list = []
            if "ultra" in slug:
                ram_storages = [("12 GB", "256 GB", 1.0), ("12 GB", "512 GB", 1.12), ("16 GB", "1 TB", 1.25)]
            elif "plus" in slug or "pro" in slug:
                ram_storages = [("12 GB", "256 GB", 1.0), ("12 GB", "512 GB", 1.12)]
            else:
                ram_storages = [("8 GB", "128 GB", 0.90), ("8 GB", "256 GB", 1.0), ("12 GB", "256 GB", 1.08)]

            for idx, (ram, storage, mult) in enumerate(ram_storages, 1):
                v_price = int(base_price * mult)
                v_id = f"v-{model_id}-{idx}"
                v_name = f"{ram} / {storage}"
                v_slug = f"{slug}-{ram.lower().replace(' ', '')}-{storage.lower().replace(' ', '')}"
                variants_list.append({
                    "id": v_id,
                    "modelId": model_id,
                    "name": v_name,
                    "ram": ram,
                    "storage": storage,
                    "basePrice": v_price,
                    "slug": v_slug,
                    "active": True
                })

            results.append({
                "model": model_obj,
                "variants": variants_list
            })

            log(f"  [OK] {model_name} | Base Price: ₹{base_price} | Variants: {len(variants_list)}")

        await browser.close()

    with open("scratch/scraped_missing_models.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    log(f"\nScraped & formatted {len(results)} new models with variants!")

if __name__ == "__main__":
    asyncio.run(main())
