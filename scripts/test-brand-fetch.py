import urllib.request
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

for brand in ['dell', 'hp', 'lenovo']:
    url = f"https://www.cashify.in/sell-old-laptop/sell-{brand}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8')
            print(f"Brand: {brand}, status: 200, length: {len(html)}")
            # Search for model series or models
            # In HTML, let's see how models or series are linked
            series = re.findall(r'href="(/sell-old-laptop/[^"]+)"', html)
            print(f"  Found {len(series)} laptop links for {brand}. Sample:", series[:10])
    except Exception as e:
        print(f"Error fetching {brand}: {e}")
