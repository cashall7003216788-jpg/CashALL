import json

with open('dataset used/dataset.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for b in ['Apple', 'Motorola', 'OnePlus', 'Huawei', 'Samsung', 'Lenovo', 'Xiaomi']:
    samples = [d for d in data if d['category'] == 'TABLET' and d['brand'] == b][:4]
    print(f"\n=== {b} TABLETS ===")
    for s in samples:
        print(f"  {s['model_name']} -> {s['image_url']}")
