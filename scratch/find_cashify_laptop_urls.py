import urllib.request
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

test_urls = [
    "https://www.cashify.in/sell-used-laptops",
    "https://www.cashify.in/sell-laptop",
    "https://www.cashify.in/sell-old-laptop-online",
    "https://www.cashify.in/sell-used-laptop"
]

for url in test_urls:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f"SUCCESS ({resp.status}): {url}")
            html = resp.read().decode('utf-8')
            next_data = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html, re.DOTALL)
            if next_data:
                data = json.loads(next_data.group(1))
                page_props = data.get('props', {}).get('pageProps', {})
                print(f"PageProps keys for {url}: {list(page_props.keys())}")
                brands = page_props.get('brands', []) or page_props.get('allBrands', [])
                if brands:
                    print(f"Found {len(brands)} brands: {[b.get('name') or b.get('slug') for b in brands[:10]]}")
    except Exception as e:
        print(f"FAILED ({url}): {e}")
