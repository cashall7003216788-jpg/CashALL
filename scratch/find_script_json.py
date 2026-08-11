import re
import json

with open('scratch/raw_page0.html', 'r', encoding='utf-8') as f:
    html = f.read()

scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
for i, script in enumerate(scripts):
    if '{' in script and ('question' in script.lower() or 'screen' in script.lower() or 'brand' in script.lower() or 'option' in script.lower()):
        print(f"Script {i} contains key terms! Length: {len(script)}")
        # Check if there is json object
        json_matches = re.findall(r'({[^{}]*"title"[^{}]*})', script)
        if json_matches:
            print(f"  Found {len(json_matches)} title JSON objects")
            for m in json_matches[:3]:
                print("   ", m[:100])
