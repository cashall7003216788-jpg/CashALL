import urllib.request
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
}

test_urls = [
    "https://www.cashify.in/sell-old-laptop/brands",
    "https://www.cashify.in/sell-old-laptop-phone",
    "https://www.cashify.in/sell-used-laptops-online",
    "https://www.cashify.in/sell-old-gadgets"
]

for url in test_urls:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f"SUCCESS ({resp.status}): {url}")
            html = resp.read().decode('utf-8')
            links = re.findall(r'href="([^"]*laptop[^"]*)"', html, re.IGNORECASE)
            print(f"Found {len(links)} laptop links on {url}:")
            for l in list(set(links))[:10]:
                print("  -", l)
    except Exception as e:
        print(f"FAILED ({url}): {e}")
