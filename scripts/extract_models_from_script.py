import urllib.request
import re
import json

url = "https://www.cashify.in/sell-old-mobile-phone/sell-vivo"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
}

req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=15) as resp:
    html = resp.read().decode('utf-8')

scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
for i, s in enumerate(scripts):
    if len(s) > 10000 and ('model' in s.lower() or 'product' in s.lower()):
        print(f"Script {i} len {len(s)}")
        # Check if json
        try:
            # find first { or [
            start = s.find('{')
            if start != -1:
                # find balanced or just search for models
                models = re.findall(r'"name":"([^"]+)"[^{}]*?"imageUrl":"([^"]+)"', s)
                print(f"Models with imageUrl in script {i}: {len(models)}")
                for name, img in models[:10]:
                    print(f"  {name} -> {img}")
                models2 = re.findall(r'"name":"([^"]+)"[^{}]*?"maxPrice":([0-9]+)', s)
                print(f"Models with maxPrice in script {i}: {len(models2)}")
                for name, pr in models2[:10]:
                    print(f"  {name} -> {pr}")
        except Exception as e:
            print("Err:", e)
