import json
import re

with open('scratch/calculator_pages_full.json', 'r') as f:
    data = json.load(f)

scraped_summary = []

for page_key, page_val in data.items():
    page_id = page_key
    scripts = page_val.get('scripts_sample', [])
    
    # Extract titles, option labels, and icons
    full_text = " ".join(scripts)
    
    # Find question-like titles
    titles = re.findall(r'"(?:title|header|heading|question)"\s*:\s*"([^"]+)"', full_text, re.I)
    labels = re.findall(r'"(?:label|option|name)"\s*:\s*"([^"]+)"', full_text, re.I)
    icons = re.findall(r'https://s3ng\.cashify\.in/[^\s"\'<>]+\.(?:png|jpg|jpeg|svg|webp)', full_text)
    
    scraped_summary.append({
        "page": page_id,
        "url": page_val.get("url"),
        "unique_titles": list(set(titles)),
        "unique_labels": list(set(labels))[:20],
        "unique_icons": list(set(icons)),
    })

with open('scratch/questions_summary.json', 'w') as f:
    json.dump(scraped_summary, f, indent=2)

print("=== QUESTIONNAIRE SUMMARY ACROSS ALL 5 PAGES ===")
for p in scraped_summary:
    print(f"\n[{p['page']}] URL: {p['url']}")
    print("Titles:", p['unique_titles'][:5])
    print("Labels:", p['unique_labels'][:10])
    print("Icons:", p['unique_icons'][:5])
