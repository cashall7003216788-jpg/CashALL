import urllib.request
import re
import json
import time

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
}

def fetch_url(url):
    req = urllib.request.Request(url, headers=headers)
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                return resp.read().decode('utf-8')
        except Exception:
            time.sleep(1)
    return ""

print("Checking store models against Cashify latest brand pages...")

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract model names from store.ts
existing_names = set(re.findall(r'"name"\s*:\s*"([^"]+)"', content))
print(f"Total existing models in CashALL store: {len(existing_names)}")

# Check mobile brands
mobile_url = "https://www.cashify.in/sell-old-mobile-phone/brands"
m_html = fetch_url(mobile_url)
m_links = re.findall(r'href="(/sell-old-mobile-phone/sell-[^"]+)"', m_html)
m_links = list(set(m_links))

missing_models = []

for link in m_links:
    brand_slug = link.split('/')[-1].replace('sell-', '')
    full_url = f"https://www.cashify.in{link}"
    print(f"Auditing latest models for brand: {brand_slug}...")
    html = fetch_url(full_url)
    slug_matches = re.findall(r'href="/sell-old-mobile-phone/sell-[^/]+/used-([^"]+)"', html)
    if not slug_matches:
        slug_matches = re.findall(r'href="/sell-old-mobile-phone/sell-[^/]+/([^"]+)"', html)
        
    for s in slug_matches:
        if "brands" in s or "sell-" in s or len(s) < 3:
            continue
        title_clean = s.replace('-', ' ').title()
        # Check if matching title is in existing names
        found = any(title_clean.lower() in e.lower() for e in existing_names)
        if not found:
            missing_models.append((brand_slug, title_clean))

print(f"\nAudit complete! Found {len(missing_models)} missing models from Cashify.")
for b_slug, m_title in missing_models[:20]:
    print(f" - [{b_slug}] {m_title}")

