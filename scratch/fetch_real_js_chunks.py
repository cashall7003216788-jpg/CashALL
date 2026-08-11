import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'}

with open('scratch/raw_page0.html', 'r', encoding='utf-8') as f:
    html = f.read()

srcs = re.findall(r'src="(/sell_/_next/static/chunks/[^"]+\.js)"', html)
print(f"Found {len(srcs)} JS chunks to download")

all_extracted_text = []

for rel_url in srcs:
    full_url = f"https://www.cashify.in{rel_url}"
    print(f"Fetching {rel_url}...")
    try:
        req = urllib.request.Request(full_url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            js_code = resp.read().decode('utf-8')
            
            # Find strings, question titles, option descriptions
            matches = re.findall(r'"([^"]{5,120})"', js_code)
            all_extracted_text.extend(matches)
    except Exception as e:
        print(f"  Failed: {e}")

# Filter for question text and icons
question_phrases = [m for m in all_extracted_text if any(term in m.lower() for term in ['call', 'touch', 'screen', 'camera', 'scratch', 'dent', 'box', 'charger', 'bill', 'warranty', 'flawless', 'battery', 'speaker', 'mic', 'fingerprint', 'imei', 'dead', 'glass', 'panel', 'bent'])]

s3_icons = [m for m in all_extracted_text if 's3' in m.lower() or 'cashify' in m.lower()]

result = {
    "extracted_phrases": list(set(question_phrases)),
    "extracted_icons": list(set(s3_icons))
}

with open('scratch/scraped_calculator_questions.json', 'w') as f:
    json.dump(result, f, indent=2)

print(f"Finished parsing JS chunks! Extracted {len(result['extracted_phrases'])} question phrases and {len(result['extracted_icons'])} icon URLs.")
