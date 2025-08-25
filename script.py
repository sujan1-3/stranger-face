# Create the complete project file structure and contents
import os
import json
import base64
import zipfile
from io import BytesIO

# Complete project structure
project_structure = """
stranger-face/
├── backend/
│   ├── server.js
│   ├── package.json  
│   ├── .env.example
│   ├── routes/
│   │   ├── auth.js
│   │   ├── chat.js
│   │   └── report.js
│   ├── utils/
│   │   ├── geolocation.js
│   │   └── socketManager.js
│   ├── middleware/
│   │   └── rateLimiter.js
│   └── config/
│       └── environment.js
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── .env.local.example
├── deployment/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── docs/
│   ├── README.md
│   ├── API.md
│   └── DEPLOYMENT.md
└── run-instructions.md
"""

print("Complete Stranger Face Project Structure:")
print(project_structure)

# I'll create all the files with their exact content from the previous generation
files_created = []

# Create a function to save files
def save_file(filename, content):
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    files_created.append(filename)
    print(f"✓ Created: {filename}")

print("\nCreating all project files...")