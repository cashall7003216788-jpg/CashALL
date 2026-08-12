import re

with open('scratch/laptop_calculator_page.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Search for API URLs or endpoints in HTML
api_urls = re.findall(r'https?://[^\s"\'<>]+(?:api|calculator|question|evaluate)[^\s"\'<>]*', html, re.IGNORECASE)
print(f"Found {len(set(api_urls))} API URLs:")
for url in list(set(api_urls)):
    print(" -", url)

# Search for JSON blocks with questions, device condition, etc.
raw_json_matches = re.findall(r'(\{"id":.*?\})', html)
print(f"\nFound {len(raw_json_matches)} raw JSON object snippets.")
for m in raw_json_matches[:10]:
    print("Snippet:", m[:150])
