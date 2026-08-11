import re

with open('scratch/raw_page0.html', 'r', encoding='utf-8') as f:
    html = f.read()

srcs = re.findall(r'src="([^"]+\.js[^"]*)"', html)
print(f"Found {len(srcs)} JS scripts in HTML")
for s in srcs:
    print(" -", s)
