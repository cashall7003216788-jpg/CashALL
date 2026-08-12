import urllib.request
import json
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

url = "https://www.cashify.in/sell/calculator/page?pid=74782&plid=19&plnm=Laptop&pn=MacBook+Retina+Early+2015&bn=Apple&pin=https%3A%2F%2Fs3n.cashify.in%2Fcashify%2Fproduct%2Fimg%2Fxhdpi%2F9ebc8974-5cfa.jpg&pm=csh&bbmp=13810&pageId=0&tg=cshweb3"

print(f"Fetching Cashify Laptop Calculator page from: {url}")
req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode('utf-8')
        
        # Save HTML to scratch file
        with open('scratch/laptop_calculator_page.html', 'w', encoding='utf-8') as f:
            f.write(html)
            
        print("Successfully fetched and saved HTML to scratch/laptop_calculator_page.html")
        
        # Search for Next.js data or JSON script tags
        next_data = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html, re.DOTALL)
        if next_data:
            json_str = next_data.group(1)
            data = json.loads(json_str)
            with open('scratch/laptop_next_data.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            print("Extracted __NEXT_DATA__ JSON to scratch/laptop_next_data.json!")
        else:
            print("No __NEXT_DATA__ found, inspecting HTML script tags...")
            
            # Find any JSON objects in script tags
            scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
            print(f"Found {len(scripts)} script tags.")
            for idx, s in enumerate(scripts):
                if 'question' in s.lower() or 'option' in s.lower() or 'calculator' in s.lower() or 'pageId' in s:
                    print(f"Script #{idx} contains potential data (len: {len(s)})")
                    with open(f'scratch/script_{idx}.json', 'w', encoding='utf-8') as f:
                        f.write(s)
except Exception as e:
    print(f"Error fetching laptop calculator: {e}")
