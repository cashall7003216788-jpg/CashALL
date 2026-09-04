import re
import json

for brand in ['dell', 'hp', 'lenovo']:
    with open(f"scratch/{brand}_page.html", "r", encoding="utf-8") as f:
        html = f.read()

    images = list(set(re.findall(r'https://s3n[g]?\.cashify\.in/cashify/product/img/xhdpi/[^\"\'\\&]+', html)))
    print(f"\n=== Brand {brand} ===")
    print(f"Product Images found ({len(images)}):")
    for img in images[:5]:
        print("  IMG:", img)
    
    # Check what series or models are present
    # Looking for title or name attributes or patterns like "Inspiron", "XPS", "Latitude", "Yoga", "ThinkPad"
    # Find text between tags or JSON properties
    titles = re.findall(r'\"title\":\"([^\"]+)\"', html)
    print(f"Titles found ({len(titles)}):", titles[:10])
    
    names = re.findall(r'\"name\":\"([^\"]+)\"', html)
    print(f"Names found ({len(names)}):", names[:10])

    model_links = list(set(re.findall(r'/sell-old-laptop/used-([^\"\'\\]+)', html)))
    print(f"Model Links found ({len(model_links)}):")
    for ml in model_links[:10]:
        print("  LINK:", ml)
