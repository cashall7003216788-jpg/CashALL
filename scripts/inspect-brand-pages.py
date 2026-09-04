import urllib.request
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

def inspect_brand(brand_slug, url_slug):
    url = f"https://www.cashify.in/sell-old-laptop/{url_slug}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8')
            # Look for JSON in __NEXT_DATA__ or script tags
            next_match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html, re.DOTALL)
            if next_match:
                print(f"[{brand_slug}] Found __NEXT_DATA__ of length {len(next_match.group(1))}")
                data = json.loads(next_match.group(1))
                page_props = data.get('props', {}).get('pageProps', {})
                print(f"[{brand_slug}] pageProps keys:", list(page_props.keys()))
                # dump a sample
                with open(f"scratch/{brand_slug}_props.json", "w", encoding="utf-8") as f:
                    json.dump(page_props, f, indent=2)
            else:
                print(f"[{brand_slug}] No __NEXT_DATA__, searching for card blocks or self.__next_f")
                # Look for self.__next_f in modern Next.js app router
                f_matches = re.findall(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)', html)
                print(f"[{brand_slug}] Found {len(f_matches)} __next_f chunks")
                with open(f"scratch/{brand_slug}_page.html", "w", encoding="utf-8") as f:
                    f.write(html)
    except Exception as e:
        print(f"Error {brand_slug}: {e}")

inspect_brand('dell', 'sell-dell')
inspect_brand('hp', 'sell-hp-compaq')
inspect_brand('lenovo', 'sell-lenovo')
