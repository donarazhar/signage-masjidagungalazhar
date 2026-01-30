import requests
import json
import os

BASE_URL = "http://127.0.0.1:8000/api"
LOGIN_URL = f"{BASE_URL}/login"
UPLOAD_URL = f"{BASE_URL}/contents"

EMAIL = "masjid_1@demo.com"
PASSWORD = "password"

# 1. Login
try:
    login_resp = requests.post(LOGIN_URL, json={"email": EMAIL, "password": PASSWORD})
    print(f"Login Status: {login_resp.status_code}")
    if login_resp.status_code != 200:
        print(login_resp.text)
        exit(1)
    
    token = login_resp.json()['token']
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful, token obtained.")

    # 2. Upload
    file_path = r"d:\9. 0 to ~ ITTD\2. All Source Code\signage-display\frontend\public\logo-alazhar.png"
    
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        # Create a dummy file
        file_path = "test.txt"
        with open(file_path, "w") as f:
            f.write("dummy content")

    files = {
        'file': open(file_path, 'rb')
    }
    data = {
        'title': 'Test Upload',
        'content_type': 'image',
        'duration': 10,
        'priority': 0,
        'is_enabled': 1
    }

    print(f"Uploading file from {file_path}...")
    upload_resp = requests.post(UPLOAD_URL, headers=headers, files=files, data=data)
    
    print(f"Upload Status: {upload_resp.status_code}")
    print("Response Body:")
    print(upload_resp.text)

except Exception as e:
    print(f"An error occurred: {e}")
