# 🔧 Stockd Backend

FastAPI-based backend server for the Stockd virtual pantry management system.

## 🛠️ Tech Stack

- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL/MySQL** - Database
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server
- **Docker** - Containerization

## 📋 Prerequisites

- Python 3.9+
- MySQL/PostgreSQL (if running without Docker)
- Docker Desktop (for containerized setup)

## 🚀 Running the Backend

### Option 1: With Docker Container (Recommended for Production)

**From Project Root:**
```bash
# Start all services (Backend + Frontend together)
./start-all.sh

# Stop all services
./stop-all.sh
```

**Setup Steps:**
```bash
cd Backend

# Set up environment variables
cp .env-sample .env
# Edit .env with your database credentials and API keys

# Then start from project root
cd ..
./start-all.sh
```

Access the API at: **http://localhost:8000**  
API Documentation: **http://localhost:8000/docs**

### Option 2: Without Docker (Development Mode)

For active development with hot reload:

```bash
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env-sample .env
# Edit .env with your configuration

# Run development server with hot reload
uvicorn app.main:app --reload
```

Access the API at: **http://localhost:8000**  
API Documentation: **http://localhost:8000/docs**

**Note:** Make sure your database is running and configured in `.env` before starting.

## 📁 Project Structure

```
Backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── routes.py            # API route definitions
│   ├── database/            # Database models and connection
│   │   ├── database.py      # Database connection
│   │   ├── models.py        # SQLAlchemy models
│   │   └── test_db.py       # Database connection test
│   ├── dependencies/        # Dependency injection
│   │   └── auth.py          # Authentication dependencies
│   └── utils/               # Utility functions
│       ├── ai_classifier.py # AI model integration
│       ├── ai_recommender.py
│       └── receipt_parser.py
├── Dockerfile               # Docker container definition
├── requirements.txt         # Python dependencies
└── .env                     # Environment variables (create from .env-sample)
```

## 🗄️ Database Setup

### Option 1: Using MySQL (XAMPP)

#### 1️⃣ Install XAMPP
- Download and install [XAMPP](https://www.apachefriends.org/index.html)
- Start Apache and MySQL from XAMPP Control Panel

#### 2️⃣ Create Database
```bash
# Navigate to MySQL bin folder
cd C:\xampp\mysql\bin  # Windows
# OR
cd /Applications/XAMPP/bin  # macOS

# Login to MySQL
mysql -u root -p
# Press Enter if no password is set
```

```sql
-- Create database
CREATE DATABASE stockd_db;
USE stockd_db;

-- Run the schema from Database/schema.sql
-- Copy and paste the SQL commands from that file
```

#### 3️⃣ Configure .env
```env
DATABASE_URL=mysql://root:@localhost/stockd_db
```

#### 4️⃣ Test Connection
```bash
cd Backend/app/database
python test_db.py
```

### Option 2: Using PostgreSQL

```bash
# Install PostgreSQL
# Create database
createdb stockd_db

# Configure .env
DATABASE_URL=postgresql://username:password@localhost/stockd_db
```

## 🔧 Available Commands

### With Docker
```bash
# View logs
docker-compose logs -f backend

# Restart after code changes
docker-compose restart backend

# Rebuild container
docker-compose up -d --build backend

# Access container shell
docker exec -it stockd-backend bash
```

### Without Docker
```bash
# Run with hot reload (development)
uvicorn app.main:app --reload

# Run on different port
uvicorn app.main:app --reload --port 8001

# Run with specific host
uvicorn app.main:app --reload --host 0.0.0.0

# Run tests
pytest

# Check code style
flake8 app/
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/google` - Google OAuth login
- `GET /auth/verify` - Verify authentication token

### Pantry Management
- `GET /pantry` - Get user's pantry items
- `POST /pantry/item` - Add item to pantry
- `PUT /pantry/item/{id}` - Update pantry item
- `DELETE /pantry/item/{id}` - Remove item from pantry

### Receipt Processing
- `POST /receipt/upload` - Upload and process receipt
- `GET /receipt/history` - Get receipt history

### AI Features
- `POST /ai/classify` - Classify food item
- `POST /ai/recommend` - Get recipe recommendations

For complete API documentation, visit: **http://localhost:8000/docs**

## ⚙️ Environment Variables

Create `.env` from `.env-sample` and configure:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Receipt OCR
ASPRISE_API_KEY=your_asprise_api_key

# Database
DATABASE_URL=mysql://root:@localhost/stockd_db

# JWT Secret (generate a secure random string)
JWT_SECRET=your_jwt_secret_key

# AI Model URLs (if using separate AI services)
AI_CLASSIFIER_URL=http://localhost:9000
AI_RECOMMENDER_URL=http://localhost:9001
```

## 🐳 Docker Setup Details

### How It Works

1. **Dockerfile** - Creates a Python container with FastAPI
2. **docker-compose.yml** (in project root) - Manages all containers
3. **Volumes** - Code is mounted so changes reflect immediately
4. **Network** - Uses `stockd-network` to connect with frontend

### Connecting with Frontend

The frontend Nginx container can reach this backend at:
```
http://backend:8000
```

Both containers must be on the same Docker network (`stockd-network`).

## 🛠️ Development Workflow

### For Active Development (Hot Reload)
```bash
# Without Docker
uvicorn app.main:app --reload
```
Changes reflect immediately without restarting.

### For Testing with Docker
```bash
# Code changes reflect automatically due to volume mounting
# Just save your files

# If changes don't reflect, restart:
docker-compose restart backend
```

### After Dependency Changes
```bash
# Rebuild container
docker-compose up -d --build backend
```

## 🐛 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Check if .env file exists
ls -la .env

# Verify environment variables
docker-compose config
```

### Port 8000 Already in Use
```bash
# Find what's using the port
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Or change port in docker-compose.yml
ports:
  - "8001:8000"
```

### Database Connection Errors
```bash
# Test database connection
cd app/database
python test_db.py

# Check DATABASE_URL in .env
# Ensure database server is running
```

### Import Errors
```bash
# Reinstall dependencies
pip install -r requirements.txt

# Or rebuild Docker container
docker-compose up -d --build backend
```

### Changes Not Reflecting
```bash
# With Docker (code is mounted as volume)
docker-compose restart backend

# Without Docker (should auto-reload)
# Check if --reload flag is used
uvicorn app.main:app --reload
```

### API Returns 500 Errors
```bash
# Check backend logs
docker-compose logs backend

# Or without Docker
# Check terminal where uvicorn is running
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Uvicorn Documentation](https://www.uvicorn.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)

## 🧪 Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_routes.py
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally: `uvicorn app.main:app --reload`
4. Test with Docker: `docker-compose restart backend`
5. Submit a pull request

---

For frontend setup, see [Frontend README](../Frontend/README.md)
