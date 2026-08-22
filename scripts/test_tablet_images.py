import urllib.request
import re

url = 'https://www.cashify.in/sell-old-tablet/used-ipad-air-wi-fi-only'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})
try:
    with urllib.request.urlopen(req, timeout=10) as response:
        html = response.read().decode('utf-8')
        og_image = re.findall(r'<meta property="og:image" content="([^"]+)"', html)
        print("og:image:", og_image)
        img_tags = re.findall(r'<img[^>]+src="([^">]+)"', html)
        print("img tags:", img_tags[:10])
except Exception as e:
    print('Error:', e)
