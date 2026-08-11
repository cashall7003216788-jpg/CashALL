import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

def get_html(url):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response:
        return response.read().decode('utf-8')

mobile_html = get_html('https://www.cashify.in/sell-old-mobile-phone/brands')
laptop_html = get_html('https://www.cashify.in/sell-old-laptop/brands')

print("Mobile HTML length:", len(mobile_html))
print("Laptop HTML length:", len(laptop_html))

# Extract image URLs and brand names from Next.js data or image tags
# Look for s3ng.cashify.in links or brand logo patterns
mobile_matches = re.findall(r'https://s3ng\.cashify\.in/cashify/brand/img/[^\s"\'<>]+', mobile_html)
laptop_matches = re.findall(r'https://s3ng\.cashify\.in/cashify/brand/img/[^\s"\'<>]+', laptop_html)

print("Mobile brand image matches:", len(set(mobile_matches)))
print("Laptop brand image matches:", len(set(laptop_matches)))

# Save raw output to file for inspection
with open('scratch/mobile_logos.json', 'w') as f:
    json.dump(list(set(mobile_matches)), f, indent=2)

with open('scratch/laptop_logos.json', 'w') as f:
    json.dump(list(set(laptop_matches)), f, indent=2)
