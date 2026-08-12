with open('lib/store.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# In TypeScript: popular: true, active: true, contactForPrice: false
new_content = content.replace('"popular": True', '"popular": true')
new_content = new_content.replace('"popular": False', '"popular": false')
new_content = new_content.replace('"active": True', '"active": true')
new_content = new_content.replace('"active": False', '"active": false')
new_content = new_content.replace('"contactForPrice": True', '"contactForPrice": true')
new_content = new_content.replace('"contactForPrice": False', '"contactForPrice": false')

with open('lib/store.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Fixed TypeScript booleans in store.ts!")
