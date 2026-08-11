import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

base_url = "https://www.cashify.in/sell/calculator/page?pid=82444&plid=20&plnm=Mobile+Phone&pn=Samsung+Galaxy+S24+Ultra+5G+%2812+GB%2F256+GB%29&bn=Samsung&pin=https%3A%2F%2Fs3n.cashify.in%2Fcashify%2Fproduct%2Fimg%2Fxhdpi%2Ff7a9c306-84de.jpg&pm=csh&bbmp=63140&pageId={}&tg=cshweb3"

all_page_data = {}

for page_id in range(5):
    url = base_url.format(page_id)
    print(f"Fetching pageId={page_id}...")
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8')
            
            # Match __NEXT_DATA__
            match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html, re.DOTALL)
            if match:
                data = json.loads(match.group(1))
                all_page_data[f"pageId_{page_id}"] = data
                print(f"  Successfully extracted NEXT_DATA for pageId={page_id}")
            else:
                all_page_data[f"pageId_{page_id}"] = {"raw_html_len": len(html)}
                print(f"  No NEXT_DATA script found for pageId={page_id}")
    except Exception as e:
        print(f"  Error fetching pageId={page_id}: {e}")

with open('scratch/calculator_scraped.json', 'w') as f:
    json.dump(all_page_data, f, indent=2)

print("Scraping completed. Saved to scratch/calculator_scraped.json")
