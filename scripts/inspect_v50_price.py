import urllib.request
import re

url = "https://www.cashify.in/sell-old-mobile-phone/used-vivo-v50"
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'}

req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=12) as r:
    html = r.read().decode('utf-8')

# Search for numbers followed or preceded by price-like terms or 20,270 / 22,800 / 23,000
for p in ['20270', '22800', '23000', 'price', 'basePrice', 'maxPrice', 'bbmp']:
    matches = re.findall(rf'[^"\'<>]{{0,30}}{p}[^"\'<>]{{0,30}}', html, re.IGNORECASE)
    print(f"Matches for {p}: {len(matches)}")
    if matches:
        print("  Sample:", matches[:5])
