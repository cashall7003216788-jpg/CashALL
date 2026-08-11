import json

CASHIFY_QUESTION_ICONS = {
    # Core questions & defects
    "screen_broken": "https://s3n.cashify.in/estore/84e2c1deede043cca4ca490cf7b6379c.svg",
    "screen_lines": "https://s3n.cashify.in/estore/ae589baaf5924452abd846a33feacece.svg",
    "body_defects": "https://s3n.cashify.in/estore/81f658c1cbf640df8ea8a02d53d96647.svg",
    "panel_missing": "https://s3n.cashify.in/estore/d0675cefdd86438581e32f095884d179.svg",
    
    # Functional issues
    "wifi": "https://s3n.cashify.in/estore/eff3602d60c34aaabef1b5853fdff327.svg",
    "speaker": "https://s3n.cashify.in/cashify/web/images/post/svgs/specs/front-camera.svg",
    "charging_port": "https://s3n.cashify.in/estore/e50489f21e8c43f4be9bb02d59658663.svg",
    "battery_health": "https://s3n.cashify.in/cashify/web/images/post/svgs/specs/processor.svg",
    "front_camera": "https://s3n.cashify.in/cashify/web/images/post/svgs/specs/front-camera.svg",
    "back_camera": "https://s3n.cashify.in/cashify/web/images/post/svgs/specs/front-camera.svg",
    "box": "https://s3n.cashify.in/cashify/web/images/post/svgs/specs/storage.svg",
    "charger": "https://s3n.cashify.in/estore/e50489f21e8c43f4be9bb02d59658663.svg"
}

with open('lib/cashify_icons.json', 'w') as f:
    json.dump(CASHIFY_QUESTION_ICONS, f, indent=2)

print("Saved lib/cashify_icons.json!")
