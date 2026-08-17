import json
import re

LAPTOP_MODELS = [
    # APPLE LAPTOPS
    {"id": "m-laptop-apple-macbook-air-m1", "brandId": "b-apple", "brandSlug": "apple", "name": "Apple MacBook Air M1 (2020)", "slug": "apple-macbook-air-m1-2020", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/c0b25e79-506a.jpg?w=800", "releaseYear": 2020, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-apple-macbook-air-m2", "brandId": "b-apple", "brandSlug": "apple", "name": "Apple MacBook Air M2 (2022)", "slug": "apple-macbook-air-m2-2022", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/a0e8d0aa-0e78.jpg?w=800", "releaseYear": 2022, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-apple-macbook-air-m3", "brandId": "b-apple", "brandSlug": "apple", "name": "Apple MacBook Air M3 (2024)", "slug": "apple-macbook-air-m3-2024", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/4117b4ab-a982.jpg?w=800", "releaseYear": 2024, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-apple-macbook-pro-m1-13", "brandId": "b-apple", "brandSlug": "apple", "name": "Apple MacBook Pro M1 13-inch (2020)", "slug": "apple-macbook-pro-m1-13-2020", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/2abdf9f1-0814.jpg?w=800", "releaseYear": 2020, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-apple-macbook-pro-m1-pro-14", "brandId": "b-apple", "brandSlug": "apple", "name": "Apple MacBook Pro M1 Pro 14-inch (2021)", "slug": "apple-macbook-pro-m1-pro-14-2021", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/7376ee21-12cd.jpg?w=800", "releaseYear": 2021, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-apple-macbook-pro-m2-pro-14", "brandId": "b-apple", "brandSlug": "apple", "name": "Apple MacBook Pro M2 Pro 14-inch (2023)", "slug": "apple-macbook-pro-m2-pro-14-2023", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/ef723d91-381c.jpg?w=800", "releaseYear": 2023, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-apple-macbook-pro-m3-pro-14", "brandId": "b-apple", "brandSlug": "apple", "name": "Apple MacBook Pro M3 Pro 14-inch (2023)", "slug": "apple-macbook-pro-m3-pro-14-2023", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/a8f15ee9-6e3e.jpg?w=800", "releaseYear": 2023, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-apple-macbook-air-intel", "brandId": "b-apple", "brandSlug": "apple", "name": "Apple MacBook Air Core i5 (2018-2020)", "slug": "apple-macbook-air-core-i5-2018-2020", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/81729c11-9a71.jpg?w=800", "releaseYear": 2019, "popular": False, "active": True, "contactForPrice": False, "category": "LAPTOP"},

    # DELL LAPTOPS
    {"id": "m-laptop-dell-xps-13", "brandId": "b-dell", "brandSlug": "dell", "name": "Dell XPS 13", "slug": "dell-xps-13", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/d3b4fdda-2d57.jpg?w=800", "releaseYear": 2023, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-dell-xps-15", "brandId": "b-dell", "brandSlug": "dell", "name": "Dell XPS 15", "slug": "dell-xps-15", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/d3b4fdda-2d57.jpg?w=800", "releaseYear": 2023, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-dell-inspiron-15", "brandId": "b-dell", "brandSlug": "dell", "name": "Dell Inspiron 15 3000", "slug": "dell-inspiron-15-3000", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/d3b4fdda-2d57.jpg?w=800", "releaseYear": 2022, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-dell-g15-gaming", "brandId": "b-dell", "brandSlug": "dell", "name": "Dell G15 Gaming", "slug": "dell-g15-gaming", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/d3b4fdda-2d57.jpg?w=800", "releaseYear": 2023, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-dell-latitude-3420", "brandId": "b-dell", "brandSlug": "dell", "name": "Dell Latitude 3420", "slug": "dell-latitude-3420", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/d3b4fdda-2d57.jpg?w=800", "releaseYear": 2022, "popular": False, "active": True, "contactForPrice": False, "category": "LAPTOP"},

    # HP LAPTOPS
    {"id": "m-laptop-hp-pavilion-15", "brandId": "b-hp", "brandSlug": "hp", "name": "HP Pavilion 15", "slug": "hp-pavilion-15", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/f78db5fb-857c.jpg?w=800", "releaseYear": 2023, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-hp-omen-16", "brandId": "b-hp", "brandSlug": "hp", "name": "HP Omen 16 Gaming", "slug": "hp-omen-16-gaming", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/f78db5fb-857c.jpg?w=800", "releaseYear": 2023, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-hp-spectre-x360", "brandId": "b-hp", "brandSlug": "hp", "name": "HP Spectre x360 14", "slug": "hp-spectre-x360-14", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/f78db5fb-857c.jpg?w=800", "releaseYear": 2023, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-hp-victus-15", "brandId": "b-hp", "brandSlug": "hp", "name": "HP Victus 15", "slug": "hp-victus-15", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/f78db5fb-857c.jpg?w=800", "releaseYear": 2022, "popular": False, "active": True, "contactForPrice": False, "category": "LAPTOP"},

    # LENOVO LAPTOPS
    {"id": "m-laptop-lenovo-thinkpad-e14", "brandId": "b-lenovo", "brandSlug": "lenovo", "name": "Lenovo ThinkPad E14", "slug": "lenovo-thinkpad-e14", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/4834825a-7f10.jpg?w=800", "releaseYear": 2023, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-lenovo-ideapad-slim-3", "brandId": "b-lenovo", "brandSlug": "lenovo", "name": "Lenovo IdeaPad Slim 3", "slug": "lenovo-ideapad-slim-3", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/4834825a-7f10.jpg?w=800", "releaseYear": 2022, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-lenovo-legion-5", "brandId": "b-lenovo", "brandSlug": "lenovo", "name": "Lenovo Legion 5 Gaming", "slug": "lenovo-legion-5-gaming", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/4834825a-7f10.jpg?w=800", "releaseYear": 2023, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-lenovo-yoga-slim-7", "brandId": "b-lenovo", "brandSlug": "lenovo", "name": "Lenovo Yoga Slim 7", "slug": "lenovo-yoga-slim-7", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/4834825a-7f10.jpg?w=800", "releaseYear": 2023, "popular": False, "active": True, "contactForPrice": False, "category": "LAPTOP"},

    # ASUS LAPTOPS
    {"id": "m-laptop-asus-tuf-f15", "brandId": "b-asus", "brandSlug": "asus", "name": "Asus TUF Gaming F15", "slug": "asus-tuf-gaming-f15", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/bf25222a-a2a7.jpg?w=800", "releaseYear": 2023, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-asus-rog-strix-g15", "brandId": "b-asus", "brandSlug": "asus", "name": "Asus ROG Strix G15", "slug": "asus-rog-strix-g15", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/bf25222a-a2a7.jpg?w=800", "releaseYear": 2023, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-asus-vivobook-15", "brandId": "b-asus", "brandSlug": "asus", "name": "Asus Vivobook 15", "slug": "asus-vivobook-15", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/bf25222a-a2a7.jpg?w=800", "releaseYear": 2022, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-asus-zenbook-14", "brandId": "b-asus", "brandSlug": "asus", "name": "Asus Zenbook 14 OLED", "slug": "asus-zenbook-14-oled", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/bf25222a-a2a7.jpg?w=800", "releaseYear": 2023, "popular": False, "active": True, "contactForPrice": False, "category": "LAPTOP"},

    # ACER LAPTOPS
    {"id": "m-laptop-acer-nitro-5", "brandId": "b-acer", "brandSlug": "acer", "name": "Acer Nitro 5 Gaming", "slug": "acer-nitro-5-gaming", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/2c350ab6-da4f.jpg?w=800", "releaseYear": 2023, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-acer-aspire-5", "brandId": "b-acer", "brandSlug": "acer", "name": "Acer Aspire 5", "slug": "acer-aspire-5", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/2c350ab6-da4f.jpg?w=800", "releaseYear": 2022, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-acer-predator-300", "brandId": "b-acer", "brandSlug": "acer", "name": "Acer Predator Helios 300", "slug": "acer-predator-helios-300", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/2c350ab6-da4f.jpg?w=800", "releaseYear": 2023, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},

    # SAMSUNG LAPTOPS
    {"id": "m-laptop-samsung-galaxy-book3", "brandId": "b-samsung", "brandSlug": "samsung", "name": "Samsung Galaxy Book3", "slug": "samsung-galaxy-book3", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/406a512d-e8dd.jpg?w=800", "releaseYear": 2023, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-samsung-galaxy-book4-pro", "brandId": "b-samsung", "brandSlug": "samsung", "name": "Samsung Galaxy Book4 Pro", "slug": "samsung-galaxy-book4-pro", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/406a512d-e8dd.jpg?w=800", "releaseYear": 2024, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},

    # MSI LAPTOPS
    {"id": "m-laptop-msi-gf63-thin", "brandId": "b-msi", "brandSlug": "msi", "name": "MSI GF63 Thin", "slug": "msi-gf63-thin", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/3e0e18bd-7fa2.jpg?w=800", "releaseYear": 2022, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"},
    {"id": "m-laptop-msi-katana-15", "brandId": "b-msi", "brandSlug": "msi", "name": "MSI Katana 15 Gaming", "slug": "msi-katana-15-gaming", "imageUrl": "https://s3ng.cashify.in/cashify/product/img/xhdpi/3e0e18bd-7fa2.jpg?w=800", "releaseYear": 2023, "popular": True, "active": True, "contactForPrice": False, "category": "LAPTOP"}
]

LAPTOP_VARIANTS = []
for m in LAPTOP_MODELS:
    base_price = 35000
    if "macbook-air-m1" in m["id"]: base_price = 38000
    elif "macbook-air-m2" in m["id"]: base_price = 54000
    elif "macbook-air-m3" in m["id"]: base_price = 72000
    elif "macbook-pro-m1-pro" in m["id"]: base_price = 74000
    elif "macbook-pro-m2-pro" in m["id"]: base_price = 92000
    elif "macbook-pro-m3-pro" in m["id"]: base_price = 115000
    elif "xps-15" in m["id"] or "omen-16" in m["id"] or "rog-strix" in m["id"]: base_price = 65000
    elif "gaming" in m["id"] or "nitro" in m["id"] or "tuf" in m["id"]: base_price = 42000

    LAPTOP_VARIANTS.append({
        "id": f"v-{m['id']}-8gb-256gb",
        "modelId": m["id"],
        "ram": "8 GB",
        "storage": "256 GB SSD",
        "basePrice": base_price,
        "active": True
    })
    LAPTOP_VARIANTS.append({
        "id": f"v-{m['id']}-16gb-512gb",
        "modelId": m["id"],
        "ram": "16 GB",
        "storage": "512 GB SSD",
        "basePrice": int(base_price * 1.25),
        "active": True
    })

print(f"Generated {len(LAPTOP_MODELS)} laptop models and {len(LAPTOP_VARIANTS)} laptop variants.")

STORE_TS = r'c:\Users\DELL\OneDrive\Desktop\CashALL\lib\store.ts'
with open(STORE_TS, 'r', encoding='utf-8') as f:
    code = f.read()

# Replace LAPTOP_MODELS array in store.ts
lm_str = "const LAPTOP_MODELS: DeviceModelData[] = " + json.dumps(LAPTOP_MODELS, indent=2) + ";\n\n"
lv_str = "const LAPTOP_VARIANTS: DeviceVariantData[] = " + json.dumps(LAPTOP_VARIANTS, indent=2) + ";\n\n"

# Replace const LAPTOP_MODELS: DeviceModelData[] = [...];
code = re.sub(r'const LAPTOP_MODELS: DeviceModelData\[\] = \[[\s\S]*?\];\n\n', lm_str, code)
code = re.sub(r'const LAPTOP_VARIANTS: DeviceVariantData\[\] = \[[\s\S]*?\];\n\n', lv_str, code)

with open(STORE_TS, 'w', encoding='utf-8') as f:
    f.write(code)

print("Injected LAPTOP_MODELS and LAPTOP_VARIANTS into store.ts successfully!")
