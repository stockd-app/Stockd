# Backend Structure

## Overview

The Stockd backend is built with **FastAPI** and acts as the central hub connecting the frontend, AI services, OCR, and database. It handles:

- Receipt processing (via Asprise OCR and Food Classifier)
- Pantry management
- Personalized recipe recommendations
- Caching for speed and scalability

The backend is modular, asynchronous, and designed to scale, ensuring smooth performance even as more users join.

---

## 📂 Folder Structure
```
Backend/
├── app/
│   ├── models/          # Database models
│   ├── routes/          # API endpoints
│   ├── services/        # AI orchestration, OCR, recipe recommendations
│   └── database/        # Database connection and test scripts
├── Dockerfile           # Backend container build
├── docker-compose.yml   # Container orchestration
├── start.sh / stop.sh   # Start/stop container scripts
└── requirements.txt     # Python dependencies
```

### Key Tables

| Table | Purpose |
|-------|---------|
| users | Stores user profiles, roles, and allergen preferences |
| pantry_items | Tracks ingredients with quantity and storage info |
| liked_recipes | Records recipes liked by users |
| item_classifications | Cached food classification data |
| foodimagecache | Stores pantry item images for faster loading |
| audit_logs | Logs database activity for debugging and audits |

### External APIs

| API / Library         | Purpose                                    | Notes                             |
| --------------------- | ------------------------------------------ | --------------------------------- |
| Asprise OCR           | Converts receipt images to structured text | Fast (~4–5 sec)                   |
| Food Classifier AI    | Categorizes pantry items                   | Runs on local service (Port 9002) |
| Recipe Recommender AI | Generates personalized recipe suggestions  | AI service integrated via backend |
| Python Libraries      | FastAPI, SQLAlchemy, Requests, etc.        | Backend dependencies              |

### FastAPI Endpoints Example

| Endpoint             | Method              | Description                                                  |
| -------------------- | ------------------- | ------------------------------------------------------------ |
| `/upload-receipt`    | POST                | Receives receipt image, returns structured pantry items      |
| `/pantry`            | GET / POST / DELETE | Fetch, add, or remove pantry items                           |
| `/recipes/recommend` | GET                 | Returns personalized recipes based on pantry and preferences |

<img width="1365" height="905" alt="image" src="https://github.com/user-attachments/assets/bcd984fe-04e5-4250-9ceb-c0752929e756" />
<img width="1342" height="917" alt="image" src="https://github.com/user-attachments/assets/237bd7df-c4e7-4a66-b2cd-8918ab2ddeec" />

### Rate Limiting
- `upload_recipe`: 5 requests per minute
- Other routes: 10 requests per minute
- No rate limiting on `pantry-items` and `recipe recommendation` routes, as they are frequently called by the UI and limiting them would affect user experience.

### Performance & Caching

| Cache Type | Purpose | Benefit |
|------------|---------|---------|
| Receipt Cache | Stores OCR and classification results | Avoids reprocessing identical receipts (~4–5 min → 30 sec) |
| Pantry Image Cache | Stores frequently used food images | Faster pantry load and improved UI responsiveness |
| Recipe & Category Cache | Stores previous recipe queries | Instant results for repeated queries, fewer API calls |


## Quick Start

### 1️⃣ Setup environment
```bash
# Copy sample env file
cp .env-sample .env

# Edit .env with your credentials
```

### 2️⃣ Start container
```bash
chmod +x start.sh stop.sh
./start.sh
```

### 3️⃣ Access the API
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

## Commands

```bash
# Start container
./start.sh

# Stop container
./stop.sh

# View logs
docker-compose logs -f backend

# Restart after changes
docker-compose restart backend
```

## How It Works

1. **Dockerfile** - Creates a Python container with FastAPI
2. **docker-compose.yml** - Manages the container
3. **Volumes** - Code is mounted so changes reflect immediately
4. **Network** - Uses `stockd-network` to connect with frontend

## Connecting with Frontend

The frontend Nginx container can reach this backend at:
```
http://backend:8000
```

Update `Frontend/nginx-docker.conf`:
```nginx
location /api/ {
    proxy_pass http://backend:8000;
}
```
## Database Setup

### 1️⃣ Install dependencies
- Install [XAMPP](https://www.apachefriends.org/index.html) to run MySQL locally
- ```pip install -r requirements.txt```

### 2️⃣ Set up MySQL Database
- Open XAMPP and start Apache and MySQL
<img width="709" height="161" alt="image" src="https://github.com/user-attachments/assets/113800c4-e86f-4046-9bc4-1662f0214d4d" />

- Open CMD and navigate to MySQL bin folder: `cd C:\xampp\mysql\bin`
- Login to MySQL
```
mysql -u root -p
# Enter your MySQL root password if you set one, otherwise press Enter
```
- Create the database
```
CREATE DATABASE stockd_db;
USE stockd_db;
```
- Create the tables by copying the SQL code from `Database/schema.sql` and executing it in MySQL

### 3️⃣ Configure Environment Variables
Ensure `.env` is present and configured as shown above
_Note: For now, the project works without .env because default MySQL root access is used_

### 4️⃣ Test Database Connection
- Navigate to `cd Backend/app/database`
- Run: `python test_db.py`
- You should see success message with list of tables made

## Environment Variables

Required in `.env`:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `ASPRISE_API_KEY`
- `DATABASE_URL` (if using database)

## Troubleshooting

### Container won't start
```bash
docker-compose logs backend
```

### Port 8000 in use
Edit `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"
```

### Changes not reflecting
Code is mounted as volume, so changes should reflect automatically. If not:
```bash
docker-compose restart backend
```

*Caching significantly reduces backend load and improves user experience.*
