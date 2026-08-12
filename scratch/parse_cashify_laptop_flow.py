import urllib.request
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

url = "https://www.cashify.in/sell/calculator/page?pid=74782&plid=19&plnm=Laptop&pn=MacBook+Retina+Early+2015&bn=Apple&pin=https%3A%2F%2Fs3n.cashify.in%2Fcashify%2Fproduct%2Fimg%2Fxhdpi%2F9ebc8974-5cfa.jpg&pm=csh&bbmp=13810&pageId=0&tg=cshweb3"

req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8')

# Search for questions, step headings, option labels, and icons in html/scripts
matches = re.findall(r'"(Does[^"]+?)"|"(Are[^"]+?)"|"(Select[^"]+?)"|"(Do you[^"]+?)"|"(Original[^"]+?)"|"(Screen[^"]+?)"|"(Battery[^"]+?)"|"(Keyboard[^"]+?)"|"(Trackpad[^"]+?)"|"(Speaker[^"]+?)"|"(Wifi[^"]+?)"|"(Bluetooth[^"]+?)"|"(Ports[^"]+?)"', html, re.IGNORECASE)

all_matched_questions = set()
for tup in matches:
    for m in tup:
        if m and len(m) > 4:
            all_matched_questions.add(m)

print(f"Extracted {len(all_matched_questions)} matches:")
for q in list(all_matched_questions):
    print(" -", q)
