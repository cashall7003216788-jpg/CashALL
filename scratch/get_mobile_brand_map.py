import urllib.request
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
req = urllib.request.Request('https://www.cashify.in/sell-old-mobile-phone/brands', headers=headers)
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8')

# Find img tags inside brand cards
img_matches = re.findall(r'<img[^>]+src="([^"]+)"[^>]+alt="([^"]+)"', html)
img_matches += [(src, alt) for alt, src in re.findall(r'<img[^>]+alt="([^"]+)"[^>]+src="([^"]+)"', html)]

print("=== ALL MOBILE BRANDS & LOGOS ===")
for src, alt in img_matches:
    if 's3ng.cashify.in/cashify/brand' in src:
        print(f"Name: {alt} | Logo: {src}")
