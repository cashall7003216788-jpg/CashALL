import urllib.request
import re

url = "https://www.cashify.in/sell-old-mobile-phone/sell-vivo"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
}

req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=15) as resp:
    html = resp.read().decode('utf-8')

# Search for any occurrence of "v40" or "v30" or "v29"
for v in ['v27', 'v29', 'v30', 'v40', 'v50']:
    m = re.findall(rf'[^"\'<>\n]{{0,30}}{v}[^"\'<>\n]{{0,30}}', html, re.IGNORECASE)
    print(f"Match for {v}: count = {len(m)}")
    if m:
        print("  Sample:", set(m[:5]))
