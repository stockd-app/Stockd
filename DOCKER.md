# Docker Setup and Commands

This guide contains all Docker-related commands and configurations for running Stockd with Docker.

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
- AI Food Classifier on `http://localhost:9002`
- AI Recipe Recommender on `http://localhost:9001`

### 5. Stop All Services

```bash
./stop-all.sh
```

## Health Checks

Each service in `docker-compose.yml` has health check configurations that Docker monitors automatically. Used kuma for status monitoring of each service. Will configure email alerts when deployed to AWS.

### 1. Health Check Endpoints

- **Backend**: `http://localhost:8000/health`
- **Food Classifier**: `http://localhost:9002/health`
- **Recipe Recommender**: `http://localhost:9001/health`
- **Frontend**: `http://localhost:80/` (Nginx default)
- **Database**: MySQL ping command

### 2. Basic Monitoring

#### Check Container Health Status

```bash
docker compose ps
```

Shows health status: `healthy`, `unhealthy`, or `starting`

#### View Detailed Health Check Logs

```bash
docker inspect stockd-backend | grep -A 10 Health
```

#### Monitor All Services

```bash
watch -n 5 'docker compose ps'
```

Refreshes every 5 seconds to show real-time status

### 3. What Happens When a Service Fails?

1. **Docker detects failure** after 3 failed health checks (90 seconds)
2. **Container marked as unhealthy** (visible in `docker compose ps`)
3. **Container automatically restarts** (due to `restart: unless-stopped`)
4. **Dependent services wait** for healthy status before starting

## Useful Docker Commands

### View Logs

```bash
# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f food-classifier
docker-compose logs -f recipe-recommender
docker-compose logs -f database
```

### Restart Services

```bash
# Restart a specific service
docker-compose restart frontend
docker-compose restart backend
docker-compose restart food-classifier
docker-compose restart recipe-recommender
docker-compose restart food-database
```

### Container Management

```bash
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

## Mobile Testing with Docker

### Using Local Network

1. Find your computer's local IP address:

   ```bash
   # macOS/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. Access from mobile: `http://YOUR_LOCAL_IP` (e.g., `http://192.168.1.100`)

## Deployment with ngrok

To test Stockd on your mobile browser:

1. Have all the services running (Frontend, Backend, Recipe Recommender, Food Classifier)
2. In a new terminal run:
   ```bash
   ngrok http 5173 --log=stdout --log-level=info
   ```
3. The new URL needs to be added to Google Console for authentication under:
   - Authorized JavaScript origins
   - Authorized redirect URIs
   - Also remember to add the `/api` prefix to your `VITE_API_BASE_URL` within your Frontend's `.env`
4. Access Stockd using the URL given by ngrok

---

For non-Docker development setup, see the main [README.md](./README.md).