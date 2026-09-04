import urllib.request

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
candidates = [
    'used-vivo-v70-elite',
    'used-vivo-v70-elite-5g',
    'used-vivo-v70e',
    'used-vivo-v70e-5g',
    'used-vivo-v70-pro',
    'used-vivo-v70-pro-5g',
    'used-vivo-v70-pro-plus',
    'used-vivo-v70-5g',
    'used-vivo-v50-5g',
    'used-vivo-v50-pro',
    'used-vivo-v60-5g',
    'used-vivo-v60-pro',
    'used-vivo-v70-fe-5g',
]

for slug in candidates:
    url = f'https://www.cashify.in/sell-old-mobile-phone/{slug}'
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as r:
            print(f"FOUND: {slug} -> {r.status}")
    except Exception as e:
        pass
