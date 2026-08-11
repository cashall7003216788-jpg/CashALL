import re

with open('scratch/raw_page0.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Search for any text containing questions or option choices
# Cashify calculator questions structure:
# Page 0: Device Core Status (Can call/receive calls? Touch screen working?)
# Page 1: Physical Body Condition (Flawless, Good, Average, Below Average)
# Page 2: Functional Assessment (Front/Back Camera, Battery, Charging Port, Speaker, Mic, Wifi, Bluetooth, Face ID/Fingerprint)
# Page 3: Accessories Available (Original Charger, Original Box, Valid Bill, Same IMEI)
# Page 4: Device Age / Warranty (Under 3 months, 3-6 months, 6-11 months, Above 11 months)

words = re.findall(r'"([^"]{4,80})"', html)
filtered = [w for w in words if any(term in w.lower() for term in ['call', 'touch', 'screen', 'camera', 'body', 'scratch', 'box', 'charger', 'bill', 'warranty', 'flawless', 'battery', 'speaker', 'mic', 'fingerprint', 'imei', 'age'])]

print("Found relevant phrases:", len(filtered))
for phrase in filtered[:30]:
    print(" -", phrase)
