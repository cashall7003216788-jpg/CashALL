import re
import json

def extract_cards(brand):
    with open(f"scratch/{brand}_page.html", "r", encoding="utf-8") as f:
        html = f.read()

    # Cards usually have an <a> tag linking to /sell-old-laptop/used-...
    # containing an <img> with src and some title/name text
    cards = []
    # Match pattern around /sell-old-laptop/used-[^"]+
    pattern = re.compile(r'<a[^>]+href="(/sell-old-laptop/used-[^"]+)"[^>]*>([\s\S]*?)</a>')
    matches = pattern.findall(html)
    print(f"[{brand}] <a> matches found: {len(matches)}")
    
    for href, inner in matches:
        slug = href.split('/')[-1].replace('used-', '')
        # extract image src
        img_m = re.search(r'src="(https://s3n[g]?\.cashify\.in/cashify/product/img/xhdpi/[^"]+)"', inner)
        img = img_m.group(1) if img_m else ""
        # extract name / text
        # remove tags
        text = re.sub(r'<[^>]+>', ' ', inner).strip()
        text = re.sub(r'\s+', ' ', text)
        if slug and img:
            cards.append({
                "brand": brand,
                "slug": slug,
                "name": text or slug.replace('-', ' ').title(),
                "image": img.replace('s3ng.cashify.in', 's3n.cashify.in').replace('w=200', 'w=800')
            })
            
    print(f"[{brand}] Valid cards with image: {len(cards)}")
    if cards:
        print(f"[{brand}] Sample card:", cards[0])
    return cards

dell_cards = extract_cards('dell')
hp_cards = extract_cards('hp')
lenovo_cards = extract_cards('lenovo')

all_cards = dell_cards + hp_cards + lenovo_cards
with open('scratch/dell_hp_lenovo_scraped.json', 'w', encoding='utf-8') as f:
    json.dump(all_cards, f, indent=2)
print(f"Saved {len(all_cards)} cards to scratch/dell_hp_lenovo_scraped.json")
