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

chunks = re.findall(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)', html)
full_data = "".join(chunks).replace('\\"', '"').replace('\\\\', '\\')
print(f"Full RSC payload length: {len(full_data)}")

# Search for models inside full_data
models = re.findall(r'\{\s*"id":\s*(\d+),\s*"name":\s*"([^"]+)",\s*"slug":\s*"([^"]+)"', full_data)
print(f"Models matched: {len(models)}")
for mid, name, slug in models[:20]:
    print(f"{mid} | {name} | {slug}")

# Search for any V series:
v_series = [m for m in models if 'v' in m[1].lower()]
print(f"V series count: {len(v_series)}")
for mid, name, slug in v_series:
    print(f"  {mid} | {name} | {slug}")

# Also search for 'V50', 'V60', 'V70' in full_data
for term in ['V50', 'V50e', 'V60', 'V60e', 'V70', 'Elite', 'FE']:
    found = re.findall(rf'[^",{{}}]{{0,20}}{term}[^",{{}}]{{0,20}}', full_data)
    print(f"Term '{term}': {found[:5]}")
