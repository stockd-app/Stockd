# Stockd - Virtual Pantry Management System

A smart pantry management application that helps you track food items, reduce waste, and get recipe recommendations based on what you have.

## Table of Contents

- [Features](#features)
- [Quick Start (Docker)](#quick-start-docker)
- [Development Setup](#development-setup)
- [Mobile Testing](#mobile-testing)
- [Troubleshooting](#troubleshooting)

## Features

- **Receipt Scanning**: Upload receipts to automatically add items to your pantry
- **AI-Powered Classification**: Automatically categorize food items
- **Recipe Recommendations**: Get recipe suggestions based on available ingredients


## Quick Start (Docker)

This is the **easiest way** to run the entire application with all services.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Stockd
```

### 2. Set Up Environment Variables

**Backend:**

```bash
cd Backend
cp .env-sample .env
# Edit .env with your database credentials and API keys
cd ..
```

**Frontend:**

```bash
cd Frontend
cp .env-sample .env
# Edit .env with your configuration
cd ..
```

### 3. Build Frontend

```bash
cd Frontend
npm install
npm run build
cd ..
```

### 4. Start All Services

```bash
chmod +x start-all.sh stop-all.sh
./start-all.sh
```

This will start:

- Frontend on `http://localhost` (port 80)
- Backend on `http://localhost:8000`

### 5. Stop All Services

```bash
./stop-all.sh
```

## Development Setup

If you want to run services individually without Docker for development:

### Backend (Without Docker)

```bash
cd Backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env-sample .env
# Edit .env with your credentials

# Run development server
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

### Frontend (Without Docker)

```bash
cd Frontend

# Install dependencies
npm install

# Set up environment
cp .env-sample .env
# Edit .env with your configuration

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

For detailed instructions, see:

- [Frontend README](./Frontend/README.md)
- [Backend README](./Backend/README.md)

## Mobile Testing

### Using Local Network

1. Find your computer's local IP address:

   ```bash
   # macOS/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. Access from mobile: `http://YOUR_LOCAL_IP` (e.g., `http://192.168.1.100`)

## Useful Docker Commands

```bash
# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f frontend
docker-compose logs -f backend

# Restart a specific service
docker-compose restart frontend
docker-compose restart backend

# View running containers
docker-compose ps

# Rebuild containers after code changes
docker-compose up -d --build

# Remove all containers and networks
docker-compose down

# Remove containers, networks, and volumes
docker-compose down -v
```

## Troubleshooting

### Frontend can't connect to Backend

- Ensure both containers are running: `docker-compose ps`
- Check they're on the same network: `docker network inspect stockd-network`
- View backend logs: `docker-compose logs backend`

### Port Already in Use

```bash
# Stop conflicting services
docker-compose down

# Or change ports in docker-compose.yml
```

### Database Connection Issues

- Verify `.env` file exists in Backend folder
- Check database credentials in `.env`

### Frontend Build Issues

```bash
cd Frontend
rm -rf node_modules dist
npm install
npm run build
```

### Docker Issues

```bash
# Restart Docker Desktop
# Then rebuild containers
docker-compose down
docker-compose up -d --build
```

---

Made with ❤️ by the Stockd Team
