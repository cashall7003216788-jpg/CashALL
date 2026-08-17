import urllib.request
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

urls = [
    "https://www.cashify.in/sell-old-laptop/apple",
    "https://www.cashify.in/sell-old-laptop/dell",
    "https://www.cashify.in/sell-old-laptop/hp",
    "https://www.cashify.in/sell-old-laptop/lenovo",
    "https://www.cashify.in/sell-old-laptop/asus",
    "https://www.cashify.in/sell-old-laptop/acer"
]

all_scraped_models = []

for url in urls:
    print(f"Fetching: {url}")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8')
            next_data = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html, re.DOTALL)
            if next_data:
                data = json.loads(next_data.group(1))
                page_props = data.get('props', {}).get('pageProps', {})
                models = page_props.get('models', []) or page_props.get('categoryData', {}).get('models', []) or page_props.get('brandData', {}).get('models', [])
                print(f"Found {len(models)} models in __NEXT_DATA__")
                for m in models:
                    all_scraped_models.append(m)
            else:
                found_names = re.findall(r'"name"\s*:\s*"([^"]+Laptop[^"]*|MacBook[^"]*)"', html, re.IGNORECASE)
                print(f"Found {len(found_names)} model names via regex")
    except Exception as e:
        print(f"Error fetching {url}: {e}")

print(f"Total scraped models: {len(all_scraped_models)}")
if all_scraped_models:
    print("Sample model:", json.dumps(all_scraped_models[0], indent=2))
