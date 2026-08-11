import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

base_url = "https://www.cashify.in/sell/calculator/page?pid=82444&plid=20&plnm=Mobile+Phone&pn=Samsung+Galaxy+S24+Ultra+5G+%2812+GB%2F256+GB%29&bn=Samsung&pin=https%3A%2F%2Fs3n.cashify.in%2Fcashify%2Fproduct%2Fimg%2Fxhdpi%2Ff7a9c306-84de.jpg&pm=csh&bbmp=63140&pageId={}&tg=cshweb3"

all_steps = []

for page_id in range(5):
    url = base_url.format(page_id)
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
    
    # Extract readable text, headers, and option blocks
    # Look for question titles inside HTML or JS bundles
    titles = re.findall(r'"title"\s*:\s*"([^"]+)"', html)
    subtitles = re.findall(r'"subtitle"\s*:\s*"([^"]+)"', html)
    labels = re.findall(r'"label"\s*:\s*"([^"]+)"', html)
    icons = re.findall(r'https://s3ng\.cashify\.in/[^\s"\'<>]+', html)

    all_steps.append({
        "pageId": page_id,
        "titles": list(set(titles)),
        "subtitles": list(set(subtitles)),
        "labels": list(set(labels)),
        "icons": list(set(icons)),
    })

with open('scratch/detailed_questions_summary.json', 'w') as f:
    json.dump(all_steps, f, indent=2)

print("=== SCRAPED CALCULATOR QUESTION STEPS ===")
for step in all_steps:
    print(f"\n--- Page ID {step['pageId']} ---")
    print("Titles:", step['titles'][:5])
    print("Labels:", step['labels'][:10])
    print("Icons:", step['icons'][:5])
