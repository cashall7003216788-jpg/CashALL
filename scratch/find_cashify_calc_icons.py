import json
import re

with open('scratch/scraped_calculator_questions.json', 'r') as f:
    data = json.load(f)

icons = data.get('extracted_icons', [])
calc_icons = [i for i in icons if any(term in i.lower() for term in ['calc', 'icon', 'ng', 's3', 'product', 'web', 'image', 'svg', 'png'])]

print("=== FOUND CASHIFY CALCULATOR ICON URLS ===")
for i in calc_icons[:30]:
    print(" -", i)

with open('scratch/cashify_icon_urls.json', 'w') as f:
    json.dump(calc_icons, f, indent=2)
