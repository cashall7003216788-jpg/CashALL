import urllib.request
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*'
}

# Try Cashify's known calculator API endpoints for laptop (pid=74782)
test_urls = [
    "https://www.cashify.in/api/v3/sell/calculator/questions?pid=74782",
    "https://www.cashify.in/api/v3/sell/questions?pid=74782",
    "https://www.cashify.in/api/v1/product/74782/questions",
    "https://www.cashify.in/api/v2/sell/calculator/questions?productId=74782",
    "https://www.cashify.in/sell/calculator/api/getQuestions?pid=74782",
    "https://s3n.cashify.in/cashify/calculator/questions/74782.json",
]

for url in test_urls:
    print(f"Testing API endpoint: {url}")
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = resp.read().decode('utf-8')
            print(f" -> SUCCESS! Received {len(data)} bytes")
            with open('scratch/laptop_api_response.json', 'w', encoding='utf-8') as f:
                f.write(data)
            break
    except Exception as e:
        print(f" -> Failed: {e}")
