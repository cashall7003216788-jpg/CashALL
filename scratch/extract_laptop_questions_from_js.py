import urllib.request
import re
import json

with open('scratch/laptop_calculator_page.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find all JS bundle URLs in HTML
js_urls = re.findall(r'src="([^"]+\.js[^"]*)"', html)
print(f"Found {len(js_urls)} JS chunk files in laptop calculator HTML.")

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
}

all_found_questions = []
all_found_icons = []

for idx, rel_url in enumerate(js_urls):
    if rel_url.startswith('/'):
        url = "https://www.cashify.in" + rel_url
    else:
        url = rel_url
        
    # Only fetch calculator, sell, or app JS chunks
    if any(k in url.lower() for k in ['calculator', 'sell', 'app', 'page', 'main', 'chunks']):
        print(f"Fetching JS #{idx}: {url}...")
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                js_content = resp.read().decode('utf-8')
                
                # Search for laptop specific questions or option titles
                # E.g., "Are all physical components functioning?", "Does laptop turn on?", "Screen condition", "Original Charger", etc.
                matches = re.findall(r'"([^"]*?(?:turn on|charger|battery|screen|keyboard|trackpad|body|defect|functional|warranty|bill|box|laptop)[^"]*?)"', js_content, re.IGNORECASE)
                if matches:
                    for m in matches:
                        if len(m) > 5 and len(m) < 100 and m not in all_found_questions:
                            all_found_questions.append(m)
                            
                # Find s3n.cashify.in image URLs
                img_matches = re.findall(r'(https?://s3n\.cashify\.in/[^\s"\']+\.(?:png|jpg|jpeg|svg|webp))', js_content)
                for img in img_matches:
                    if img not in all_found_icons:
                        all_found_icons.append(img)
        except Exception as e:
            print(f" -> Failed {url}: {e}")

print(f"\nExtracted {len(all_found_questions)} laptop question phrases!")
for q in all_found_questions[:40]:
    print(" -", q)

print(f"\nExtracted {len(all_found_icons)} Cashify icon URLs!")
for icon in all_found_icons[:30]:
    print(" -", icon)

with open('scratch/scraped_laptop_questions_raw.json', 'w', encoding='utf-8') as f:
    json.dump({"questions": all_found_questions, "icons": all_found_icons}, f, indent=2)
