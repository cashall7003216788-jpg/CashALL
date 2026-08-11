import urllib.request
import re
import json
import time

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

def fetch_url(url):
    req = urllib.request.Request(url, headers=headers)
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                return resp.read().decode('utf-8')
        except Exception as e:
            time.sleep(1)
    return ""

# Fetch all brand links
mobile_brands_url = "https://www.cashify.in/sell-old-mobile-phone/brands"
laptop_brands_url = "https://www.cashify.in/sell-old-laptop/brands"

print("Fetching Mobile Brand Links...")
m_html = fetch_url(mobile_brands_url)
m_links = re.findall(r'href="(/sell-old-mobile-phone/sell-[^"]+)"', m_html)
m_links = list(set(m_links))

brand_order_map = {}

for link in m_links:
    brand_slug = link.split('/')[-1].replace('sell-', '')
    full_url = f"https://www.cashify.in{link}"
    print(f"Scraping exact model sequence for Mobile: {brand_slug}...")
    html = fetch_url(full_url)
    
    # Extract model titles in exact DOM order
    # Look for model names in links or card titles
    model_matches = re.findall(r'href="/sell-old-mobile-phone/sell-[^/]+/([^"]+)"', html)
    if not model_matches:
        model_matches = re.findall(r'<h3[^>]*>([^<]+)</h3>', html)
        
    cleaned_sequence = []
    for m in model_matches:
        # Clean slug or title into normalized model identifier
        norm = m.replace('sell-', '').replace('-', ' ').strip().lower()
        if len(norm) > 2 and norm not in cleaned_sequence and 'brands' not in norm:
            cleaned_sequence.append(norm)
            
    brand_order_map[brand_slug] = cleaned_sequence
    time.sleep(0.3)

print("Fetching Laptop Brand Links...")
l_html = fetch_url(laptop_brands_url)
l_links = re.findall(r'href="(/sell-old-laptop/sell-[^"]+)"', l_html)
l_links = list(set(l_links))

for link in l_links:
    brand_slug = link.split('/')[-1].replace('sell-', '')
    full_url = f"https://www.cashify.in{link}"
    print(f"Scraping exact model sequence for Laptop: {brand_slug}...")
    html = fetch_url(full_url)
    model_matches = re.findall(r'href="/sell-old-laptop/sell-[^/]+/([^"]+)"', html)
    if not model_matches:
        model_matches = re.findall(r'<h3[^>]*>([^<]+)</h3>', html)
        
    cleaned_sequence = []
    for m in model_matches:
        norm = m.replace('sell-', '').replace('-', ' ').strip().lower()
        if len(norm) > 2 and norm not in cleaned_sequence:
            cleaned_sequence.append(norm)
            
    brand_order_map[f"laptop_{brand_slug}"] = cleaned_sequence
    time.sleep(0.3)

with open('scratch/cashify_exact_sequences.json', 'w', encoding='utf-8') as f:
    json.dump(brand_order_map, f, indent=2)

print("Saved scratch/cashify_exact_sequences.json!")
