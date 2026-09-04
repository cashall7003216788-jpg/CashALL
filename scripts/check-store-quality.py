import re

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    text = f.read()

sell_nows = re.findall(r'"name":\s*"Sell Now"', text)
print('Sell Now count:', len(sell_nows))
bad_slugs = re.findall(r'"slug":\s*"sell-now[^"]*"', text)
print('sell-now slugs:', len(bad_slugs))
null_imgs = len(re.findall(r'"imageUrl":\s*null', text))
print('null imageUrls:', null_imgs)
empty_imgs = len(re.findall(r'"imageUrl":\s*""', text))
print('empty imageUrls:', empty_imgs)

# Check Dell, HP, Lenovo models with generic/null images
for b in ['dell', 'hp', 'lenovo']:
    models = re.findall(r'\{\s*"id":\s*"(m-laptop-' + b + r'-[^"]+)"[\s\S]*?"name":\s*"([^"]+)"[\s\S]*?"imageUrl":\s*([^\n,]+)', text)
    bad = [m for m in models if 'null' in m[2] or '""' in m[2] or 'Sell Now' in m[1]]
    print(f"[{b}] total: {len(models)}, bad: {len(bad)}")
