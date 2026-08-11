import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

url = "https://www.cashify.in/sell/calculator/page?pid=82444&plid=20&plnm=Mobile+Phone&pn=Samsung+Galaxy+S24+Ultra+5G+%2812+GB%2F256+GB%29&bn=Samsung&pin=https%3A%2F%2Fs3n.cashify.in%2Fcashify%2Fproduct%2Fimg%2Fxhdpi%2Ff7a9c306-84de.jpg&pm=csh&bbmp=63140&pageId=0&tg=cshweb3"

req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8')

# Find all script contents or JSON objects
scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
print(f"Found {len(scripts)} scripts in HTML")

# Search for question text, options, or s3 URLs in HTML
questions = re.findall(r'Do[es]* your phone|Select|Are there|Functional|Physical|Screen', html, re.IGNORECASE)
print("Question matches:", set(questions))

images = re.findall(r'https://s3ng\.cashify\.in/[^\s"\'<>]+', html)
print("S3 Image matches:", len(set(images)))
for img in list(set(images))[:10]:
    print("  ", img)

with open('scratch/raw_page0.html', 'w', encoding='utf-8') as f:
    f.write(html)
