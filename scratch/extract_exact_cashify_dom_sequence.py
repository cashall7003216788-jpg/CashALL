import urllib.request
import json
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

def inspect_cashify_brand_page(url):
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8')
            
            # Check for __NEXT_DATA__ JSON script block
            next_data = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html, re.DOTALL)
            if next_data:
                json_str = next_data.group(1)
                data = json.loads(json_str)
                print("Found __NEXT_DATA__ JSON!")
                # Extract product/model lists from JSON props
                props = data.get('props', {}).get('pageProps', {})
                return props, html
            return None, html
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None, ""

props, html = inspect_cashify_brand_page("https://www.cashify.in/sell-old-mobile-phone/sell-samsung")
if props:
    print("Page props keys:", list(props.keys()))
    # Write props to JSON file to inspect
    with open('scratch/samsung_props.json', 'w', encoding='utf-8') as f:
        json.dump(props, f, indent=2)
else:
    print("No props found. Writing raw HTML to scratch/samsung_raw.html...")
    with open('scratch/samsung_raw.html', 'w', encoding='utf-8') as f:
        f.write(html)
