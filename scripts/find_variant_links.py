import urllib.request
import re

url = "https://www.cashify.in/sell-old-mobile-phone/used-vivo-v50"
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'}

req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=12) as r:
    html = r.read().decode('utf-8')

links = re.findall(r'href="([^"]*vivo-v50[^"]*)"', html, re.IGNORECASE)
print(f"Links with vivo-v50: {len(links)}")
for l in set(links):
    print(" ", l)

# Also find where "8 GB / 128 GB" appears
idx = html.find("128 GB")
if idx != -1:
    print("Context around '128 GB':")
    print(html[max(0, idx-300):min(len(html), idx+500)])
else:
    print("'128 GB' not found")
