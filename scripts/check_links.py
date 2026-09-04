import urllib.request
import re

url = "https://www.cashify.in/sell-old-mobile-phone/sell-vivo"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
}

req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=15) as resp:
    html = resp.read().decode('utf-8')

# Find all links in the page
links = re.findall(r'href="([^"]+)"', html)
sell_links = [l for l in links if 'sell' in l]
print(f"Total links: {len(links)}, sell links: {len(sell_links)}")
for l in sell_links[:30]:
    print(" ", l)
