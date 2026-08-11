import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

def scrape_brands_and_images(url):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')

    # Match patterns like: alt="Sell Old Apple Phone" src="https://s3ng.cashify.in/cashify/brand/img/xhdpi/..."
    # or brand title followed by image
    items = re.findall(r'<img[^>]+alt="([^"]+)"[^>]+src="([^"]+)"', html)
    if not items:
        # Try matching src first then alt
        items = re.findall(r'<img[^>]+src="([^"]+)"[^>]+alt="([^"]+)"', html)
        items = [(alt, src) for src, alt in items]
    
    # Also find all s3ng.cashify.in image URLs
    all_s3 = set(re.findall(r'https://s3ng\.cashify\.in/cashify/brand/img/[^\s"\'<>]+', html))
    
    return items, all_s3

m_items, m_s3 = scrape_brands_and_images('https://www.cashify.in/sell-old-mobile-phone/brands')
l_items, l_s3 = scrape_brands_and_images('https://www.cashify.in/sell-old-laptop/brands')

print("=== MOBILE BRAND IMAGES FOUND ===")
for alt, src in m_items:
    if 'brand' in alt.lower() or 'sell' in alt.lower() or 'phone' in alt.lower() or 'mobile' in alt.lower():
        print(f"ALT: {alt} => SRC: {src}")

print("\n=== ALL S3 MOBILE BRAND URLS ===")
for url in sorted(m_s3):
    print(url)

print("\n=== LAPTOP BRAND IMAGES FOUND ===")
for alt, src in l_items:
    print(f"ALT: {alt} => SRC: {src}")

print("\n=== ALL S3 LAPTOP BRAND URLS ===")
for url in sorted(l_s3):
    print(url)
