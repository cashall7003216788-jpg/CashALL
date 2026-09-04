import urllib.request
import re
import json

url = "https://www.cashify.in/sell-old-mobile-phone/sell-vivo"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
}

req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=15) as resp:
    html = resp.read().decode('utf-8')

# Search for any json or model lists
scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
print(f"Total script tags: {len(scripts)}")
for i, s in enumerate(scripts):
    if 'Vivo' in s or 'vivo' in s:
        print(f"Script {i} contains 'Vivo', len {len(s)}")
        # check if it contains model names
        v_matches = re.findall(r'Vivo\s+V[0-9]+[a-zA-Z0-9\s]*', s)
        if v_matches:
            print(f"Sample V matches in script {i}: {list(set(v_matches))[:10]}")

# Also search overall HTML for Vivo V series
all_v = re.findall(r'Vivo\s+V[0-9]+[a-zA-Z0-9\s]*', html)
print(f"All V series in entire HTML: {sorted(list(set(all_v)))}")
