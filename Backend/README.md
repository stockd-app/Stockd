## 🚀 Stockd: Backend Repo

### 1️⃣ Clone the repository
```bash
git clone https://github.com/stockd-app/Stockd.git
cd Backend
```

### 2️⃣ Install dependencies
```bash
pip install -r requirements.txt
```

### 3️⃣ Run main.py
```bash
uvicorn app.main:app --reload
```
- The server will run at: http://127.0.0.1:8000
- `-reload` enables auto-reloading when code changes

### 4️⃣ Test the API with Swagger UI
Open your browser:
```bash
http://127.0.0.1:8000/docs
```


