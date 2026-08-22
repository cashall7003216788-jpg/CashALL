import urllib.request
import re
import json
from concurrent.futures import ThreadPoolExecutor, as_completed

with open('dataset used/final_tablets.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Match model block with Cashify URL
blocks = re.findall(r'MODEL\s*:\s*([^\n]+)\s*\n\s*Cashify URL\s*:\s*(https?://[^\s]+)', text)
print(f"Found {len(blocks)} model+URL pairs in final_tablets.txt")

results = {}

def fetch_image(model_name, url):
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
            # Look for product image in img tags
            # e.g. https://s3ng.cashify.in/cashify/product/img/xhdpi/57301cf3a2212.jpg
            m = re.search(r'src="(https://s3ng\.cashify\.in/cashify/product/img/xhdpi/[^"?]+)', html)
            if not m:
                m = re.search(r'(https://s3ng\.cashify\.in/cashify/product/img/xhdpi/[a-zA-Z0-9_-]+\.(?:jpg|png|webp))', html)
            if m:
                img_url = m.group(1) + '?w=800'
                return (model_name, url, img_url)
    except Exception as e:
        pass
    return (model_name, url, None)

print("Fetching tablet product images from Cashify...")
with ThreadPoolExecutor(max_workers=15) as executor:
    futures = [executor.submit(fetch_image, name.strip(), u.strip()) for name, u in blocks]
    for future in as_completed(futures):
        m_name, u, img_url = future.result()
        if img_url:
            results[m_name.lower()] = img_url
            url_slug = u.split('/')[-1]
            results[url_slug] = img_url
            results[url_slug.replace('used-', '')] = img_url

print(f"Successfully scraped {len(results)} tablet image mappings!")
with open('dataset used/cashify_tablet_images.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)
print("Saved dataset used/cashify_tablet_images.json")
