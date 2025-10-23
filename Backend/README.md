# 🚀 Stockd: Backend Repo

## `.env`
```
ASPRISE_API_URL=xxx
ASPRISE_CLIENT_ID=TEST

GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_TOKEN_URI=xxx
GOOGLE_CLOCK_SKEW=300

DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=stockd_db
```

## Backend Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/stockd-app/Stockd.git
cd Backend
```

### 2️⃣ Install dependencies
```bash
pip install -r requirements.txt
```

### 3️⃣ Configure Environment Variables
Ensure `.env` is present and configured as shown above


### 4️⃣ Run main.py
```bash
uvicorn app.main:app --reload
```
- The server will run at: http://127.0.0.1:8000
- `-reload` enables auto-reloading when code changes

### 5️⃣ Test the API with Swagger UI
Open your browser:
```bash
http://127.0.0.1:8000/docs
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
