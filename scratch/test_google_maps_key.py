import urllib.request
import json
import os

key = os.environ.get("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", "AIzaSyDFroh3-xgDMytbAQXkA31NVNVs9L5mzDk")
url = f"https://maps.googleapis.com/maps/api/geocode/json?address=Kolkata&key={key}"

print(f"Testing Google Maps Geocoding API with key...")
req = urllib.request.Request(url)
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print(f"Google Maps API Response Status: {data.get('status')}")
        if data.get("error_message"):
            print("Error message:", data.get("error_message"))
except Exception as e:
    print("Google Maps API Error:", e)
