import urllib.request
import re
import json
import time

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

def fetch_html(url):
    req = urllib.request.Request(url, headers=headers)
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                return resp.read().decode('utf-8')
        except Exception as e:
            print(f"Fetch attempt {attempt+1} error for {url}: {e}")
            time.sleep(1)
    return ""

print("=== Fetching Cashify Laptop Brands Page ===")
brands_url = "https://www.cashify.in/sell-old-laptop/brands"
b_html = fetch_html(brands_url)

brand_links = re.findall(r'href="(/sell-old-laptop/sell-[^"]+)"', b_html)
brand_links = list(set(brand_links))
print(f"Found {len(brand_links)} laptop brand pages on Cashify:")
for l in brand_links:
    print(" -", l)

all_laptops = []

for b_link in brand_links:
    b_slug = b_link.split('/')[-1].replace('sell-', '').lower()
    full_url = f"https://www.cashify.in{b_link}"
    print(f"\n--- Scraping Cashify models for brand: {b_slug} ({full_url}) ---")
    html = fetch_html(full_url)

    # 1. Try __NEXT_DATA__
    next_match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html, re.DOTALL)
    models_found = []
    if next_match:
        try:
            data = json.loads(next_match.group(1))
            page_props = data.get('props', {}).get('pageProps', {})
            raw_models = (
                page_props.get('models', []) or
                page_props.get('categoryData', {}).get('models', []) or
                page_props.get('brandData', {}).get('models', []) or
                page_props.get('initialState', {}).get('models', [])
            )
            for m in raw_models:
                m_name = m.get('name') or m.get('modelName') or m.get('title')
                m_img = m.get('imageUrl') or m.get('image') or m.get('imgUrl') or m.get('img')
                m_slug = m.get('slug') or m.get('modelSlug')
                m_price = m.get('basePrice') or m.get('price') or m.get('estimatedPrice') or 35000
                if m_name:
                    models_found.append({
                        'name': m_name,
                        'slug': m_slug or m_name.lower().replace(' ', '-'),
                        'image': m_img,
                        'price': m_price,
                        'brand': b_slug
                    })
        except Exception as e:
            print(f"Error parsing __NEXT_DATA__ for {b_slug}: {e}")

    # 2. If no models in __NEXT_DATA__, parse Next.js stream or html regex
    if not models_found:
        # Match href="/sell-old-laptop/used-..."
        model_hrefs = re.findall(r'href="(/sell-old-laptop/used-[^"]+)"', html)
        model_hrefs = list(set(model_hrefs))
        print(f"Found {len(model_hrefs)} model href links for {b_slug}")

        # Extract image & title pairs from html
        # Pattern matching img tags and titles
        img_matches = re.findall(r'src="(https://s3n[^\.]*\.cashify\.in/cashify/product/img/[^"]+)"[^>]*alt="([^"]+)"', html)
        if not img_matches:
            img_matches = re.findall(r'alt="([^"]+)"[^>]*src="(https://s3n[^\.]*\.cashify\.in/cashify/product/img/[^"]+)"', html)
            img_matches = [(img, title) for title, img in img_matches]

        for img_url, title in img_matches:
            if b_slug in title.lower() or 'macbook' in title.lower() or 'laptop' in title.lower():
                models_found.append({
                    'name': title,
                    'slug': title.lower().replace(' ', '-'),
                    'image': img_url,
                    'price': 35000,
                    'brand': b_slug
                })

    print(f"Successfully extracted {len(models_found)} models for {b_slug}")
    all_laptops.extend(models_found)

print(f"\nTotal scraped laptop models from Cashify: {len(all_laptops)}")
with open('scratch/cashify_scraped_laptops.json', 'w', encoding='utf-8') as f:
    json.dump(all_laptops, f, indent=2)
print("Saved all scraped laptop models to scratch/cashify_scraped_laptops.json")
