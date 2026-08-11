import json

with open('scratch/mobile_next_data.json', 'r') as f:
    data = json.load(f)

props = data.get('props', {}).get('pageProps', {})
print("PageProps keys:", list(props.keys()))

# Dump a sample of pageProps to file
with open('scratch/props_sample.json', 'w') as f:
    json.dump(props, f, indent=2)
