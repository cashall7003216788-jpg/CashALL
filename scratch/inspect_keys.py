import json

with open('scratch/mobile_next_data.json', 'r') as f:
    data = json.load(f)

def print_keys(obj, path=""):
    if isinstance(obj, dict):
        for k, v in obj.items():
            new_path = f"{path}.{k}" if path else k
            if 'brand' in k.lower() or 'logo' in k.lower():
                print(new_path, type(v))
            print_keys(v, new_path)
    elif isinstance(obj, list) and len(obj) > 0:
        print_keys(obj[0], f"{path}[0]")

print_keys(data)
