# Frontend Docker Setup

## Overview

The frontend is containerized using Docker with Nginx serving the built React application.

## Quick Start

### 1. Build the React app
```bash
npm install
npm run build
```

### 2. Start the container
```bash
chmod +x start.sh stop.sh
./start.sh
```

### 3. Access the app
Open browser: **http://localhost**

## How It Works

1. **Dockerfile** - Creates an Nginx container with your React app
2. **nginx-docker.conf** - Configures Nginx to:
   - Serve your React static files
   - Proxy `/api/*` requests to backend container
   - Strip `/api` prefix before forwarding (backend routes don't include `/api`)
   - Handle React Router (SPA routing)
3. **docker-compose.yml** - Manages the container lifecycle

## Connecting with Backend

The nginx config proxies API requests to the backend container:

```nginx
location /api/ {
    rewrite ^/api/(.*) /$1 break;  # Strips /api prefix
    proxy_pass http://backend:8000;
}
```

**Example:**
- Frontend calls: `http://localhost/api/auth/google`
- Nginx forwards to: `http://backend:8000/auth/google`

**Important:** Both containers must be on the same Docker network (`stockd-network`)

## Commands

```bash
# Start container
./start.sh

# Stop container
./stop.sh

# View logs
docker-compose logs -f frontend

# Restart after changes
npm run build
docker-compose restart frontend

# Rebuild container
docker-compose up -d --build
```

## Configuration

### Change Port
If port 80 is busy, edit `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Changed from "80:80"
```
Then access: http://localhost:8080

### Backend Connection
Make sure backend container is running:
```bash
cd ../Backend
./start.sh
```

Both containers must use the same network name in their `docker-compose.yml`:
```yaml
networks:
  stockd-network:
    driver: bridge
    name: stockd-network
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs frontend

# Check if port is in use
lsof -i :80

# Remove and recreate
docker-compose down
docker-compose up -d
```

### Changes not showing
```bash
# Rebuild React app
npm run build

# Restart container
docker-compose restart frontend

# Hard refresh browser (Cmd+Shift+R)
```
Then access: http://localhost:8080

### API calls failing (404)
- Make sure backend container is running: `docker ps | grep stockd-backend`
- Check both containers are on same network: `docker network inspect stockd-network`
- Check nginx logs: `docker-compose logs frontend`

### API calls failing (500)
- This is a backend error, not nginx/docker
- Check backend logs: `cd ../Backend && docker-compose logs backend`
- Check backend environment variables in `.env`

## Development Workflow

### For active development:
Use the dev server (hot reload):
```bash
npm run dev
```

### For testing production build:
Use Docker container:
```bash
npm run build
./start.sh
```

## Notes

- The `dist` folder is mounted as a volume, so rebuilding React updates the container automatically
- No need to rebuild the Docker image for frontend code changes
- Just run `npm run build` and restart the container
- Backend must be running for API calls to work
