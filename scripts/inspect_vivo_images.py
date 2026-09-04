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

imgs = re.findall(r'https?://[^\s"\'<>]+\.(?:jpg|png|webp)(?:\?[^\s"\'<>]*)?', html)
cashify_imgs = [img for img in imgs if 'cashify' in img]
print(f"Total cashify imgs in page: {len(cashify_imgs)}")
for img in set(cashify_imgs):
    print(img)
