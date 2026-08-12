import json
import re

with open('scratch/script_188.json', 'r', encoding='utf-8') as f:
    text = f.read()

# Look for question titles, options, icon URLs, and step names
print("Searching for laptop questions and options in script_188.json...")

# Common regex patterns in Cashify calculator payload
questions = re.findall(r'"title":\s*"([^"]+)"', text)
print(f"Found {len(questions)} title matches:")
for idx, q in enumerate(questions[:30]):
    print(f" - {idx+1}. {q}")

# Look for image/icon URLs
img_urls = re.findall(r'https?://[^\s"]+?(?:png|jpg|jpeg|svg|webp)', text)
print(f"\nFound {len(set(img_urls))} image/icon URLs:")
for url in list(set(img_urls))[:20]:
    print(" -", url)
