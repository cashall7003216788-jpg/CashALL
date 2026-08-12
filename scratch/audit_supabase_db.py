import os
import urllib.request
import json

# Check Supabase REST API connection
supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://jqysknhobtpcbyyltnfc.supabase.co")
anon_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

print(f"Testing Supabase REST API endpoint at: {supabase_url}")

headers = {
    "apikey": anon_key,
    "Authorization": f"Bearer {anon_key}",
    "Content-Type": "application/json"
}

# Test querying public tables
tables_to_test = ["brands", "models", "variants", "orders", "users", "profiles"]

for t in tables_to_test:
    req = urllib.request.Request(f"{supabase_url}/rest/v1/{t}?select=count", headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = resp.read().decode('utf-8')
            print(f"Table '{t}': HTTP 200 OK | Response: {data}")
    except urllib.error.HTTPError as e:
        print(f"Table '{t}': HTTP {e.code} ({e.reason})")
    except Exception as e:
        print(f"Table '{t}': Error ({e})")
