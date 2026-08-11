import json

def get_brand_map(filename):
    with open(filename, 'r') as f:
        data = json.load(f)
    
    brand_map = {}
    
    def search(obj):
        if isinstance(obj, dict):
            # Check for brand pattern in cashify JSON
            if ('name' in obj or 'brand_name' in obj) and ('img' in obj or 'logo' in obj or 'image' in obj or 'icon' in obj):
                name = obj.get('name') or obj.get('brand_name')
                logo = obj.get('img') or obj.get('logo') or obj.get('image') or obj.get('icon')
                if isinstance(logo, dict):
                    logo = logo.get('url') or logo.get('src')
                if name and logo and isinstance(logo, str):
                    brand_map[name.strip().lower()] = logo
            for v in obj.values():
                search(v)
        elif isinstance(obj, list):
            for item in obj:
                search(item)

    search(data)
    return brand_map

m_map = get_brand_map('scratch/mobile_next_data.json')
l_map = get_brand_map('scratch/laptop_next_data.json')

print("=== MOBILE BRAND LOGOS FROM CASHIFY ===")
for k, v in sorted(m_map.items()):
    print(f"'{k}': '{v}',")

print("\n=== LAPTOP BRAND LOGOS FROM CASHIFY ===")
for k, v in sorted(l_map.items()):
    print(f"'{k}': '{v}',")
