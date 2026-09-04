import urllib.request
import json
import re

url = "https://www.cashify.in/sell-old-mobile-phone/sell-vivo"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode('utf-8')
        print(f"Loaded HTML len: {len(html)}")
        m = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html)
        if m:
            data = json.loads(m.group(1))
            props = data.get('props', {}).get('pageProps', {})
            with open('cashify_vivo_props.json', 'w', encoding='utf-8') as out:
                json.dump(props, out, indent=2)
            print("Successfully dumped props keys:", list(props.keys()))
        else:
            print("No NEXT_DATA. Searching for V50, V60, V70...")
            found = re.findall(r'V(?:50|60|70)[a-zA-Z0-9\s-]*', html, re.IGNORECASE)
            print("Found in raw HTML:", set(found))
except Exception as ex:
    print("Fetch error:", ex)
