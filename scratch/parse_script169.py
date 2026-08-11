import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

base_url = "https://www.cashify.in/sell/calculator/page?pid=82444&plid=20&plnm=Mobile+Phone&pn=Samsung+Galaxy+S24+Ultra+5G+%2812+GB%2F256+GB%29&bn=Samsung&pin=https%3A%2F%2Fs3n.cashify.in%2Fcashify%2Fproduct%2Fimg%2Fxhdpi%2Ff7a9c306-84de.jpg&pm=csh&bbmp=63140&pageId={}&tg=cshweb3"

all_questions = {}

for page_id in range(5):
    url = base_url.format(page_id)
    print(f"Parsing pageId={page_id}...")
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
    
    scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
    page_q = []
    for s in scripts:
        if len(s) > 10000:
            # Look for JSON arrays or objects containing questions
            # Find patterns like "title", "label", "question", "options", "deduction"
            matches = re.findall(r'(\{"id"[^}]*"title"[^}]*\})', s)
            if matches:
                page_q.extend(matches)
            
            # Find image URLs inside script
            img_urls = re.findall(r'https://[^\s"\'<>]+(?:png|jpg|jpeg|svg|webp)', s)
            if img_urls:
                print(f"  Found {len(img_urls)} image URLs in pageId={page_id}")
    
    all_questions[f"page_{page_id}"] = {
        "raw_matches_count": len(page_q),
        "sample": page_q[:5]
    }

with open('scratch/questions_parsed.json', 'w') as f:
    json.dump(all_questions, f, indent=2)

print("Saved questions_parsed.json")
