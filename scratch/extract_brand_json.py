import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

def fetch_and_extract(url):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
    
    match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html, re.DOTALL)
    if match:
        data = json.loads(match.group(1))
        return data
    return None

mobile_data = fetch_and_extract('https://www.cashify.in/sell-old-mobile-phone/brands')
laptop_data = fetch_and_extract('https://www.cashify.in/sell-old-laptop/brands')

# Extract brand objects from pageProps
def find_brands(obj):
    results = []
    if isinstance(obj, dict):
        if 'brand' in obj or ('name' in obj and ('logo' in obj or 'img' in obj or 'icon' in obj or 'image' in obj)):
            results.append(obj)
        for k, v in obj.items():
            results.extend(find_brands(v))
    elif isinstance(obj, list):
        for item in obj:
            results.extend(find_brands(item))
    return results

with open('scratch/mobile_next_data.json', 'w') as f:
    json.dump(mobile_data, f, indent=2)

with open('scratch/laptop_next_data.json', 'w') as f:
    json.dump(laptop_data, f, indent=2)

print("Saved NEXT DATA json files successfully")
