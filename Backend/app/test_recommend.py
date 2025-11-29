import requests
print("Starting test_recommend.py")
url = "http://127.0.0.1:9000/recommend"
payload = {
    "user_id": 1,
    "pantry_items": ["chicken", "rice"],
    "top_n": 5,
    "mode": "content"
}

response = requests.post(url, json=payload)
print("Status code:", response.status_code)
print("Response JSON:", response.json())