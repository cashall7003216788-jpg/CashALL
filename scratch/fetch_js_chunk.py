import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'}

url = "https://www.cashify.in/_next/static/chunks/app/sell/calculator/%5Bslug%5D/page-dfefabc1bc3760bb.js"

req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    js_text = resp.read().decode('utf-8')

print("Downloaded JS chunk! Length:", len(js_text))

# Search for question titles, options, descriptions
questions = re.findall(r'"([^"]*(?:call|touch|screen|body|camera|scratch|flawless|box|charger|bill|warranty|battery|speaker|mic|fingerprint|imei)[^"]*)"', js_text, re.I)
print(f"Found {len(questions)} questionnaire strings in JS chunk!")

clean_questions = list(set([q for q in questions if len(q) > 8 and not q.startswith('http') and not q.endswith('.js')]))
for q in clean_questions[:30]:
    print(" *", q)

with open('scratch/js_chunk_questions.json', 'w') as f:
    json.dump(clean_questions, f, indent=2)
