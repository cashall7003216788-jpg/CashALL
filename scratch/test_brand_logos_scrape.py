import urllib.request
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

urls = [
    "https://www.cashify.in/sell-old-mobile-phone/brands",
    "https://www.cashify.in/sell-old-laptop/brands"
]

all_brands = {}

for url in urls:
    print(f"\n=== Fetching: {url} ===")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8')
            
            # Try __NEXT_DATA__
            next_match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html, re.DOTALL)
            if next_match:
                data = json.loads(next_match.group(1))
                page_props = data.get('props', {}).get('pageProps', {})
                raw_brands = (
                    page_props.get('brands', []) or
                    page_props.get('allBrands', []) or
                    page_props.get('categoryData', {}).get('brands', [])
                )
                print(f"Found {len(raw_brands)} brands in __NEXT_DATA__ for {url}")
                for b in raw_brands:
                    name = b.get('name') or b.get('brandName')
                    slug = b.get('slug') or b.get('brandSlug')
                    logo = b.get('logoUrl') or b.get('image') or b.get('imgUrl') or b.get('logo')
                    if name and logo:
                        all_brands[name.lower()] = {
                            'name': name,
                            'slug': slug or name.lower().replace(' ', '-'),
                            'logo': logo.replace('s3ng.cashify.in', 's3n.cashify.in')
                        }

            # Regex search for brand logos in HTML
            # HTML pattern: img alt="Brand Name" src="https://s3n.cashify.in/cashify/brand/..."
            img_matches = re.findall(r'alt="([^"]+)"[^>]*src="(https://s3n[^\.]*\.cashify\.in/cashify/brand/img/[^"]+)"', html)
            if not img_matches:
                img_matches = re.findall(r'src="(https://s3n[^\.]*\.cashify\.in/cashify/brand/img/[^"]+)"[^>]*alt="([^"]+)"', html)
                img_matches = [(name, src) for src, name in img_matches]

            print(f"Found {len(img_matches)} brand image matches via regex for {url}")
            for name, logo in img_matches:
                clean_logo = logo.replace('s3ng.cashify.in', 's3n.cashify.in')
                all_brands[name.lower()] = {
                    'name': name,
                    'slug': name.lower().replace(' ', '-'),
                    'logo': clean_logo
                }

    except Exception as e:
        print(f"Error fetching {url}: {e}")

print(f"\nTotal unique brand logos scraped: {len(all_brands)}")
for b_key, b_info in list(all_brands.items())[:20]:
    print(f" - {b_info['name']}: {b_info['logo']}")

with open('scratch/scraped_brand_logos.json', 'w', encoding='utf-8') as f:
    json.dump(all_brands, f, indent=2)
