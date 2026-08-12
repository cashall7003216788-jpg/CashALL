import re
import json

with open('lib/store.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Helper to rank model name recency and series
def get_model_sort_key(m):
    name = m.get('name', '')
    slug = m.get('slug', '')
    brand_slug = m.get('brandSlug', '')
    year = m.get('releaseYear', 2024)
    
    # Extract series and generation number if available
    # E.g. S24 Ultra -> Series S, Generation 24, Tier Ultra
    series_rank = 99
    gen_num = 0
    tier_rank = 0
    
    name_upper = name.upper()
    
    if brand_slug == 'samsung':
        if 'S24' in name_upper: gen_num = 24; series_rank = 1
        elif 'S23' in name_upper: gen_num = 23; series_rank = 1
        elif 'S22' in name_upper: gen_num = 22; series_rank = 1
        elif 'S21' in name_upper: gen_num = 21; series_rank = 1
        elif 'S20' in name_upper: gen_num = 20; series_rank = 1
        elif 'S10' in name_upper: gen_num = 10; series_rank = 1
        elif 'S9' in name_upper: gen_num = 9; series_rank = 1
        elif 'S8' in name_upper: gen_num = 8; series_rank = 1
        elif 'GALAXY S' in name_upper: series_rank = 1
        elif 'FOLD' in name_upper or 'FLIP' in name_upper or 'Z ' in name_upper: series_rank = 2
        elif 'NOTE' in name_upper: series_rank = 3
        elif 'A5' in name_upper or 'A3' in name_upper or 'A7' in name_upper or 'A1' in name_upper or 'A0' in name_upper or 'GALAXY A' in name_upper: series_rank = 4
        elif 'M5' in name_upper or 'M3' in name_upper or 'M1' in name_upper or 'M0' in name_upper or 'GALAXY M' in name_upper: series_rank = 5
        elif 'F5' in name_upper or 'F3' in name_upper or 'F1' in name_upper or 'GALAXY F' in name_upper: series_rank = 6
        
        # Tier within series
        if 'ULTRA' in name_upper: tier_rank = 10
        elif 'PLUS' in name_upper or '+' in name_upper: tier_rank = 8
        elif 'PRO' in name_upper: tier_rank = 7
        elif 'FE' in name_upper: tier_rank = 5
        
    elif brand_slug == 'apple':
        if '16' in name_upper: gen_num = 16
        elif '15' in name_upper: gen_num = 15
        elif '14' in name_upper: gen_num = 14
        elif '13' in name_upper: gen_num = 13
        elif '12' in name_upper: gen_num = 12
        elif '11' in name_upper: gen_num = 11
        elif 'XS' in name_upper: gen_num = 10.5
        elif 'XR' in name_upper: gen_num = 10.2
        elif 'X' in name_upper: gen_num = 10
        elif '8' in name_upper: gen_num = 8
        elif '7' in name_upper: gen_num = 7
        elif '6S' in name_upper: gen_num = 6.5
        elif '6' in name_upper: gen_num = 6
        elif 'SE' in name_upper: gen_num = 5
        
        if 'PRO MAX' in name_upper: tier_rank = 10
        elif 'PRO' in name_upper: tier_rank = 8
        elif 'PLUS' in name_upper: tier_rank = 6
        elif 'MINI' in name_upper: tier_rank = 4
        
    # Return composite sort key (lower value comes first)
    return (series_rank, -gen_num, -tier_rank, -year, name)

print("Sorting and ordering brand models in store.ts...")
