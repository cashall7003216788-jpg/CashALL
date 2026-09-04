import urllib.request
import re

chunks = [
    "4bd1b696-de217d372379ee6e.js",
    "3671-863a3b55a6d51d06.js",
    "431-953132a731286b7f.js",
    "7385-5ff6b86733abb549.js",
    "5016-f5870c4e94e239c0.js",
    "5083-bd102e20e85e92fe.js",
    "7599-e7a15461bd91fa81.js",
    "1020-05b4916e1f4467bd.js",
    "3231-a4ff7f7d8ca042a8.js",
    "7962-de77481f82d437b8.js",
    "6900-29db624116e18bd7.js",
    "2694-34b52d74d1c2e641.js",
    "8048-c9456e5c1318fe40.js",
    "9023-e54e2fbacff3b429.js"
]

headers = {'User-Agent': 'Mozilla/5.0'}

for chunk in chunks:
    url = f"https://www.cashify.in/sell_/_next/static/chunks/{chunk}"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            text = resp.read().decode('utf-8')
            for kw in ['512 MB', '60 GB HDD', '60 GB', 'Intel Core i3', 'Processor', 'Hard Disk']:
                if kw in text:
                    print(f"[{chunk}] Contains keyword: '{kw}'!")
                    idx = text.find(kw)
                    print("  Snippet:", text[max(0, idx - 100):min(len(text), idx + 200)])
    except Exception as e:
        print(f"Error {chunk}: {e}")
