import re

with open('scratch/samsung_raw.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Match all <a> tags with href="/sell-old-mobile-phone/used-..."
pattern = re.compile(r'<a[^>]+href="([^"]*sell-old-mobile-phone[^"]*)"[^>]*>(.*?)</a>', re.DOTALL)

matches = pattern.findall(html)

print(f"Found {len(matches)} matches in raw HTML:")
seen = []
for href, inner in matches:
    # Clean inner HTML tags
    clean_text = re.sub(r'<[^>]+>', ' ', inner).strip()
    clean_text = re.sub(r'\s+', ' ', clean_text)
    if 'Sell' in clean_text or 'used-' in href:
        if href not in seen:
            seen.append((href, clean_text))

for idx, (href, text) in enumerate(seen[:50]):
    print(f"{idx+1}. Text: '{text}' | Href: '{href}'")
