import re

# Model release year map for Apple iPhones
IPHONE_YEARS = {
    "iphone-16-pro-max": 2024,
    "iphone-16-pro": 2024,
    "iphone-16-plus": 2024,
    "iphone-16": 2024,
    "iphone-15-pro-max": 2023,
    "iphone-15-pro": 2023,
    "iphone-15-plus": 2023,
    "iphone-15": 2023,
    "iphone-14-pro-max": 2022,
    "iphone-14-pro": 2022,
    "iphone-14-plus": 2022,
    "iphone-14": 2022,
    "iphone-13-pro-max": 2021,
    "iphone-13-pro": 2021,
    "iphone-13-mini": 2021,
    "iphone-13": 2021,
    "iphone-12-pro-max": 2020,
    "iphone-12-pro": 2020,
    "iphone-12-mini": 2020,
    "iphone-12": 2020,
    "iphone-se-2020": 2020,
    "iphone-11-pro-max": 2019,
    "iphone-11-pro": 2019,
    "iphone-11": 2019,
    "iphone-xs-max": 2018,
    "iphone-xs": 2018,
    "iphone-xr": 2018,
    "iphone-x": 2017,
    "iphone-8-plus": 2017,
    "iphone-8": 2017,
    "iphone-7-plus": 2016,
    "iphone-7": 2016,
    "iphone-6s-plus": 2015,
    "iphone-6s": 2015,
    "iphone-6-plus": 2014,
    "iphone-6": 2014,
}

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Update releaseYear for matching slugs
def replace_release_year(match):
    full_str = match.group(0)
    slug_match = re.search(r'"slug":\s*"([^"]+)"', full_str)
    if slug_match:
        slug = slug_match.group(1).replace("apple-", "")
        if slug in IPHONE_YEARS:
            year = IPHONE_YEARS[slug]
            full_str = re.sub(r'"releaseYear":\s*\d+', f'"releaseYear": {year}', full_str)
    return full_str

new_content = re.sub(r'\{[^{}]*"brandSlug":\s*"apple"[^{}]*\}', replace_release_year, content)

with open('lib/store.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated release years for Apple iPhones in store.ts!")
