import urllib.request
import re
import json
import time

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

base_url = "https://www.cashify.in/sell/calculator/page?pid=82444&plid=20&plnm=Mobile+Phone&pn=Samsung+Galaxy+S24+Ultra+5G+%2812+GB%2F256+GB%29&bn=Samsung&pin=https%3A%2F%2Fs3n.cashify.in%2Fcashify%2Fproduct%2Fimg%2Fxhdpi%2Ff7a9c306-84de.jpg&pm=csh&bbmp=63140&pageId={}&tg=cshweb3"

all_data = {}

for page_id in range(5):
    url = base_url.format(page_id)
    print(f"Fetching pageId={page_id}...")
    req = urllib.request.Request(url, headers=headers)
    success = False
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                html = resp.read().decode('utf-8')
                # Extract script tags containing state
                scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
                large_scripts = [s for s in scripts if len(s) > 5000]
                all_data[f"pageId_{page_id}"] = {
                    "url": url,
                    "html_len": len(html),
                    "large_scripts_count": len(large_scripts),
                    "scripts_sample": [s[:1000] for s in large_scripts[:3]]
                }
                print(f"  PageId={page_id} fetched successfully! ({len(html)} bytes)")
                success = True
                break
        except Exception as e:
            print(f"  Attempt {attempt+1} failed: {e}")
            time.sleep(2)
    time.sleep(1)

with open('scratch/calculator_pages_full.json', 'w') as f:
    json.dump(all_data, f, indent=2)

print("Finished fetching all 5 calculator pageIds!")
