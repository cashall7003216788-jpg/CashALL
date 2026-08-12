import json

with open('scratch/cashify_exact_sequences.json', 'r', encoding='utf-8') as f:
    seqs = json.load(f)

print("Cashify scraped Samsung sequence (first 30):")
for idx, item in enumerate(seqs.get('samsung', [])[:30]):
    print(f"{idx+1}. {item}")
