import urllib.request
import re
import json
import time

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

def get_cashify_brand_models(brand_slug, category="mobile"):
    if category == "mobile":
        url = f"https://www.cashify.in/sell-old-mobile-phone/sell-{brand_slug}"
    else:
        url = f"https://www.cashify.in/sell-old-laptop/sell-{brand_slug}"
        
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            html = resp.read().decode('utf-8')
            
            # Find all model title tags or model URLs
            # Cashify renders model titles inside <h3> or <div> cards
            # Pattern for model links: /sell-old-mobile-phone/sell-samsung/samsung-galaxy-s24-ultra-5g
            if category == "mobile":
                matches = re.findall(rf'href="/sell-old-mobile-phone/sell-{brand_slug}/([^"#]+)"', html)
            else:
                matches = re.findall(rf'href="/sell-old-laptop/sell-{brand_slug}/([^"#]+)"', html)
                
            models_ordered = []
            for m in matches:
                if 'brands' in m or 'sell-' in m or m.startswith('page'):
                    continue
                # Convert slug to name (e.g. samsung-galaxy-s24-ultra-5g -> Samsung Galaxy S24 Ultra 5G)
                clean_name = m.replace('used-', '').replace('-', ' ').strip().title()
                # Fix 5G / 4G / Ultra casing
                clean_name = re.sub(r'\b5G\b', '5G', clean_name, flags=re.IGNORECASE)
                clean_name = re.sub(r'\b4G\b', '4G', clean_name, flags=re.IGNORECASE)
                clean_name = re.sub(r'\bFe\b', 'FE', clean_name)
                clean_name = re.sub(r'\bSe\b', 'SE', clean_name)
                clean_name = re.sub(r'\bPro Max\b', 'Pro Max', clean_name, flags=re.IGNORECASE)
                
                if clean_name not in models_ordered:
                    models_ordered.append(clean_name)
                    
            return models_ordered
    except Exception as e:
        print(f"Error fetching {brand_slug}: {e}")
        return []

mobile_brands = [
    "samsung", "apple", "oneplus", "vivo", "oppo", "realme", "xiaomi", 
    "google", "poco", "motorola", "honor", "infinix", "iqoo", "tecno", 
    "lg", "lenovo", "nokia", "asus", "nothing"
]

laptop_brands = [
    "apple", "dell", "hp-compaq", "lenovo", "asus", "acer", "msi", 
    "microsoft", "avita", "samsung", "realme", "honor", "nokia", "lg"
]

brand_models_map = {}

print("Scraping exact Cashify model sequence for Mobile brands...")
for b in mobile_brands:
    print(f"Scraping Mobile: {b}...")
    models = get_cashify_brand_models(b, "mobile")
    print(f" -> Found {len(models)} models for {b}")
    brand_models_map[f"mobile_{b}"] = models
    time.sleep(0.5)

print("\nScraping exact Cashify model sequence for Laptop brands...")
for b in laptop_brands:
    print(f"Scraping Laptop: {b}...")
    models = get_cashify_brand_models(b, "laptop")
    print(f" -> Found {len(models)} models for {b}")
    brand_models_map[f"laptop_{b}"] = models
    time.sleep(0.5)

with open('scratch/exact_cashify_models_map.json', 'w', encoding='utf-8') as f:
    json.dump(brand_models_map, f, indent=2)

print("\nSuccessfully saved scratch/exact_cashify_models_map.json!")
