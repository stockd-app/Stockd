# Backend Docker Setup

## Overview

The backend is containerized using Docker running FastAPI with Uvicorn.

## Quick Start

### 1. Setup environment
```bash
# Copy sample env file
cp .env-sample .env

# Edit .env with your credentials
```

### 2. Start container
```bash
chmod +x start.sh stop.sh
./start.sh
```

### 3. Access the API
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
