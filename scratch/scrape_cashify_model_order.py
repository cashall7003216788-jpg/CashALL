import urllib.request
import re
import json
import time

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

def fetch_url(url):
    req = urllib.request.Request(url, headers=headers)
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                return resp.read().decode('utf-8')
        except Exception as e:
            print(f"Error fetching {url} (attempt {attempt+1}): {e}")
            time.sleep(2)
    return ""

mobile_brands_url = "https://www.cashify.in/sell-old-mobile-phone/brands"
laptop_brands_url = "https://www.cashify.in/sell-old-laptop/brands"

print("Fetching Mobile Brands page...")
mobile_html = fetch_url(mobile_brands_url)

# Find all mobile brand links e.g. /sell-old-mobile-phone/sell-apple
mobile_brand_links = re.findall(r'href="(/sell-old-mobile-phone/sell-[^"]+)"', mobile_html)
mobile_brand_links = list(set(mobile_brand_links))
print(f"Found {len(mobile_brand_links)} mobile brand links!")

ordered_catalog = {}

for link in mobile_brand_links:
    brand_slug = link.split('/')[-1].replace('sell-', '')
    full_url = f"https://www.cashify.in{link}"
    print(f"Scraping models for mobile brand: {brand_slug}...")
    html = fetch_url(full_url)
    
    # Extract model names in order of appearance
    # Cashify model titles are inside <h3> or <div> or script tags
    models = re.findall(r'<h3[^>]*>([^<]+)</h3>', html)
    if not models:
        models = re.findall(r'"name"\s*:\s*"Sell Old ([^"]+)"', html)
    if not models:
        models = re.findall(r'"name"\s*:\s*"([^"]+)"', html)
    
    # Clean model names
    cleaned_models = []
    for m in models:
        c = m.replace('Sell Old ', '').strip()
        if len(c) > 3 and c not in cleaned_models and 'Mobile' not in c and 'Phone' not in c and 'Cashify' not in c:
            cleaned_models.append(c)
            
    ordered_catalog[f"mobile_{brand_slug}"] = cleaned_models
    time.sleep(0.5)

print("\nFetching Laptop Brands page...")
laptop_html = fetch_url(laptop_brands_url)
laptop_brand_links = re.findall(r'href="(/sell-old-laptop/sell-[^"]+)"', laptop_html)
laptop_brand_links = list(set(laptop_brand_links))
print(f"Found {len(laptop_brand_links)} laptop brand links!")

for link in laptop_brand_links:
    brand_slug = link.split('/')[-1].replace('sell-', '')
    full_url = f"https://www.cashify.in{link}"
    print(f"Scraping models for laptop brand: {brand_slug}...")
    html = fetch_url(full_url)
    models = re.findall(r'<h3[^>]*>([^<]+)</h3>', html)
    if not models:
        models = re.findall(r'"name"\s*:\s*"Sell Old ([^"]+)"', html)
        
    cleaned_models = []
    for m in models:
        c = m.replace('Sell Old ', '').strip()
        if len(c) > 3 and c not in cleaned_models and 'Laptop' not in c and 'Cashify' not in c:
            cleaned_models.append(c)
            
    ordered_catalog[f"laptop_{brand_slug}"] = cleaned_models
    time.sleep(0.5)

with open('scratch/cashify_ordered_models.json', 'w', encoding='utf-8') as f:
    json.dump(ordered_catalog, f, indent=2)

print("Saved scratch/cashify_ordered_models.json!")
