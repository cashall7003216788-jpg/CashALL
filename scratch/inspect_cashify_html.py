import urllib.request
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
}

url = "https://www.cashify.in/sell-old-mobile-phone/sell-samsung"
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8')

print("Page HTML sample (first 1000 chars):")
print(html[:1000])

links = re.findall(r'href="([^"]+)"', html)
samsung_links = [l for l in links if 'samsung' in l.lower()]
print(f"\nFound {len(samsung_links)} samsung links:")
for l in samsung_links[:20]:
    print(" -", l)
