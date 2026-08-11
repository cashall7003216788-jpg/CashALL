import json

with open('scratch/scraped_calculator_questions.json', 'r') as f:
    data = json.load(f)

print("=== SAMPLE EXTRACTED QUESTION PHRASES ===")
for p in sorted(data['extracted_phrases'])[:50]:
    print(" -", p)

print("\n=== SAMPLE EXTRACTED ICON URLS ===")
for icon in sorted(data['extracted_icons'])[:20]:
    print(" -", icon)
