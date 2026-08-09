import json
import re
import asyncio
from playwright.async_api import async_playwright

with open(r'c:\Users\DELL\OneDrive\Desktop\CashALL\dataset.json', 'r', encoding='utf-8') as f:
    dataset = json.load(f)

# Brand logo mapping
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
    "Lg": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/99464522-83b6.jpg?w=200",
    "LG": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/99464522-83b6.jpg?w=200",
    "Infinix": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/81729b28-c1e0.jpg?w=200",
    "Tecno": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/1f11e3b6-79ef.jpg?w=200",
    "iQOO": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/0c83a152-bf6d.jpg?w=200",
    "Nothing": "https://s3ng.cashify.in/cashify/brand/img/xhdpi/8fa08e70-07bf.jpg?w=200"
}

# High quality phone mockup fallback renders per brand
BRAND_PHONE_RENDER_FALLBACK = {
    "Apple": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
    "Samsung": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
    "Xiaomi": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
    "OnePlus": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80",
    "Google": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
    "Vivo": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
    "OPPO": "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=600&auto=format&fit=crop&q=80",
    "Realme": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80",
    "Motorola": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80",
    "POCO": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
    "Nokia": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
    "iQOO": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80",
    "Nothing": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80"
}

async def fetch_cashify_images():
    image_map = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        
        # We fetch for a sample of top items across brands
        for item in dataset[:120]:
            slug = item['slug']
            url = f"https://www.cashify.in/sell-old-mobile-phone/{slug}"
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=6000)
                await page.wait_for_timeout(800)
                img_src = await page.evaluate('''() => {
                    const img = document.querySelector('img[src*="cashify/product/img"]');
                    return img ? img.src : null;
                }''')
                if img_src:
                    image_map[item['id']] = img_src
                    print(f"Extracted image for {item['model']}: {img_src}")
            except Exception:
                pass
        await browser.close()
    return image_map

async def main():
    print("Fetching live Cashify product images for sample models...")
    live_imgs = await fetch_cashify_images()
    print(f"Live images extracted for {len(live_imgs)} models.")
    
    for item in dataset:
        item['brandLogo'] = BRAND_LOGOS.get(item['brand'], "https://s3ng.cashify.in/cashify/brand/img/xhdpi/2e7cdc22-5a5f.jpg?w=200")
        if item['id'] in live_imgs:
            item['image'] = live_imgs[item['id']]
        else:
            fallback = BRAND_PHONE_RENDER_FALLBACK.get(item['brand'], "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80")
            item['image'] = fallback

    with open(r'c:\Users\DELL\OneDrive\Desktop\CashALL\dataset.json', 'w', encoding='utf-8') as f:
        json.dump(dataset, f, indent=2)

    with open(r'c:\Users\DELL\OneDrive\Desktop\CashALL\dataset.js', 'w', encoding='utf-8') as f:
        f.write('const MOBILE_DATASET = ' + json.dumps(dataset, indent=2) + ';')

    print("Updated dataset.json and dataset.js with logo and image URLs!")

if __name__ == '__main__':
    asyncio.run(main())
